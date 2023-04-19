from flask import Blueprint, request, g
import psycopg2.sql
import jsonschema

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
