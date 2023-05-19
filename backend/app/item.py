import datetime

from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras

from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("item", __name__)

INSERT_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            },
        "additionalProperties": False,
        "required": ["isbn"]
        }


@bp.route("/insert/", methods=["POST"])
@check_roles("lib_editor")
def insert_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    identity = get_jwt_identity()
    school_id = identity["school_id"]

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO item (isbn, school_id) VALUES (%s, %s) RETURNING item_id",\
                    (data["isbn"], school_id))
            g.db_conn.commit()
            item_id = cur.fetchone()
            return {"success": True, "item_id": item_id[0]}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400


UPDATE_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            "new_item": {
                "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
                "school_id": {"type": "integer"},
                }
            },
        "required": ["item_id"],
        "additionalProperties": False,
        }

@bp.route("/update/", methods=["POST"])
def update_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor() as cur:
            
            #nothing has to change
            if len(data["new_item"]) == 0:
                return {"success": True}, 200

            query = psycopg2.sql.SQL("UPDATE item SET {} WHERE item_id={}").format(
                    psycopg2.sql.SQL(", ").join(
                        psycopg2.sql.SQL("{} = {}").format(
                            psycopg2.sql.Identifier(fieldName), psycopg2.sql.Literal(value))
                        for fieldName, value in data["new_item"]),
                    psycopg2.sql.Literal(data["item_id"]))
            cur.execute(query)
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


BORROW_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            "borrower_id": {"type": "integer"},
            #"expected_return": {"type": "string", "format": "date"}, #date expected in ISO8601 format
            },
        "additionalProperties": False,
        "required": ["item_id", "borrower_id"] 
        }


@bp.route("/borrow/", methods=["POST"])
@check_roles(["lib_editor"])
def borrow_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, BORROW_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    expected_return = datetime.date.today() + datetime.timedelta(days=14) #TODO: CHECK/QUERY/HARDCODE/... LIBRARY POLICY FOR RETURN DATES

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("select * from borrow_item(%s,%s,%s)", (data["item_id"], data["borrower_id"], expected_return))
            allowed = cur.fetchone()[0]
            if not allowed:
                g.db_conn.rollback()
                return {"success": False, "failed_due_bookings": True}, 200
            else:
                g.db_conn.commit()
                return {"success": True}, 200
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400


RETURN_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["item_id"]
        }


@bp.route("/return/", methods=["POST"])
@check_roles(["lib_editor"])
def return_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, RETURN_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("UPDATE borrow SET period = TSTZRANGE(LOWER(period), NOW(), '[]')\
                    WHERE item_id = %s AND UPPER_INF(period)", (data["item_id"],))
            g.db_conn.commit()
            return {"success": cur.rowcount > 0}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

IS_BORROWED_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["item_id"] 
        }

@bp.route("/is-borrowed/", methods=["POST"])
@check_roles()
def is_borrowed():
    data = request.get_json()
    try:
        jsonschema.validate(data, IS_BORROWED_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
  
    query = """SELECT first_name, last_name, email\
            FROM borrow\
            JOIN "user" ON (borrow.borrower_id = "user".user_id)\
            WHERE item_id = %s AND NOW() <@ period"""

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, (data["item_id"],))
            user_borrowed = cur.fetchone()
            return {"success": True, "user": user_borrowed}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400
