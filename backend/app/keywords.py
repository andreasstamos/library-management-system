from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
from datetime import datetime

bp = Blueprint("keywords", __name__)



@bp.route('/get-keywords/', methods=['POST'])
#@check_roles(['lib_editor', 'admin'])
def get_keywords():
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT * 
                FROM keyword
                ORDER BY keyword_name
            """)
            keywords = cur.fetchall()
            return {"success": True, "keywords": keywords}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


@bp.route('/update-keyword/', methods=['POST'])
@check_roles(['lib_editor','admin'])
def update_keyword():
    UPDATE_KEYWORD_JSON = {
        "type": "object",
        "properties": {
            "keyword_id": {"type": "integer", 'minValue': 0},
            "keyword_name": {"type": "string", "minLength": 1}
            },
        "additionalProperties": False,
        "required": ["keyword_id", "keyword_name"]
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_KEYWORD_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE keyword 
                SET keyword_name = (%s)
                WHERE keyword_id = (%s)
            """, [data['keyword_name'], data['keyword_id']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200


@bp.route("/delete-keyword/", methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def delete_keyword():
    DELETE_KEYWORD_JSON = {
        'type': 'object',
        "properties": {
            "keyword_id": {"type": "integer", 'minValue': 0},
            },
        "additionalProperties": False,
        "required": ["keyword_id"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_KEYWORD_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:

            # Library editor needs to be at the same school as the user that has his review deleted!
            query = psycopg2.sql.SQL("""
            DELETE FROM keyword
            WHERE keyword_id = (%s)
            """)
            
            cur.execute(query, [data['keyword_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
    
@bp.route('/add-keyword/', methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def add_keyword():
    data = request.get_json()
    INSERT_KEYWORD_JSON = {
        'type': 'object',
        "properties": {
            "keyword_name": {"type": "string", 'minLength': 1},
            },
        "additionalProperties": False,
        "required": ["keyword_name"]
    }
    try:
        jsonschema.validate(data, INSERT_KEYWORD_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            
            cur.execute('INSERT INTO keyword (keyword_name) VALUES (%s)', 
                        [data['keyword_name'].strip().title()])

    
            g.db_conn.commit()

            return {"success": True}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
