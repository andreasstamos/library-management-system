from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("student-ops", __name__)

# STUDENT OPERATIONS


# Must validate that user is authenticated!
# We must decide what we will do with multiple users first
# Should we add a 'returned' field in the borrow table? (Someone might return it earlier) 



@bp.route("/my-borrows/", methods=['POST'])
def my_borrows():

    # Must get from access token.
    student_id = 2


    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
        
            cur.execute("SELECT book.title, item.isbn ,item.item_id, borrow.period, borrow.exprected_return, \
            FROM book\
            INNER JOIN item ON book.isbn = item.isbn \
            INNER JOIN borrow ON item.item_id = borrow.item_id \
            INNER JOIN student ON student.student_id = (%s)", (student_id,))
            results = cur.fetchall()
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


    return {"success": True, "borrows": results}, 200


REVIEW_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "maxLength": 15},
            "rate": {"type": "integer", 'minimum': 1, 'maximum': 5},
            },
        "additionalProperties": False,
        "required": ["isbn", "rate",]
        }


@bp.route('/review/', methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def insert_review():
    data = request.get_json()
    try:
        jsonschema.validate(data, REVIEW_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    user = get_jwt_identity()

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO review (isbn, user_id, rate) VALUES (%s, %s, %s)", [data['isbn'], user['user_id'], data['rate']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

    return {"success": True} ,200

