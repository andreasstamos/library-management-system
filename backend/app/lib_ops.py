from flask import Blueprint, request, g, jsonify
import jsonschema
import psycopg2.sql
import psycopg2.extras
from flask_jwt_extended import jwt_required, get_jwt_identity
from .roles_decorators import check_roles
from datetime import datetime

import latex

bp = Blueprint("lib-api", __name__)


@bp.route('/update-user/', methods=['POST'])
@check_roles(['lib_editor'])
def edit_user():
    
    data = request.get_json()
    UPDATE_USER = {
        "type": "object",
        "properties": {
            'user_id': {'type': 'integer', 'minValue': 0},
            "username": {"type": "string", "minLength": 3},
            "email": {"type": "string", "minLength":5},
            'first_name': {"type": "string", "minLength": 3},
            "last_name": {"type": "string", "minLength":3},
            'dob': {'type':'string'},
            'active': {'type': 'boolean'}
            },
        "additionalProperties": False,
        "required": ["username", 'email', 'first_name', 'last_name', 'user_id']
    }
    
    try:
        jsonschema.validate(data, UPDATE_USER)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    normalized_datetime = datetime.strptime(data['dob'], "%Y-%m-%dT%H:%M:%S.%fZ")
    normalized_date = normalized_datetime.date()
    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            # Update user profile. P.S: Users must be either a teacher or a student at the same school as the library editor....
            # the last two school_id checks are unneeded but whatever...
            cur.execute("""
                UPDATE "user" 
                SET
                username = (%s),
                email = (%s),
                first_name = (%s),
                last_name = (%s),
                dob = (%s),
                active = (%s)
                WHERE "user".user_id = (%s) AND "user".school_id = (%s) AND "user".user_id IN (
                    SELECT "user".user_id
                    FROM "user"
                    INNER JOIN teacher ON "user".user_id = teacher.user_id AND "user".school_id = (%s)
                    UNION
                    SELECT "user".user_id
                    FROM "user"
                    INNER JOIN student ON "user".user_id = student.user_id AND "user".school_id=(%s)
                )
            """, [data['username'], data['email'].lower(),data['first_name'].title(), data['last_name'].title(), normalized_date,data['active'],data['user_id'], user['school_id'], user['school_id'], user['school_id']])
            g.db_conn.commit() 
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200

@bp.route('/get-users/', methods=['POST'])
@check_roles(['lib_editor'])
def get_users():
    GET_USERS = {
        "type": "object",
        "properties": {
            'active': {'type': 'boolean'}
            },
        "additionalProperties": False,
        "required": ["active"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_USERS)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'student' AS role, "user".dob
            FROM "user"
            INNER JOIN student ON student.user_id = "user".user_id 
            WHERE school_id=(%s) AND active=(%s)
            UNION
            SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'teacher' AS role, "user".dob
            FROM "user"
            INNER JOIN teacher ON teacher.user_id = "user".user_id
            WHERE school_id=(%s) AND active=(%s)""", [user['school_id'], data['active'],user['school_id'], data['active']])
            results = cur.fetchall()
            return {"success": True, "users": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}
    

@bp.route('/delete-user/', methods=['POST'])
@check_roles(['lib_editor'])
def delete_user():
    data = request.get_json()

    DELETE_USER_JSON = {
        "type": "object",
        "properties": {
            'user_id': {'type': 'integer', 'minValue': 0},
            },
        "additionalProperties": False,
        "required": ["user_id"]
    }

    try:
        jsonschema.validate(data, DELETE_USER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor() as cur:
            #We must make sure the user being delete is actually a library editor!
            query = psycopg2.sql.SQL("""
            DELETE FROM "user" 
            WHERE "user".user_id = (%s) AND "user".school_id = (%s)
            AND EXISTS (
            SELECT 1
            FROM teacher
            WHERE teacher.user_id = (%s)
            UNION
            SELECT 1
            FROM student
            WHERE student.user_id = (%s)
            )
           """)
            cur.execute(query, [data['user_id'], user['school_id'], data['user_id'], data['user_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400

# @bp.route("/get-users-active-status/", methods=["POST"])
# @jwt_required(refresh=False,locations=['headers'], verify_type=False)
# def get_deactivated_users():
#     data = request.get_json()


#     # if boolean = true: We will get the activated users. Otherwise we will get the deactivated users.
#     boolean = True
#     if data['action'] == 'activate':
#         boolean = False
#     else:
#         boolean = True
#     print(boolean)
    
#     user = get_jwt_identity()
#     print(user)
#     if user['role'] != 'lib_editor':
#         return {'success': False, 'error': 'Unauthorized user'}, 401
#     school_id = user['school_id']
    
#     try:
#         with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
#             cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
#             "user".email,"user".active, 'student' AS role
#             FROM "user"
#             INNER JOIN student ON student.user_id = "user".user_id 
#             WHERE school_id=(%s) AND active=(%s)
#             UNION
#             SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
#             "user".email,"user".active, 'teacher' AS role 
#             FROM "user"
#             INNER JOIN teacher ON teacher.user_id = "user".user_id
#             WHERE school_id=(%s) AND active=(%s)""", [school_id, boolean,school_id, boolean])
#             results = cur.fetchall()
#             return {"success": True, "users": results}, 200
#     except psycopg2.Error as err:
#         print(err)
#         return {"success": False, "error": "unknown"}



# @bp.route("/change-active-user/", methods=['POST'])
# @jwt_required(refresh=False,locations=['headers'], verify_type=False)
# def activate_user():
#     change_user_active = {
#         "type": "object",
#         "properties": {
#             "user_id": {"type": "integer"},
#             "action": {"type": "string"}, #date expected in ISO8601 format
#             },
#         "additionalProperties": False,
#         "required": ["user_id", "action"]
#         }
#     data = request.get_json()
#     user = get_jwt_identity()
#     if user['role'] != 'lib_editor' or not user['school_id']:
#         return {'success': False, 'error': 'Unauthorized user'}, 401
    
#     try:
#         with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
#             if data['action'] == 'activate':
#                 cur.execute("""UPDATE "user" 
#                 SET active = true 
#                 WHERE "user".school_id = (%s) AND "user".user_id = (%s)
#                 AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
#                 ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'],data['user_id'],))
#             else:
#                 cur.execute("""UPDATE "user" 
#                 SET active = false WHERE "user".school_id = (%s) AND "user".user_id = (%s)
#                 AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
#                 ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'], data['user_id'],))
#             g.db_conn.commit()
#             return {"success": True}, 200
#     except psycopg2.IntegrityError as err:
#         g.db_conn.rollback()
#         return {"success": False, "error": err.pgerror}, 400
#     except psycopg2.Error as err:
#         g.db_conn.rollback()
#         print(err)
#         return {"success": False, "error": "unknown"}, 400



@bp.route('/get-borrows/', methods=['POST'])
@check_roles(['lib_editor'])
def get_borrows():
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all bookings from specific school
            cur.execute("""
                SELECT borrow.borrow_id, borrow.item_id,
                lender_id, lender.username AS lender_username, lender.first_name AS lender_first_name, lender.last_name AS lender_last_name,
                borrower_id, borrower.username AS borrower_username, borrower.first_name as borrower_first_name, borrower.last_name AS borrower_last_name,
                LOWER(borrow.period) AS borrowed_on, UPPER(borrow.period) as returned_on, expected_return, book.title, book.isbn,
                NOW()::date <= expected_return as time_valid
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
                    SELECT user_id, username, first_name || ' ' || last_name AS full_name,
                    MIN(borrow.expected_return), MAX(EXTRACT(DAY FROM AGE(NOW()::date, borrow.expected_return::date))) AS date_difference,
                    COUNT(1) AS cnt
                    FROM "user"
                    INNER JOIN borrow ON borrower_id = user_id
                    WHERE "user".school_id = (%s) AND EXTRACT(DAY FROM AGE(NOW()::date, borrow.expected_return::date)) >= (%s) 
                    {first_name_where_clause}
                    {last_name_where_clause}
                    GROUP BY "user".user_id
                    ORDER BY date_difference DESC
            """, params)
            users = cur.fetchall()
            return {"success": True, "users": users}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}


@bp.route("/queries/average-rating-per-category/", methods=['POST'])
@check_roles(['lib_editor'])
def average_ratings_per_category():
    AVERATE_RATING_PER_CATEGORY_JSON = {
        'type': 'object',
        "properties": {
                "category_id": {'type':'integer', 'minValue': 0}
            },
        "additionalProperties": False,
        "required": []
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, AVERATE_RATING_PER_CATEGORY_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    user = get_jwt_identity()

    params = []
    where_clause = []
    if 'category_id' in data.keys():
        where_clause.append("category.category_id = %s")
        params.append(data['category_id'])
    #borrowed not required according to Discord answer
    #where_clause.append("EXISTS (SELECT 1 FROM item JOIN borrow USING (item_id) WHERE review.user_id = borrow.borrower_id AND item.isbn = review.isbn)")
    where_clause = ' AND '.join(where_clause)
    where_clause = f"WHERE {where_clause}"
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Counting avg rating per category using reviews by ALL users of database (not only same school reviews)
            cur.execute(f"""
                SELECT category.category_id, category.category_name, AVG(review.rate)
                FROM review
                INNER JOIN book_category ON book_category.isbn = review.isbn
                INNER JOIN category ON category.category_id = book_category.category_id
                {where_clause}
                GROUP BY category.category_id
            """, params)
            reviews = cur.fetchall()
            return {"success": True, "reviews": reviews}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}



@bp.route('/queries/average-rating-per-borrower/', methods=['POST'])
@check_roles(['lib_editor'])
def average_rating_per_borrower():
    AVERAGE_RATING_PER_BORROWER = {
        'type': 'object',
        "properties": {
                "first_name": {'type':'string'},
                "last_name": {'type': 'string'}
            },
        "additionalProperties": False,
        "required": []
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, AVERAGE_RATING_PER_BORROWER)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    user = get_jwt_identity()
    where_clause = []
    params = {'school_id': user['school_id']}
    for fieldname in data.keys():
        where_clause.append(f"{fieldname} ILIKE %({fieldname})s")
        params[fieldname] = data[fieldname]

    where_clause.append("school_id = %(school_id)s")
    where_clause.append("EXISTS (SELECT 1 FROM item JOIN borrow USING (item_id) WHERE review.user_id = borrow.borrower_id AND item.isbn = review.isbn)")
    where_clause = ' AND '.join(where_clause)
    where_clause = f"WHERE {where_clause}"
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"""
                SELECT "user".user_id, "user".first_name, "user".last_name, "user".username, AVG(review.rate)
                FROM review
                INNER JOIN "user" ON "user".user_id = review.user_id
                {where_clause}
                GROUP BY "user".user_id
                """,params)
            users = cur.fetchall()
            return {"success": True, "users": users}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}
    





# function to slugify name of user for 
# the filename of the library card
import unicodedata
import re
def slugify(value, allow_unicode=True):
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower()).strip()
    return re.sub(r'[-\s]+', '-', value)

import os
# open sample latex card content
with open(os.path.join(os.getcwd(),'assets','latex',"lib_card.tex"), encoding="utf-8") as f:
    latex_template = str(f.read())


@bp.route('/make-library-card/', methods=['POST'])
@check_roles(['lib_editor'])
def make_library_card():
    MAKE_LIBRARY_CARD_JSON = {
        'type': 'object',
        "properties": {
                "user_id": {'type':'integer', 'minValue':0},
            },
        "additionalProperties": False,
        "required": ["user_id"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, MAKE_LIBRARY_CARD_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
               SELECT "user".user_id, "user".first_name || ' ' || "user".last_name AS full_name, "user".email, school.name AS school_name, school.city AS school_city
               FROM "user"
               INNER JOIN school ON "user".user_id = (%s) AND "user".school_id = (%s)
                """,[data['user_id'], user['school_id']])
            user = cur.fetchone()

            latex_code = latex_template.format(
                    full_name=user['full_name'], email=user['email'], school_name=user['school_name'], city=user['school_city'], user_id=user['user_id'])

            pdf = latex.build_pdf(latex_code)
            
            return bytes(pdf), 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}
    
