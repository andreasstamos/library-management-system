import configparser


import psycopg2
import psycopg2.extras
import psycopg2.sql

from flask import Flask, request, jsonify
import jsonschema
from .utils import serializer
import bcrypt
from flask_cors import CORS



config = configparser.ConfigParser()
config.read("secrets.ini")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_ALLOW_ALL_ORIGINS'] = True

conn = psycopg2.connect(
        host        =   config["DATABASE"]["DB_HOST"],
        port        =   config["DATABASE"].getint("DB_PORT"),
        database    =   config["DATABASE"]["DB_NAME"],
        user        =   config["DATABASE"]["DB_USER"],
        password    =   config["DATABASE"]["DB_PASSWORD"],
)

book_jsonschema = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            },
        "additionalProperties": False,
        }

insert_book_jsonschema = dict(book_jsonschema)
insert_book_jsonschema["required"] = ["isbn", "title", "publisher", "page_number", "summary", "language", "authors", "keywords", "categories"]


@app.route("/book/", methods=["POST"])
def insert_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, book_jsonschema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO book (isbn, title, publisher, page_number, summary, language)\
                    VALUES (%s, %s, %s, %s, %s, %s)",\
                    (data["isbn"], data["title"], data["publisher"], data["page_number"], data["summary"], data["language"]))

            for author in data["authors"]:
                cur.execute("INSERT INTO book_author (isbn, author) VALUES (%s, %s)",\
                        (data["isbn"], author))
            for keyword in data["keywords"]:
                cur.execute("INSERT INTO book_keyword (isbn, keyword) VALUES (%s, %s)",\
                        (data["isbn"], keyword))
            for category in data["categories"]:
                cur.execute("INSERT INTO book_category (isbn, category) VALUES (%s, %s)",\
                        (data["isbn"], category))
            conn.commit()
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        conn.rollback()
        return {"success": False, "error": "unknown"}, 400

    return {"success": True}, 201

@app.route("/book/", methods=["GET"])
def get_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, book_jsonschema)
    except jsonschema.ValidationErorr as err:
        return {"success": False, "error": err.message}, 400

    try:
        with conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            query = psycopg2.sql.SQL("SELECT * FROM book")
            if len(data) > 0:
                query += psycopg2.sql.SQL("WHERE {}").format(
                        psycopg2.sql.SQL(" AND ").join(
                            psycopg2.sql.SQL("{} = %s").format(psycopg2.sql.Identifier(fieldName)) for fieldName in data.keys()
                            )
                        )
            cur.execute(query, tuple(data.values()))
            results = cur.fetchall()
            return {"success": True, "books": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

@app.route("/book/", methods=["PATCH"])
def update_book():
    update_book_jsonschema = {
            "type": "object",
            "properties": {
                "old_book": dict(book_jsonschema),
                "new_book": dict(book_jsonschema),
                },
            "required": ["old_book", "new_book"],
            "additionalProperties": False
            }
    data = request.get_json()
    try:
        jsonschema.validate(data, update_book_jsonschema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with conn.cursor() as cur:
            if len(data["new_book"]) == 0: return {"success": True}, 200
            
            query = psycopg2.sql.SQL("UPDATE book SET {}").format(
                    psycopg2.sql.SQL(", ").join(
                        psycopg2.sql.SQL("{} = %s").format(psycopg2.sql.Identifier(fieldName)) for fieldName in data["new_book"].keys()
                        )
                    )

            if len(data["old_book"]) > 0:
                query += psycopg2.sql.SQL(" WHERE {}").format(
                        psycopg2.sql.SQL(" AND ").join(
                            psycopg2.sql.SQL("{} = %s").format(psycopg2.sql.Identifier(fieldName)) for fieldName in data["old_book"].keys()
                            )
                        )
            cur.execute(query, tuple(data["new_book"].values())+tuple(data["old_book"].values()))
            conn.commit()
            return {"success": True, "num_updated": cur.rowcount}, 200
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}




# This should be called when a db user tries to add a new book
# and has to select a publisher
@app.route("/get-publishers/", methods=['GET'])
def get_publishers():
    query = psycopg2.sql.SQL("SELECT * FROM publisher")
    try:
        with conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "publishers": serializer(results, cur.description)}, 200

    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}
    
# PUBLISHER STUFF GOING ON FROM NOW ON
# Add a publisher
@app.route("/new-publisher/", methods=["POST"])
def new_publisher():
    new_publisher_schema = {
        "type": "object",
        "properties": {
            "name": {'type':'string', 'maxLength': 50},
            },
        "required": ["name"],
        "additionalProperties": False,
        }
    data = request.get_json()
    try:
        jsonschema.validate(data, new_publisher_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO publisher (name) VALUES (%s)", [data['name']])
            conn.commit()
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        conn.rollback()
        return {"success": False, "error": "unknown"}, 400
    
    return {"success": True}, 201









# AUTH STUFF GOING ON DOWN THERE
# DOENS'T CHECK IF USER IS ACTIVE. MUST CHANGE LATER
@app.route('/login-student/', methods=['POST'])
def login():
    login_json_schema = {
        'type': 'object',
        'properties' : {
            'username': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'password': {'type': 'string', 'minLength': 3},
        },
        "required": ["username", "password"],
        "additionalProperties": False,
    }
    data = request.get_json()

    try:
        jsonschema.validate(data, login_json_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    username = data['username'].lower()
    
    with conn.cursor() as cur:
        # will need to modify what we fetch 
        # so as to changes access token field
 
        cur.execute('SELECT "user".user_id, "user".password_hash FROM "user" WHERE username = (%s)', [username])
        row = cur.fetchone()

        if row and bcrypt.checkpw(data['password'].encode('utf-8'), row[1].encode('utf-8')):
            print("LOGGED IN!")
            return {"success":True} ,200
        else:
            print("DIDN'T FIND SUCH USER")
            return {"success":False, "error":"Wrong username or password."}, 400




# Different route for student registering... 
# Helps keep code simpler.

@app.route('/register-student/', methods=['POST'])
def register():

    # THE USER IS ACTIVE ON REGISTER. WE NEED TO FIX THAT LATER.
    # THE USER NEEDS TO BE ACTIVATE THROUGH LIBRARY_EDITOR
    register_json_schema = {
        'type': 'object',
        'properties' : {
            'first_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'last_name': {'type': 'string', 'maxLength': 50, 'minLength': 3},
            'email': {'type': 'string', 'maxLength': 256, 'minLength':6},
            'password': {'type': 'string', 'minLength':8},
            'confirm_password': {'type': 'string', 'minLength':8},
            'username': {'type': 'string', 'maxLength': 50},
            'school_id': {'type': 'integer'}
        },
        "required": ["username", "password", "first_name", "last_name", "email", "school_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    
    try:
        jsonschema.validate(data, register_json_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400




    # Might be vulnerable to SQL Injections... will check later.
    # Try block is outside covers 2 queries. Hope there aren't any weird bugs with that in case 1 of them fails...
    try:
        with conn.cursor() as cur:

            # Check if the school exists
            check_school_query = psycopg2.sql.SQL(f"SELECT EXISTS(SELECT 1 FROM school WHERE school_id = {data['school_id']})")
            cur.execute(check_school_query)
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
            cur.execute('INSERT INTO "user" (first_name, last_name, username, email, password_hash, school_id) VALUES (%s, %s, %s, %s, %s, %s)', 
                        (first_name, last_name, username, email, hashed_password, data['school_id']))
            conn.commit()
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
    
    return {"success": True}, 201

    
    



# WHEN A STUDENT TRIES TO MAKE AN ACCOUNT
# THIS IS THE ENDPOINT THAT SENDS SCHOOL LIST TO THE DROPDOWN IN THE REGISTER FORM
@app.route('/get-schools/', methods=['GET'])
def get_schools():
    query = psycopg2.sql.SQL("SELECT school.name, school.school_id FROM school")
    try:
        with conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "schools": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

app.run(host='0.0.0.0', port=5000)
