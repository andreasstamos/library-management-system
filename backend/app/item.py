from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras

bp = Blueprint("item", __name__)

INSERT_ITEM_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "school_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["isbn", "school_id"]
        }


@bp.route("/", methods=["POST"])
def insert_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO item (isbn, school_id) VALUES (%s, %s) RETURNING item_id",\
                    (data["isbn"], data["school_id"]))
            g.db_conn.commit()
            item_id = cur.fetchone()
            return {"success": True, "item_id": item_id[0]}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
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

@bp.route("/", methods=["PATCH"])
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
            "expected_return": {"type": "string", "format": "date"}, #date expected in ISO8601 format
            },
        "additionalProperties": False,
        "required": ["item_id", "borrower_id", "expected_return"]
        }


@bp.route("/borrow/", methods=["POST"])
def borrow_item():
    data = request.get_json()
    try:
        jsonschema.validate(data, BORROW_ITEM_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO borrow (item_id, borrower_id, expected_return) VALUES (%s, %s, %s)",\
                    (data["item_id"], data["borrower_id"], data["expected_return"]))
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
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
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

