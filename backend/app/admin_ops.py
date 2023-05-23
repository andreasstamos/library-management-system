from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
from datetime import datetime
import bcrypt
bp = Blueprint("admin-ops", __name__)
# ADMIN OPERATIONS


@bp.route("/get-library-editors/", methods=['POST'])
@check_roles(['admin'])
def get_library_editors():
    GET_LIBRARY_EDITORS = {
        "type": "object",
        "properties": {
            # are we searching for active users or not...
            'active': {'type': 'boolean'},
            },
        "additionalProperties": False,
        "required": ['active']
    }
    data=request.get_json()

    try:
        jsonschema.validate(data, GET_LIBRARY_EDITORS)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, "user".dob, school.name AS school_name
            FROM "user"
            INNER JOIN lib_user ON lib_user.user_id = "user".user_id
            INNER JOIN school ON "user".school_id = school.school_id
            WHERE active=(%s)""", [data['active']])
            results = cur.fetchall()
            return {"success": True, "users": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}

# @bp.route("/deactivated-library-users/", methods=['POST'])
# @check_roles(['admin'])
# def get_deactivated_libary_users():
#     try:
#         with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
#             cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
#             "user".email,"user".active, school.name AS school_name
#             FROM "user"
#             INNER JOIN lib_user ON lib_user.user_id = "user".user_id
#             INNER JOIN school ON "user".school_id = school.school_id
#             WHERE active=false""")
#             results = cur.fetchall()
#             return {"success": True, "users": results}, 200
#     except psycopg2.Error as err:
#         print(err)
#         return {"success": False, "error": "unknown"}


@bp.route('/update-library-user/', methods=['POST'])
def update_library_user():
    UPDATE_LIBRARY_USER_JSON = {
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
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_LIBRARY_USER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    normalized_datetime = datetime.strptime(data['dob'], "%Y-%m-%dT%H:%M:%S.%fZ")
    normalized_date = normalized_datetime.date()

    try:
        with g.db_conn.cursor() as cur:
            # Library user must be in the same school with the user that has written the review....
            cur.execute("""
                UPDATE "user" 
                SET
                username = (%s),
                email = (%s),
                first_name = (%s),
                last_name = (%s),
                dob = (%s),
                active = (%s)
                WHERE "user".user_id = (%s)
            """, [data['username'], data['email'].lower(),data['first_name'].title(), data['last_name'].title(), normalized_date,data['active'],data['user_id']])
            g.db_conn.commit() 
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200



# This is where the admin inserts library editors.
# They are activated by default (because they are created by an admin)
@bp.route('/insert-library-user/', methods=['POST'])
def insert_library_editor():
    INSERT_LIBRARY_EDITOR_JSON = {
        'type': 'object',
        'properties' : {
            'first_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'last_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'email': {'type': 'string', 'maxLength': 256, 'minLength':6},
            'password': {'type': 'string', 'minLength':8},
            'confirm_password': {'type': 'string', 'minLength':8},
            'username': {'type': 'string', 'maxLength': 50},
            'school_id': {'type': 'integer'},
            'dob': {'type':'string',"format": "date",}
        },
        "required": ["first_name", "last_name", "email", "password", "confirm_password", "username", "school_id", "dob"],
        "additionalProperties": False,
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_LIBRARY_EDITOR_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    if data['password'] != data['confirm_password']:
        return {'success': False, 'error': 'Passwords should be matching.'}, 400
    
    try:
        with g.db_conn.cursor() as cur:

            # Check if the school exists
            cur.execute("SELECT EXISTS(SELECT 1 FROM school WHERE school_id = (%s))", str(data['school_id']))
            school_id_exists = cur.fetchone()[0]

            if not school_id_exists:
                return {"success": False, "error": "Such a school doesn't exist :("}, 400
            
            # Now we hash the password.
            password = data['password'].encode("utf-8")
            salt = bcrypt.gensalt(12)
            hashed_password = bcrypt.hashpw(password, salt).decode("utf-8")

            # normalize inputs
            username = data['username'].lower()
            email = data['email'].lower()
            first_name = data['first_name'].title()
            last_name = data['last_name'].title()

            cur.execute('INSERT INTO "user" (first_name, last_name, username, email, password_hash, school_id, dob, active)\
                    VALUES (%s, %s, %s, %s, %s, %s, %s, true) RETURNING user_id', 
                        (first_name, last_name, username, email, hashed_password, data['school_id'], data['dob']))

            user_id = cur.fetchone()[0]

            cur.execute('INSERT INTO lib_user (user_id) VALUES (%s)', (user_id,))
            g.db_conn.commit()

            return {"success": True, "user_id": user_id}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400



@bp.route('/delete-library-user/', methods=['POST'])
def delete_library_user():
    DELETE_LIB_USER_JSON = {
        "type": "object",
        "properties": {
            "user_id": {"type": "integer"},
            },
        "required": ["user_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_LIB_USER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            #We must make sure the user being delete is actually a library editor!
            query = psycopg2.sql.SQL("""
            DELETE FROM "user" 
            WHERE "user".user_id = (%s)
            AND EXISTS(SELECT 1
            FROM "lib_user" 
            WHERE "lib_user".user_id = (%s))""")
            cur.execute(query, [data['user_id'], data['user_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400

# QUERIES




#3_1_1
@bp.route('/queries/3_1_1/', methods=['POST'])
@check_roles(['admin'])
def get_filtered_borrows():
    # We need to get borrows per school either with month/year filter.
    # month/year filter is based on when borrow HAPPENED (LOWER(period))
    GET_FILTERED_BORROWS_JSON = {
        "type": "object",
        "properties": {
            "school_id": {"type": "integer"},
            "timefilter": {"type": "string",}
            },
        "required": ["school_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_FILTERED_BORROWS_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    where_clause = ""
    if 'timefilter' in data.keys():
        date_format = "%Y-%m"
        month = datetime.strptime(data['timefilter'], date_format).month
        year = datetime.strptime(data['timefilter'], date_format).year
        print(month, year)

        where_clause = f"WHERE EXTRACT(MONTH FROM LOWER(borrow.period) AT TIME ZONE 'UTC') = {month}\
                         AND EXTRACT(YEAR FROM LOWER(borrow.period) AT TIME ZONE 'UTC') = {year};"

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all bookings from specific school
            # perhaps latest school_id's check on borrower and lender are useless
            cur.execute("""
               SELECT borrow.borrow_id, book.title, borrower.first_name || ' ' || borrower.last_name as borrower_full_name,
               lender.first_name || ' ' || lender.last_name as lender_full_name,
               LOWER(borrow.period) AS borrowed_on, borrow.expected_return
               FROM borrow
               INNER JOIN item ON borrow.item_id = item.item_id AND item.school_id = (%s)
               INNER JOIN book ON book.isbn = item.isbn
               INNER JOIN "user" AS borrower ON borrower.user_id = borrow.borrower_id AND borrower.school_id = (%s)
               INNER JOIN "user" AS lender ON lender.user_id = borrow.lender_id AND lender.school_id = (%s)

            """ + where_clause, [data['school_id'], data['school_id'], data['school_id']])
            borrows = cur.fetchall()
            return {"success": True, "borrows": borrows}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}
    


#3.1.2
@bp.route('/queries/3_1_2/', methods=['POST'])
@check_roles(['admin'])
def get_authors_teacher():
    AUTHOR_TEACHER_OF_CATEGORY_JSON = {
        "type": "object",
        "properties": {
            "category": {"type": "integer"},
        },
        "required": ["category"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, AUTHOR_TEACHER_OF_CATEGORY_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:

            # get authors...
            cur.execute("""
            SELECT DISTINCT author.author_id AS id, author.author_name as name
            FROM author
            INNER JOIN book_author ON author.author_id = book_author.author_id
            INNER JOIN book_category ON book_category.isbn = book_author.isbn
            INNER JOIN category ON book_category.category_id = category.category_id
            WHERE category.category_id = (%s)
            """, [data['category']])
            authors = cur.fetchall()
            
            current_year = datetime.now().year

            cur.execute("""
            SELECT DISTINCT teacher.*, "user".first_name || ' ' || "user".last_name AS name, "user".user_id AS id
            FROM teacher
            INNER JOIN "user" ON "user".user_id = teacher.user_id
            INNER JOIN borrow ON borrow.borrower_id = "user".user_id
            INNER JOIN item ON item.item_id = borrow.item_id
            INNER JOIN book_category ON book_category.isbn = item.isbn
            WHERE book_category.category_id = (%s) AND EXTRACT(YEAR FROM LOWER(borrow.period) AT TIME ZONE 'UTC') =(%s)
            """, [data['category'], current_year])
            teachers = cur.fetchall()
            return {"success": True, "results": {"authors": authors, "teachers": teachers}}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}
    
