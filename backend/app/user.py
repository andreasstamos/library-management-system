from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras
from .roles_decorators import check_roles
from flask_jwt_extended import jwt_required, get_jwt_identity
from psycopg2 import extensions
from datetime import datetime

bp = Blueprint("user", __name__)

GET_USER_DETAILS_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "user_id": {"type": "integer"},
            },
        "additionalProperties": False,
        "required": ["user_id"]
}

@bp.route("/get-details/", methods=["POST"])
@check_roles(["lib_editor"])
def get_user_details():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_USER_DETAILS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT username, first_name, last_name, email\
                    FROM \"user\"\
                    WHERE user_id = %s", (data["user_id"],))
            user = cur.fetchone()
            return {"success": True, "user": user}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400


# Profile view
@bp.route('/get-profile/', methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def get_profile():
    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT username, first_name, last_name, "user".email, dob, school.name AS school_name
            FROM "user"
            INNER JOIN school
            ON school.school_id = "user".school_id
            WHERE user_id = (%s)
            """, [user["user_id"]])
            profile = cur.fetchone()
            return {"success": True, "profile": profile}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400


# Update profile
@bp.route('/update-profile/', methods=['PATCH'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def update_profile():
    UPDATE_USER_JSON = {
        "type": "object",
        "properties": {
            "username": {"type": "string", "minLength": 3},
            "email": {"type": "string", "minLength":5},
            'first_name': {"type": "string", "minLength": 3},
            "last_name": {"type": "string", "minLength":3},
            'dob': {'type':'string'},
            },
        "additionalProperties": False,
        "required": ["username", 'email', 'first_name', 'last_name', 'dob']
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_USER_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()
    if user['role'] == 'student':
        return {'success': False, 'error': 'Unauthorized access.'}, 401
    print(data['dob'])
    normalized_datetime = datetime.strptime(data['dob'], "%Y-%m-%dT%H:%M:%S.%fZ")
    normalized_date = normalized_datetime.date()
    print(normalized_date)
    try:
        with g.db_conn.cursor() as cur:        

            cur.execute("""
            UPDATE "user"
            SET
            username = (%s),
            first_name = (%s),
            last_name = (%s),
            email = (%s),
            dob = (%s)
            WHERE user_id = (%s)
            """, [data['username'], data['first_name'], data['last_name'], data['email'], normalized_date,user['user_id']])
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}
