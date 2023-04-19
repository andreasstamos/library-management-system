from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema

bp = Blueprint("school", __name__)

INSERT_SCHOOL_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "name": {"type": "string", "maxLength": 150},
            "address": {"type": "string", "maxLength": 20},
            "city": {"type": "string", "maxLength": 50},
            "phone": {"type": "string", "pattern": "^\+[0-9]+", "maxLength": 15},
            "email": {"type": "string", "pattern": "^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$", "maxLength": 256},
            },
        "additionalProperties": False,
        "required": ["name", "address", "city", "phone", "email"]
        }

@bp.route('/', methods=["POST"])
def insert_school():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_SCHOOL_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
 
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO school (name, address, city, phone, email)\
                    VALUES (%s, %s, %s, %s, %s) RETURNING school_id",\
                    (data["name"], data["address"], data["city"], data["phone"], data["email"]))
            g.db_conn.commit()
            school_id = cur.fetchall()[0]
            return {"success": True, "school_id": school_id}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}



# WHEN A STUDENT TRIES TO MAKE AN ACCOUNT
# THIS IS THE ENDPOINT THAT SENDS SCHOOL LIST TO THE DROPDOWN IN THE REGISTER FORM
@bp.route('/', methods=['GET'])
def get_school():
    query = psycopg2.sql.SQL("SELECT school.name, school.school_id FROM school")
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "schools": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}



UPDATE_SCHOOL_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "school_id": {"type": "integer"},
            "new_school": {
                "name": {"type": "string", "maxLength": 150},
                "address": {"type": "string", "maxLength": 20},
                "city": {"type": "string", "maxLength": 50},
                "phone": {"type": "string", "pattern": "^\+[0-9]+", "maxLength": 15},
                "email": {"type": "string", "pattern": "^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$", "maxLength": 256},
                }
            },
        "required": ["school_id"],
        "additionalProperties": False,
        }

@bp.route("/", methods=["PATCH"])
def update_school():
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_SCHOOL_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor() as cur:
            
            #nothing has to change
            if len(data["new_school"]) == 0:
                return {"success": True}, 200

            query = psycopg2.sql.SQL("UPDATE school SET {} WHERE school_id={}").format(
                    psycopg2.sql.SQL(", ").join(
                        psycopg2.sql.SQL("{} = {}").format(
                            psycopg2.sql.Identifier(fieldName), psycopg2.sql.Literal(value))
                        for fieldName, value in data["new_school"].items()),
                    psycopg2.sql.Literal(data["school_id"]))
            cur.execute(query)
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}

