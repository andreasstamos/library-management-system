from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
from datetime import datetime
import bcrypt

bp = Blueprint("authors", __name__)


@bp.route('/get-authors/', methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def get_authors():
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT * 
                FROM author
                ORDER BY author_name
            """)
            authors = cur.fetchall()
            return {"success": True, "authors": authors}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


@bp.route('/update-author/', methods=['POST'])
@check_roles(['lib_editor','admin'])
def update_author():
    UPDATE_AUTHOR_JSON = {
        "type": "object",
        "properties": {
            "author_id": {"type": "integer", 'minValue': 0},
            "author_name": {"type": "string", "minLength": 1}
            },
        "additionalProperties": False,
        "required": ["author_id", "author_name"]
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_AUTHOR_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE author 
                SET author_name = (%s)
                WHERE author_id = (%s)
            """, [data['author_name'], data['author_id']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200


@bp.route("/delete-author/", methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def delete_author():
    DELETE_AUTHOR_JSON = {
        'type': 'object',
        "properties": {
            "author_id": {"type": "integer", 'minValue': 0},
            },
        "additionalProperties": False,
        "required": ["author_id"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_AUTHOR_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:

            # Library editor needs to be at the same school as the user that has his review deleted!
            query = psycopg2.sql.SQL("""
            DELETE FROM author
            WHERE author_id = (%s)
            """)
            
            cur.execute(query, [data['author_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
    
@bp.route('/add-author/', methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def add_author():
    data = request.get_json()
    INSERT_AUTHOR_JSON = {
        'type': 'object',
        "properties": {
            "author_name": {"type": "string", 'minLength': 1},
            },
        "additionalProperties": False,
        "required": ["author_name"]
    }
    try:
        jsonschema.validate(data, INSERT_AUTHOR_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            
            cur.execute('INSERT INTO "author" (author_name) VALUES (%s)', 
                        [data['author_name'].title()])

    
            g.db_conn.commit()

            return {"success": True}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
