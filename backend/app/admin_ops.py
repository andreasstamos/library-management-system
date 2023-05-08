from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from .roles_decorators import check_roles
bp = Blueprint("admin-ops", __name__)

# ADMIN OPERATIONS




@bp.route("/deactivated-library-users/", methods=['POST'])
@check_roles(['admin'])
def get_deactivated_libary_users():
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, school.name AS school_name
            FROM "user"
            INNER JOIN lib_user ON lib_user.user_id = "user".user_id
            INNER JOIN school ON "user".school_id = school.school_id
            WHERE active=false""")
            results = cur.fetchall()
            return {"success": True, "users": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}



@bp.route('/activate-library-users/', methods=['POST'])
def activate_library_user():
    activate_user_json = {
        'type': 'object',
        'properties' : {
           'user_id': {'type':'integer', 'minValue':0}
        },
        "required": ["user_id"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, activate_user_json)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            # Library user must be in the same school with the user that has written the review....
            cur.execute("""
                UPDATE "user" 
                SET active=true 
                WHERE "user".user_id = (%s)
            """, [data['user_id']])
            g.db_conn.commit() 
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True}, 200
