import datetime

from flask import Blueprint, request, g
import psycopg2
import jsonschema

from flask_jwt_extended import jwt_required, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("booking", __name__)

GET_BOOKINGS_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "first_name": {"type": "string"},
            "last_name": {"type": "string"},
            },
        "additionalProperties": False,
        "required": [] 
        }

@bp.route("/get-bookings/", methods=['POST'])
@check_roles(['lib_editor'])
def get_bookings():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_BOOKINGS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            where_clause = []
            if 'first_name' in data:
                where_clause.append("first_name %% %(first_name)s")
            if 'last_name' in data:
                where_clause.append("last_name %% %(last_name)s")
            where_clause = ' AND '.join(where_clause)
            if where_clause: where_clause = f"WHERE {where_clause}"

            cur.execute(f"""
                SELECT booking_id, booking.isbn, book.title, "user".user_id, first_name, last_name, username,
                LOWER(period) AS booked_on,
                (borrow_id IS NOT NULL) AS lent,
                (NOW() <@ period) AS time_valid
                FROM booking
                INNER JOIN "user" ON booking.user_id = "user".user_id AND "user".school_id = %(school_id)s
                INNER JOIN "book" ON booking.isbn = book.isbn
                {where_clause}
            """, {'school_id': user['school_id'], **data})
            bookings = cur.fetchall()
            return {"success": True, "bookings": bookings}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}



INSERT_BOOKING_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "user_id": {"type": "integer"}
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
    
    if "user_id" in data.keys():
        if identity["role"] != "lib_editor":
            return {"success": False, "error": "Access Denied"}, 401
        user_id = data["user_id"]
    else:
        user_id = identity["user_id"]

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
            "user_id": {"type": "integer"}
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
    
    if "user_id" in data.keys():
        if identity["role"] != "lib_editor":
            return {"success": False, "error": "Access Denied"}, 401
        user_id = data["user_id"]
    else:
        user_id = identity["user_id"]

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("SELECT EXISTS(SELECT 1 FROM booking WHERE user_id = %s AND isbn = %s AND NOW() <@ period)",\
                    (user_id, data["isbn"]))
            exists_booking = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(1) >= quota(%(user_id)s) FROM booking WHERE user_id = %(user_id)s AND lower(period) > NOW() - INTERVAL '7 days'",\
                    {'user_id': user_id})
            exceeded_max = cur.fetchone()[0]
            
            cur.execute("SELECT EXISTS(SELECT 1 FROM borrow WHERE borrower_id = %s AND NOW() <@ period AND NOW()::date > expected_return)", (user_id))
            late_borrows = cur.fetchone()[0]

            return {"success": True, "exists_booking": exists_booking, "exceeded_max": exceeded_max, "late_borrows": late_borrows}, 200
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
def delete_booking():
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
    except psycopg2.Error as error:
        g.db_coon.rollback()
        print(error)
        return {'success': False, 'error': 'unknown'}, 400

CANCEL_BOOKING_JSON = {
    "type": "object",
    "properties": {
        "booking_id": {"type": "integer"},
        },
    "additionalProperties": False,
    "required": ["booking_id"] 
}

@bp.route("/cancel-booking/", methods=['POST'])
@check_roles()
def cancel_booking():
    data = request.get_json()
    try:
        jsonschema.validate(data, CANCEL_BOOKING_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            query = psycopg2.sql.SQL(f"""
            UPDATE booking
            SET period = TSTZRANGE(lower(period), NOW())
            WHERE booking_id = %(booking_id)s
            AND NOW() <= upper(period) AND borrow_id IS NULL
            {'AND EXISTS (SELECT 1 FROM "user" WHERE "user".school_id = %(school_id)s AND "user".user_id = booking.user_id)' if user['role'] == 'lib_editor' else 'AND user_id = %(user_id)s'}
            """)
            cur.execute(query, {'booking_id': data['booking_id'], 'school_id': user["school_id"], 'user_id': user["user_id"]})
            g.db_conn.commit()
            print(cur.rowcount)
            return {'success': cur.rowcount >= 1}, 200
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {'success': False, 'error': 'unknown'}, 400

