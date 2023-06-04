from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
from datetime import datetime
import bcrypt

#for backup
from flask import current_app, send_file
import subprocess
import tempfile
import os


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
            "timefilter": {"type": "string", "format": "date"}
            },
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_FILTERED_BORROWS_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    group_by_clause = "GROUP BY school.school_id, school.name"
    params = []
    where_clause = ""
    if 'school_id' in data.keys():
        print(data['school_id'])
        where_clause += 'WHERE school.school_id = (%s) '
        params.append(data['school_id'])
    if 'timefilter' in data.keys():
        print(data['timefilter'])
        date_format = "%Y-%m"
        month = datetime.strptime(data['timefilter'], date_format).month
        year = datetime.strptime(data['timefilter'], date_format).year
        where_clause += f"AND EXTRACT(MONTH FROM LOWER(borrow.period)) = {month}\
                         AND EXTRACT(YEAR FROM LOWER(borrow.period)) = {year}"
    
    order_by_clause = "ORDER BY borrow_count DESC"
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all bookings from specific school
            # perhaps latest school_id's check on borrower and lender are useless
            cur.execute("""               
                SELECT school.school_id, school.name, COUNT(borrow.borrow_id) AS borrow_count
                FROM school
                LEFT JOIN "user" ON "user".school_id = school.school_id
                LEFT JOIN borrow ON "borrow".borrower_id = "user".user_id
            """ + where_clause + "\n" +group_by_clause + "\n" + order_by_clause, params)
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
#3.1.3
@bp.route('/queries/3_1_3/', methods=['POST'])
@check_roles(['admin'])
def get_most_borrows_young_teachers():
    GET_MOST_BORROWS_YOUNG_TEACHERS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_MOST_BORROWS_YOUNG_TEACHERS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT "user".user_id, first_name, last_name,
            COALESCE((SELECT COUNT(1) FROM borrow WHERE borrower_id = "user".user_id), 0) as cnt
            FROM teacher
            INNER JOIN "user" USING (user_id)
            WHERE NOW() - dob < INTERVAL '40 years'
            ORDER BY cnt DESC""")
            teachers = cur.fetchall()

            return {"success": True, "teachers": teachers}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"} #3.1.3

@bp.route('/queries/3_1_4/', methods=['POST'])
@check_roles(['admin'])
def get_authors_without_borrowed_books():
    GET_AUTHORS_WITHOUT_BORROWED_BOOKS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_AUTHORS_WITHOUT_BORROWED_BOOKS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT DISTINCT ON (author_id) author_name
            FROM author
            INNER JOIN book_author USING (author_id)
            WHERE NOT EXISTS (
                SELECT 1
                FROM item
                INNER JOIN borrow USING (item_id)
                WHERE isbn = book_author.isbn)""")

            authors = cur.fetchall()
            
            return {"success": True, "authors": authors}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@bp.route('/queries/3_1_5/', methods=['POST'])
@check_roles(['admin'])
def lib_editors_count_borrows():
    LIB_EDITORS_COUNT_BORROWS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, LIB_EDITORS_COUNT_BORROWS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT ARRAY_AGG(first_name || ' ' || last_name) as editors, cnt
            FROM (
            SELECT first_name, last_name, COUNT(1) as cnt
            FROM lib_user
            INNER JOIN "user" USING (user_id)
            INNER JOIN borrow ON user_id = lender_id
            GROUP BY "user".user_id) editors_with_count
            WHERE cnt > 20
            GROUP BY cnt
            ORDER BY cnt""")

            editors = cur.fetchall()
            
            return {"success": True, "editors": editors}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@bp.route('/queries/3_1_6/', methods=['POST'])
@check_roles(['admin'])
def top_3_category_pairs():
    TOP_3_CATEGORY_PAIRS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, TOP_3_CATEGORY_PAIRS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""
            SELECT c1.category_name AS category_name_1, c2.category_name AS category_name_2
            FROM 
            (category JOIN book_category USING (category_id)) c1
            JOIN
            (category JOIN book_category USING (category_id)) c2
            USING (isbn)
            JOIN item USING (isbn)
            JOIN borrow USING (item_id)
            WHERE c1.category_id < c2.category_id
            GROUP BY c1.category_id, c2.category_id
            ORDER BY COUNT(1) DESC
            LIMIT 3""")

            category_pairs = cur.fetchall()
            
            return {"success": True, "category_pairs": category_pairs}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@bp.route('/queries/3_1_7/', methods=['POST'])
@check_roles(['admin'])
def query_3_1_7():
    QUERY_3_1_7 = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, QUERY_3_1_7)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT author_name
            FROM book_author
            JOIN author USING (author_id)
            GROUP BY author.author_id
            HAVING COUNT(1) <=
                (SELECT COUNT(1) AS cnt
                FROM book_author
                GROUP BY author_id
                ORDER BY cnt DESC
                LIMIT 1) - 5
            """)

            authors = cur.fetchall()
            
            return {"success": True, "authors": authors}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@bp.route('/backup/', methods=['POST'])
@check_roles(['admin'])
def backup():
    BACKUP_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, BACKUP_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with tempfile.TemporaryDirectory() as tempdir:
            backup_file = os.path.join(tempdir, 'backup.sql')
            cmd = ['pg_dump', '-h', current_app.config["DB_HOST"], '-p', str(current_app.config["DB_PORT"]),
                '-d', current_app.config["DB_NAME"], '-U', current_app.config["DB_USER"], '--clean', '--if-exists',
                '-f', backup_file]
            env = os.environ.copy()
            env['PGPASSWORD'] = current_app.config["DB_PASSWORD"]
            subprocess.run(cmd, check=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return send_file(backup_file, as_attachment=True)
    except Exception as err:
        print(err)
        return {"success": False, "error": "unknown"}, 200

@bp.route('/restore/', methods=['POST'])
@check_roles(['admin'])
def restore():
    try:
        if 'file' not in request.files:
            return {"success": False, "error": "No file given"}, 400
        with tempfile.TemporaryDirectory() as tempdir:
            backup_file = os.path.join(tempdir, 'backup.sql')
            request.files['file'].save(backup_file)
            cmd = ['psql', '-h', current_app.config["DB_HOST"], '-p', str(current_app.config["DB_PORT"]),
                '-d', current_app.config["DB_NAME"], '-U', current_app.config["DB_USER"], '--single-transaction', '--quiet',
                '-f', backup_file]
            env = os.environ.copy()
            env['PGPASSWORD'] = current_app.config["DB_PASSWORD"]
            subprocess.run(cmd, check=True, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return {"success": True}, 200
    except Exception as err:
        print(err)
        raise err
        return {"success": False, "error": "unknown"}, 200
 
