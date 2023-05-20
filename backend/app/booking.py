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
    
    user_id = get_jwt_identity()["user_id"]

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * from booking_book(%s,%s)", (data["isbn"], user_id))
            status = cur.fetchone()
            if not all(status.values()):
                g.db_conn.rollback()
                return {"success": False, "error": "unknown"}, 200
            else:
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
            cur.execute("SELECT 1 FROM booking WHERE user_id = %s AND isbn = %s AND NOW() <@ period",\
                    (identity["user_id"], data["isbn"]))
            exists_booking = bool(cur.fetchone())
            cur.execute("SELECT COUNT(1) >= 2 FROM booking WHERE user_id = %s AND NOW() <@ period",\
                    (identity["user_id"],))
            exceeded_max = cur.fetchone()[0]
            return {"success": True, "exists_booking": exists_booking, "exceeded_max": exceeded_max}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400
