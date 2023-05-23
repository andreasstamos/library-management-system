from flask import Blueprint, request, g, jsonify
import jsonschema
import psycopg2.sql
import psycopg2.extras
from flask_jwt_extended import jwt_required, get_jwt_identity
from .roles_decorators import check_roles



bp = Blueprint("lib-api", __name__)



@bp.route("/get-users-active-status/", methods=["POST"])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def get_deactivated_users():
    data = request.get_json()


    # if boolean = true: We will get the activated users. Otherwise we will get the deactivated users.
    boolean = True
    if data['action'] == 'activate':
        boolean = False
    else:
        boolean = True
    print(boolean)
    
    user = get_jwt_identity()
    print(user)
    if user['role'] != 'lib_editor':
        return {'success': False, 'error': 'Unauthorized user'}, 401
    school_id = user['school_id']
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'student' AS role
            FROM "user"
            INNER JOIN student ON student.user_id = "user".user_id 
            WHERE school_id=(%s) AND active=(%s)
            UNION
            SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'teacher' AS role 
            FROM "user"
            INNER JOIN teacher ON teacher.user_id = "user".user_id
            WHERE school_id=(%s) AND active=(%s)""", [school_id, boolean,school_id, boolean])
            results = cur.fetchall()
            return {"success": True, "users": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}



@bp.route("/change-active-user/", methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def activate_user():
    change_user_active = {
        "type": "object",
        "properties": {
            "user_id": {"type": "integer"},
            "action": {"type": "string"}, #date expected in ISO8601 format
            },
        "additionalProperties": False,
        "required": ["user_id", "action"]
        }
    data = request.get_json()
    user = get_jwt_identity()
    if user['role'] != 'lib_editor' or not user['school_id']:
        return {'success': False, 'error': 'Unauthorized user'}, 401
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            if data['action'] == 'activate':
                cur.execute("""UPDATE "user" 
                SET active = true 
                WHERE "user".school_id = (%s) AND "user".user_id = (%s)
                AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
                ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'],data['user_id'],))
            else:
                cur.execute("""UPDATE "user" 
                SET active = false WHERE "user".school_id = (%s) AND "user".user_id = (%s)
                AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
                ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'], data['user_id'],))
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400



@bp.route('/get-borrows/', methods=['POST'])
@check_roles(['lib_editor'])
def get_borrows():
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all bookings from specific school
            cur.execute("""
                SELECT borrow.item_id, lender.username AS lender, borrower.username AS borrower, LOWER(borrow.period) AS borrowed_on, expected_return, book.title, book.isbn AS isbn
                FROM borrow
                INNER JOIN "user" AS lender ON borrow.lender_id = lender.user_id AND lender.school_id = (%s)
                INNER JOIN "user" AS borrower ON borrow.borrower_id = borrower.user_id AND borrower.school_id = (%s)
                INNER JOIN item ON item.item_id = borrow.item_id
                INNER JOIN book ON item.isbn = book.isbn
            """, [user['school_id'], user['school_id']])
            borrows = cur.fetchall()
            return {"success": True, "borrows": borrows}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@bp.route('/get-reviews/', methods=['POST'])
@check_roles(["lib_editor"])
def get_reviews():
    GET_REVIEWS_JSON = {
        "type": "object",
        "properties": {
            # do we want activated reviews or not...?
            "active": {"type": "boolean"},
            },
        "additionalProperties": False,
        "required": ["active"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_REVIEWS_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all non active reviews from users that are in the same school as the lib editor.
            cur.execute("""
                SELECT review.review_id, review.body, review.active, book.isbn, book.title, "user".username,
                ARRAY_AGG(author.author_name) AS authors
                FROM review
                INNER JOIN book ON book.isbn = review.isbn
                INNER JOIN book_author ON book_author.isbn = review.isbn
                INNER JOIN author ON book_author.author_id = author.author_id
                INNER JOIN "user" ON "user".user_id = review.user_id
                WHERE review.active = (%s) AND "user".school_id = (%s)
                GROUP BY review.review_id, book.isbn, review.body, "user".username
            """, [data['active'], user['school_id']])
            results = cur.fetchall()
            return {"success": True, "reviews": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


@bp.route('/change-review-status/', methods=['POST'])
@check_roles(["lib_editor"])
def activate_reviews():

    ACTIVATE_REVIEW_JSON = {
        "type": "object",
        "properties": {
            "review_id": {"type": "integer"},
            'active': {'type': 'boolean'}
            },
        "additionalProperties": False,
        "required": ["review_id", 'active']
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, ACTIVATE_REVIEW_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            # Library user must be in the same school with the user that has written the review....
            cur.execute("""
                UPDATE review 
                SET active=(%s)
                WHERE review.review_id = (%s) AND active=(%s)
                AND EXISTS(SELECT 1 
                FROM "user"
                INNER JOIN school on "user".school_id=(%s)
                WHERE "user".user_id = review.user_id)
            """, [data['active'],data['review_id'], not data['active'],user['school_id']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200



@bp.route('/delete-review/', methods=['POST'])
@check_roles(["lib_editor"])
def delete_review():
    DELETE_REVIEW_JSON = {
        'type': 'object',
        "properties": {
            "review_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["review_id"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_REVIEW_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:

            # Library editor needs to be at the same school as the user that has his review deleted!
            query = psycopg2.sql.SQL("""
            DELETE FROM review
            WHERE review_id IN (
                SELECT review.review_id
                FROM review
                INNER JOIN "user" 
                ON "user".user_id = review.user_id AND "user".school_id = (%s)
                WHERE review_id = (%s)
            )""")
            
            cur.execute(query, [user['school_id'], data['review_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
    



# QUERIES GO HERE..

# 3.2.1
@bp.route('/queries/3_2_2/', methods=['POST'])
@check_roles(["lib_editor"])
def get_late_borrowers():
    LATE_BORROWERS_JSON = {
        'type': 'object',
        "properties": {
            "first_name": {"type": "string"},
            "last_name": {'type': 'string'},
            "dates_late": {'type': 'integer', 'minValue': 0},
            },
        "additionalProperties": False,
        "required": []
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, LATE_BORROWERS_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    user = get_jwt_identity()


    # if no dates lates filter has been set then get everything...
    if 'dates_late' not in data.keys():
        data['dates_late'] = 0

    params = [user['school_id'], str(data['dates_late'])]
    first_name_where_clause = ''
    last_name_where_clause = ''
    
    if 'first_name' in data.keys():
        first_name_where_clause = 'AND first_name ILIKE %s'
        params.append(f"%{data['first_name']}%")
    if 'last_name' in data.keys():
        last_name_where_clause = 'AND last_name ILIKE %s'
        params.append(f"%{data['last_name']}%")

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all non active reviews from users that are in the same school as the lib editor.
            cur.execute(f"""
                    SELECT user_id, first_name || ' ' || last_name AS full_name, borrow.expected_return, EXTRACT(DAY FROM AGE(NOW()::date, borrow.expected_return::date)) AS date_difference
                    FROM "user"
                    INNER JOIN borrow ON borrower_id = user_id
                    WHERE "user".school_id = (%s) AND EXTRACT(DAY FROM AGE(NOW()::date, borrow.expected_return::date)) >= (%s) 
                    {first_name_where_clause}
                    {last_name_where_clause}
                    ORDER BY date_difference DESC
            """, params)
            users = cur.fetchall()
            return {"success": True, "users": users}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}
