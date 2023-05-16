from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles

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

@bp.route('/insert-school/', methods=["POST"])
@check_roles(['admin'])
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


GET_SCHOOLS_JSON = {
    'type': 'object',
    "properties": {
        "fetch_fields": {"type": "array", "minItems": 1, "items": {"type": "string", "enum":\
                    ["name", "city", "address", "phone", 'school_id', 'email']}}
    },
        "required": ["fetch_fields"],
        "additionalProperties": False,
}

# WHEN A STUDENT TRIES TO MAKE AN ACCOUNT
# THIS IS THE ENDPOINT THAT SENDS SCHOOL LIST TO THE DROPDOWN IN THE REGISTER FORM
@bp.route('/get-schools/', methods=['POST'])
def get_school():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_SCHOOLS_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400


    select_clause = ', '.join([f'school.{field_name.strip().lower()}' for field_name in data['fetch_fields']])
    print(select_clause)


    query = psycopg2.sql.SQL(f"SELECT {select_clause} FROM school")
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
        "required": ["school_id", 'new_school'],
        "additionalProperties": False,
}

@bp.route("/update-school/", methods=["PATCH"])
@check_roles(['admin'])
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



# For some reason frontend request keeps deleting Authorization headers when the route is DELETE and not POST.
@bp.route('/delete-school/', methods=['POST'])
@check_roles(['admin'])
def delete_school():
    DELETE_SCHOOL_JSON = {
        "type": "object",
        "properties": {
            "school_id": {"type": "integer"},
            },
        "required": ["school_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_SCHOOL_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            query = psycopg2.sql.SQL("DELETE FROM school WHERE school_id = (%s)")
            cur.execute(query, [data['school_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
    