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
                array_remove(array_agg(DISTINCT book_author.author_name), NULL) AS authors
                FROM review
                INNER JOIN book ON book.isbn = review.isbn
                INNER JOIN book_author ON book_author.isbn = review.isbn
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
        "required": ["review_id"]
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
