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
@check_roles("lib_editor")
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
    
    expected_return = datetime.date.today() + datetime.timedelta(days=7) #TODO: CHECK/QUERY/HARDCODE/... LIBRARY POLICY FOR RETURN DATES

    lender_id = get_jwt_identity()["user_id"]

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("select * from borrow_item(%s,%s,%s,%s)", (data["item_id"], lender_id, data["borrower_id"], expected_return))
            status = cur.fetchone()
            if not all(status.values()):
                g.db_conn.rollback()
                return {"success": False, **status}, 200
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
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor() as cur:
            # check if item is in lib_editor's school!!!
            cur.execute("UPDATE borrow SET period = TSTZRANGE(LOWER(period), NOW(), '[]')\
                    WHERE item_id = %s AND UPPER_INF(period)\
                    AND EXISTS( SELECT 1 FROM item WHERE item.item_id = %s AND item.school_id = %s)", (data["item_id"],data['item_id'], user['school_id']))
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

DELETE_BORROW_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "borrow_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["borrow_id"]
        }

@bp.route("/delete-borrow/", methods=["POST"])
@check_roles(["lib_editor"])
def delete_borrow():
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_BORROW_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""DELETE FROM borrow WHERE borrow_id = %s AND
                    EXISTS (SELECT 1 FROM borrow JOIN "user" ON ("user".user_id = borrow.borrower_id) WHERE borrow_id = %s AND school_id = %s)""",\
                            (data["borrow_id"], data["borrow_id"], get_jwt_identity()["school_id"]))
            g.db_conn.commit()
            return {"success": cur.rowcount > 0}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400


GET_ITEMS_BY_ISBN_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            },
        "additionalProperties": False,
        "required": ["isbn"]
        }


@bp.route("/get-by-isbn/", methods=["POST"])
@check_roles("lib_editor")
def get_items_by_isbn():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_ITEMS_BY_ISBN_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    query = """SELECT item_id, time_valid IS NOT NULL AS lent, time_valid\
            FROM item\
            LEFT JOIN (SELECT item_id, NOW()::date <= expected_return AS time_valid FROM borrow WHERE NOW() <@ period) status USING (item_id)\
            WHERE isbn = %s AND school_id = %s"""

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, (data["isbn"], get_jwt_identity()["school_id"]))
            items = cur.fetchall()
            print(items)
            return {"success": True, "items": items}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400

DELETE_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["item_id"]
        }

@bp.route("/delete/", methods=["POST"])
@check_roles(["lib_editor"])
def delete_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""DELETE FROM item WHERE item_id = %s AND school_id = %s""",
                            (data["item_id"], get_jwt_identity()["school_id"]))
            g.db_conn.commit()
            return {"success": cur.rowcount > 0}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400


