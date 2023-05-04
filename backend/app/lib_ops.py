from flask import Blueprint, request, g, jsonify
import jsonschema
import psycopg2.sql
import psycopg2.extras
from flask_jwt_extended import jwt_required, get_jwt_identity



bp = Blueprint("lib-api", __name__)


@bp.route("/get-users-active-status/", methods=["POST"])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def get_deactivated_users():
    data = request.get_json()


    # if boolean = true: We will get the activated users. Otherwise we will get the deactivated users.
    boolean = True
    if data['action'] == 'activate':
        boolean = False
    else:
        boolean = True
    print(boolean)
    
    user = get_jwt_identity()
    print(user)
    if user['role'] != 'lib_editor':
        return {'success': False, 'error': 'Unauthorized user'}, 401
    school_id = user['school_id']
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'student' AS role
            FROM "user"
            INNER JOIN student ON student.user_id = "user".user_id 
            WHERE school_id=(%s) AND active=(%s)
            UNION
            SELECT "user".user_id, "user".username, "user".first_name, "user".last_name, 
            "user".email,"user".active, 'teacher' AS role 
            FROM "user"
            INNER JOIN teacher ON teacher.user_id = "user".user_id
            WHERE school_id=(%s) AND active=(%s)""", [school_id, boolean,school_id, boolean])
            results = cur.fetchall()
            return {"success": True, "users": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}


    return {'success': True}, 200


@bp.route("/change-active-user/", methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def activate_user():
    change_user_active = {
        "type": "object",
        "properties": {
            "user_id": {"type": "integer"},
            "action": {"type": "string"}, #date expected in ISO8601 format
            },
        "additionalProperties": False,
        "required": ["user_id", "action"]
        }
    data = request.get_json()
    user = get_jwt_identity()
    if user['role'] != 'lib_editor' or not user['school_id']:
        return {'success': False, 'error': 'Unauthorized user'}, 401
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            if data['action'] == 'activate':
                cur.execute("""UPDATE "user" 
                SET active = true 
                WHERE "user".school_id = (%s) AND "user".user_id = (%s)
                AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
                ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'],data['user_id'],))
            else:
                cur.execute("""UPDATE "user" 
                SET active = false WHERE "user".school_id = (%s) AND "user".user_id = (%s)
                AND NOT EXISTS(SELECT 1 FROM "user" AS t1 INNER JOIN "lib_user" as t2
                ON t1.user_id = t2.user_id WHERE t1.user_id = (%s))""", (user['school_id'],data['user_id'], data['user_id'],))
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400