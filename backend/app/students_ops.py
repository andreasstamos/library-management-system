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
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def my_borrows():

    user = get_jwt_identity()


    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT book.title, item.isbn ,item.item_id,publisher.publisher_name, lower(borrow.period) AS borrowed_on,upper(borrow.period) as returned, borrow.expected_return \
            FROM book\
            INNER JOIN item ON book.isbn = item.isbn \
            INNER JOIN publisher ON book.publisher_id = publisher.publisher_id\
            INNER JOIN borrow ON item.item_id = borrow.item_id \
            AND borrow.borrower_id = (%s)", (user['user_id'],))
            results = cur.fetchall()
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True, "borrows": results}, 200


REVIEW_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "maxLength": 15, 'minLength': 3},
            "rate": {"type": "integer", 'minimum': 1, 'maximum': 5},
            'body': {'type': 'string', 'maxLength': 500},
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
            cur.execute("INSERT INTO review (isbn, user_id, rate, body) VALUES (%s, %s, %s, %s)", [data['isbn'], user['user_id'], data['rate'], data['body'].strip()])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

    return {"success": True} ,200

@bp.route('/my-review/', methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def my_review():

    MY_REVIEW_JSON = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "maxLength": 15, 'minLength': 3},
            },
        "additionalProperties": False,
        "required": ["isbn"]
    }

    data = request.get_json()
    try:
        jsonschema.validate(data, MY_REVIEW_JSON)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
            SELECT review.rate, review.body, review.review_id IS NOT NULL AS exists
            FROM review
            WHERE review.user_id = (%s) AND review.isbn = (%s)
            """, (user['user_id'],data['isbn'],))
            my_review = cur.fetchone()
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

    return {"success": True, "my_review": my_review}, 200
