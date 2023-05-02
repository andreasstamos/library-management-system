from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras

from .roles_decorators import check_roles

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

