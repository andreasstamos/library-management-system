import datetime

from flask import Blueprint, request, g
import psycopg2
import jsonschema

from flask_jwt_extended import jwt_required, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("booking", __name__)

INSERT_BOOKING_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            },
        "additionalProperties": False,
        "required": ["isbn"] 
        }


@bp.route("/insert/", methods=["POST"])
@check_roles()
def insert_booking():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_BOOKING_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    identity = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO booking (user_id, isbn) VALUES (%s, %s)", (identity["user_id"], data["isbn"]))
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

EXISTS_BOOKING_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            },
        "additionalProperties": False,
        "required": ["isbn"] 
        }

@bp.route("/exists/", methods=["POST"])
@check_roles()
def exists_booking():
    data = request.get_json()
    try:
        jsonschema.validate(data, EXISTS_BOOKING_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
   
    identity = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("SELECT 1 FROM booking WHERE user_id = %s AND isbn = %s AND borrow_id IS NULL AND NOW() <@ period",\
                    (identity["user_id"], data["isbn"]))
            exists = cur.fetchone()
            print(exists)
            if exists is None: exists = False
            else: exists = True
            return {"success": True, "exists": exists}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400
