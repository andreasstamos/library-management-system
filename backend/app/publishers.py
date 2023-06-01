from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
from datetime import datetime
import bcrypt

bp = Blueprint("publishers", __name__)


@bp.route('/get-publishers/', methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def get_publishers():
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT * 
                FROM publisher
                ORDER BY publisher_name
            """)
            publishers = cur.fetchall()
            return {"success": True, "publishers": publishers}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


@bp.route('/update-publisher/', methods=['POST'])
@check_roles(['lib_editor','admin'])
def update_publisher():
    UPDATE_PUBLISHER_JSON = {
        "type": "object",
        "properties": {
            "publisher_id": {"type": "integer", 'minValue': 0},
            "publisher_name": {"type": "string", "minLength": 1}
            },
        "additionalProperties": False,
        "required": ["publisher_id", "publisher_name"]
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_PUBLISHER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE publisher 
                SET publisher_name = (%s)
                WHERE publisher_id = (%s)
            """, [data['publisher_name'], data['publisher_id']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200


@bp.route("/delete-publisher/", methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def delete_publisher():
    DELETE_PUBLISHER_JSON = {
        'type': 'object',
        "properties": {
            "publisher_id": {"type": "integer", 'minValue': 0},
            },
        "additionalProperties": False,
        "required": ["publisher_id"]
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, DELETE_PUBLISHER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:

            # Library editor needs to be at the same school as the user that has his review deleted!
            query = psycopg2.sql.SQL("""
            DELETE FROM publisher
            WHERE publisher_id = (%s)
            """)
            
            cur.execute(query, [data['publisher_id']])
            g.db_conn.commit()
            return {'success': True,}, 200
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return {'success': False, 'error': 'unknown'}, 400
    
@bp.route('/add-publisher/', methods=['POST'])
@check_roles(['lib_editor', 'admin'])
def add_publisher():
    data = request.get_json()
    INSERT_PUBLISHER_JSON = {
        'type': 'object',
        "properties": {
            "publisher_name": {"type": "string", 'minLength': 1},
            },
        "additionalProperties": False,
        "required": ["publisher_name"]
    }
    try:
        jsonschema.validate(data, INSERT_PUBLISHER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    try:
        with g.db_conn.cursor() as cur:
            
            cur.execute('INSERT INTO publisher (publisher_name) VALUES (%s)', 
                        [data['publisher_name'].title()])

    
            g.db_conn.commit()

            return {"success": True}, 201
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400
