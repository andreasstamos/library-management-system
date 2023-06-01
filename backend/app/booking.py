import datetime

from flask import Blueprint, request, g
import psycopg2
import jsonschema

from flask_jwt_extended import jwt_required, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("booking", __name__)

GET_BOOKINGS_JSON = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            },
        "additionalProperties": False,
        "required": ["isbn"] 
        }

@bp.route("/get-bookings/", methods=['POST'])
@check_roles(['lib_editor'])
def get_bookings():
    user = get_jwt_identity()
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            # Get all non active reviews from users that are in the same school as the lib editor.
            cur.execute("""
                SELECT booking_id, booking.isbn, book.title, "user".user_id, first_name, last_name, username,
                LOWER(period) AS booked_on,
                (borrow_id IS NOT NULL) AS lent,
                (NOW() <@ period) AS time_valid
                FROM booking
                INNER JOIN "user" ON booking.user_id = "user".user_id AND "user".school_id = (%s)
                INNER JOIN "book" ON booking.isbn = book.isbn
            """, [user['school_id']])
            bookings = cur.fetchall()
            return {"success": True, "bookings": bookings}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}



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
            cur.execute("SELECT COUNT(1) >= 2 FROM booking WHERE user_id = %s AND lower(period) > NOW() - INTERVAL '7 days'",\
                    (identity["user_id"],))
            exceeded_max = cur.fetchone()[0]
            return {"success": True, "exists_booking": exists_booking, "exceeded_max": exceeded_max}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400




DELETE_BOOKING_JSON = {
    "type": "object",
    "properties": {
        "booking_id": {"type": "integer"},
        },
    "additionalProperties": False,
    "required": ["booking_id"] 
}

@bp.route("/delete-booking/", methods=['POST'])
@check_roles(['lib_editor'])
def delete_bookin():
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_BOOKING_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            # we must make sure library editor isn't deleting booking from another school!!!
            query = psycopg2.sql.SQL("""
            DELETE FROM booking
            WHERE booking_id = (%s)
            AND EXISTS (
                SELECT 1
                FROM "user"
                WHERE "user".school_id = (%s) AND "user".user_id = booking.user_id
            )
            """)
            cur.execute(query, [data['booking_id'], user['school_id']])
            g.db_conn.commit()
            return {'success': cur.rowcount >= 1}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
