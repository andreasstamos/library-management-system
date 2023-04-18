from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema

bp = Blueprint("school", __name__)

# WHEN A STUDENT TRIES TO MAKE AN ACCOUNT
# THIS IS THE ENDPOINT THAT SENDS SCHOOL LIST TO THE DROPDOWN IN THE REGISTER FORM
@bp.route('/', methods=['GET'])
def get_schools():
    query = psycopg2.sql.SQL("SELECT school.name, school.school_id FROM school")
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "schools": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

