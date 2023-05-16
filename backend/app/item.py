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
            cur.execute("INSERT INTO borrow (item_id, borrower_id, expected_return) VALUES (%s, %s, %s)",\
                    (data["item_id"], data["borrower_id"], expected_return))
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


GET_ITEM_DETAILS_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["item_id"]
        }

@bp.route("/get-details/", methods=["POST"])
@check_roles(["lib_editor"])
def get_item_details():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_ITEM_DETAILS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT book.isbn, book.title, book.image_uri, book.publisher_name,\
                    array_remove(array_agg(DISTINCT book_author.author_name), NULL) AS authors,\
                    array_remove(array_agg(DISTINCT book_keyword.keyword_name), NULL) AS keywords,\
                    array_remove(array_agg(DISTINCT book_category.category_name), NULL) AS categories,\
                    \"user\".user_id, \"user\".first_name, \"user\".last_name, \"user\".email\
                    FROM item\
                    LEFT JOIN book USING (isbn)\
                    LEFT JOIN book_author USING (isbn)\
                    LEFT JOIN book_category USING (isbn)\
                    LEFT JOIN book_keyword USING (isbn)\
                    LEFT JOIN borrow ON item.item_id = borrow.item_id AND upper_inf(borrow.period)\
                    LEFT JOIN \"user\" ON user_id = borrower_id\
                    WHERE item.item_id = %s\
                    GROUP BY book.isbn, \"user\".user_id", (data["item_id"],))
            item = cur.fetchone()
            item["isBorrowed"] = item["user_id"] is not None
            return {"success": True, "item": item}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400

