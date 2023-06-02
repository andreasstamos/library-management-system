from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema
from flask_jwt_extended import jwt_required, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("student-ops", __name__)

# STUDENT OPERATIONS


# Must validate that user is authenticated!
# We must decide what we will do with multiple users first
# Should we add a 'returned' field in the borrow table? (Someone might return it earlier) 

MY_BOOKINGS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "additionalProperties": False,
        "required": []
        }


@bp.route("/my-bookings/", methods=['POST'])
@check_roles()
def my_bookings():
    data = request.get_json()
    try:
        jsonschema.validate(data, MY_BOOKINGS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""SELECT booking_id, isbn, title, publisher_name, LOWER(period) AS booked_on,\
                    borrow_id IS NOT NULL as lent, NOW() <= upper(period) as time_valid\
                    FROM booking\
                    INNER JOIN book USING (isbn)\
                    INNER JOIN publisher USING (publisher_id)\
                    WHERE user_id = %s\
                    ORDER BY time_valid DESC, booked_on DESC""", (user['user_id'],))
            bookings = cur.fetchall()
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}

    return {"success": True, "bookings": bookings}, 200



MY_BORROWS_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "additionalProperties": False,
        "required": []
        }



@bp.route("/my-borrows/", methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def my_borrows():
    data = request.get_json()
    try:
        jsonschema.validate(data, MY_BORROWS_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    user = get_jwt_identity()

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT book.title, item.isbn, item.item_id, publisher.publisher_name, LOWER(borrow.period) AS borrowed_on,\
                    UPPER(borrow.period) as returned_on, UPPER(borrow.period) IS NOT NULL as returned,\
                    borrow.expected_return, NOW()::date <= expected_return as time_valid\
                    FROM borrow\
                    INNER JOIN item ON item.item_id = borrow.item_id\
                    INNER JOIN book ON book.isbn = item.isbn\
                    INNER JOIN publisher ON book.publisher_id = publisher.publisher_id\
                    WHERE borrow.borrower_id = (%s)", (user['user_id'],))
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
