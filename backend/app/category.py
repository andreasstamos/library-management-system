from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras
from flask_jwt_extended import jwt_required, get_jwt_identity
from .roles_decorators import check_roles

bp = Blueprint("category", __name__)


@bp.route("get-categories/", methods=['POST'])
def get_categories():
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM category
            """)
            categories = cur.fetchall()
            return {"success": True, "categories": categories}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}



@bp.route("add-category/", methods=['POST'])
def add_category():
    INSERT_CATEGORY_JSON = {
        "type": "object",
        "properties": {
            "category_name": {"type": "string", "minLength": 3},
            },
        "additionalProperties": False,
        "required": ["category_name"] 
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_CATEGORY_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            INSERT INTO category (category_name) 
            VALUES (%s)
            """, (data['category_name'], ))
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

@bp.route("update-category/", methods=['POST'])
def update_category():
    UPDATE_CATEGORY_JSON = {
        "type": "object",
        "properties": {
            "category_name": {"type": "string", "minLength": 3},
            "category_id": {"type": "integer", "minValue": 0},

            },
        "additionalProperties": False,
        "required": ["category_name", "category_id"] 
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_CATEGORY_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE category 
                SET category_name = (%s)
                WHERE category_id = (%s)
            """, [data['category_name'], data['category_id']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200


@bp.route("delete-category/", methods=['POST'])
def delete_category():
    DELETE_CATEGORY_JSON = {
        "type": "object",
        "properties": {
            "category_id": {"type": "integer", "minValue": 0},

            },
        "additionalProperties": False,
        "required": ["category_id"] 
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_CATEGORY_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:

            # Library editor needs to be at the same school as the user that has his review deleted!
            query = psycopg2.sql.SQL("""
            DELETE FROM category
            WHERE category_id = (%s)
            """)
            
            cur.execute(query, [data['category_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400