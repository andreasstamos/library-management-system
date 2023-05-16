from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras
from flask_jwt_extended import jwt_required, get_jwt_identity


bp = Blueprint("book", __name__)

INSERT_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher_name": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            },
        "additionalProperties": False,
        "required": ["isbn", "title", "publisher_name", "page_number", "summary", "language", "authors", "keywords", "categories"]
        }


@bp.route("/", methods=["POST"])
def insert_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO book (isbn, title, page_number, summary, language, publisher_name)\
                    VALUES (%s, %s, %s, %s, %s, %s)",\
                    (data["isbn"], data["title"], data["page_number"], data["summary"], data["language"], data["publisher_name"]))

            psycopg2.extras.execute_batch(cur, "INSERT INTO book_author (isbn, author_name) VALUES (%s, %s)",\
                        [(data["isbn"], author) for author in data["authors"]])
            psycopg2.extras.execute_batch(cur, "INSERT INTO book_category (isbn, category_name) VALUES (%s, %s)",\
                        [(data["isbn"], category) for category in data["categories"]])
            psycopg2.extras.execute_batch(cur, "INSERT INTO book_keyword (isbn, keyword_name) VALUES (%s, %s)",\
                        [(data["isbn"], keyword) for keyword in data["keywords"]])            
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

    return {"success": True}, 201

GET_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher_name": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "categories": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "school_id": {"type": "integer"},
            "limit": {"type": "integer", "minimum": 1},
            "offset": {"type": "integer", "minimum": 0},
            "fetch_fields": {"type": "array", "minItems": 1, "items": {"type": "string", "enum":\
                    ["isbn", "title", "publisher_name", "page_number", "language", "summary", "image_uri",
                        "authors", "keywords", "categories", "rate", "item_number"]}}
            },
        "additionalProperties": False,
        "required": ["fetch_fields"],
        }

@bp.route("/get/", methods=["POST"])
def get_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    select_clause = []
    select_clause += {'isbn', 'title', 'publisher_name', 'page_number', 'language', 'summary', 'image_uri'} & set(data['fetch_fields'])
    if 'authors' in data['fetch_fields']:
        select_clause.append('array_remove(array_agg(DISTINCT author_name), NULL) AS authors')
    if 'keywords' in data['fetch_fields']:
        select_clause.append('array_remove(array_agg(DISTINCT keyword_name), NULL) AS keywords')
    if 'categories' in data['fetch_fields']:
        select_clause.append('array_remove(array_agg(DISTINCT category_name), NULL) AS categories')
    if 'item_number' in data['fetch_fields']:
        select_clause.append('COUNT(DISTINCT item_id) AS item_number')
    if 'rate' in data['fetch_fields']:
        # Kostas added active=true in the WHERE clause... (in case it stops working)
        select_clause.append('(SELECT ROUND(AVG(rate)) FROM review WHERE isbn=book.isbn AND active=true) AS rate')

    select_clause = ','.join(select_clause)

    where_clause = [f"{field} {'IN' if type(data[field]) is tuple else '='} %({field})s"
            for field in {'isbn', 'publisher_name', 'page_number', 'language', 'school_id'} & set(data.keys())]
    where_clause = ' AND '.join(where_clause)
    if where_clause:
        where_clause = f"WHERE {where_clause}"

    having_clause = []
    if 'authors' in data.keys():
        having_clause.append("array_agg(author_name) @> %(authors)s::varchar[]")
    if 'keywords' in data.keys():
        having_clause.append("array_agg(keyword_name) @> %(keywords)s::varchar[]")
    if 'categories' in data.keys():
        having_clause.append("array_agg(category_name) @> %(categories)s::varchar[]")
    having_clause = ' AND '.join(having_clause)
    if having_clause:
        having_clause = f"HAVING {having_clause}"

    query = psycopg2.sql.SQL(f"""SELECT {select_clause}\
            FROM book\
            {'LEFT JOIN book_author USING (isbn)' if 'authors' in data.keys() or 'authors' in data['fetch_fields'] else ''}\
            {'LEFT JOIN book_keyword USING (isbn)' if 'keywords' in data.keys() or 'keywords' in data['fetch_fields'] else ''}\
            {'LEFT JOIN book_category USING (isbn)' if 'categories' in data.keys() or 'categories' in data['fetch_fields'] else ''}\
            {'LEFT JOIN item USING (isbn)' if 'school_id' in data.keys() or 'item_number' in data['fetch_fields'] else ''}\
            {where_clause}\
            GROUP BY isbn\
            {having_clause}\
            {'ORDER BY (title <-> %(title)s)' if 'title' in data.keys() else ''}\
            {'OFFSET %(offset)s' if 'offset' in data.keys() else ''}\
            {'LIMIT %(limit)s' if 'limit' in data.keys() else ''}""")
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, data)
            results = cur.fetchall()
            return {"success": True, "books": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

UPDATE_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "old_isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher_name": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            },
        "required": ["old_isbn"],
        "additionalProperties": False
        }

@bp.route("/", methods=["PATCH"])
def update_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, UPDATE_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            if "authors" in data.keys():
                cur.execute("DELETE FROM book_author WHERE isbn = %s", (data["old_isbn"],))
                psycopg2.extras.execute_batch(cur, "INSERT INTO book_author (isbn, author_name) VALUES (%s, %s)",\
                        [(data["old_isbn"], author) for author in data["authors"]])
                if "keywords" in data.keys():
                    cur.execute("DELETE FROM book_keyword WHERE isbn = %s", (data["old_isbn"],))
                psycopg2.extras.execute_batch(cur, "INSERT INTO book_keyword (isbn, keyword_name) VALUES (%s, %s)",\
                        [(data["old_isbn"], keyword) for keyword in data["keywords"]])            
                if "categories" in data.keys():
                    cur.execute("DELETE FROM book_category WHERE isbn = %s", (data["old_isbn"],))
                psycopg2.extras.execute_batch(cur, "INSERT INTO book_category (isbn, category_name) VALUES (%s, %s)",\
                        [(data["old_isbn"], category) for category in data["categories"]])


                book_fields = {fieldName: value for fieldName, value in data.items()
                        if fieldName in {"isbn", "title", "publisher_name", "page_number", "summary", "language"}}
                if len(book_fields) > 0:
                    query = psycopg2.sql.SQL("UPDATE book SET {} WHERE isbn={}").format(
                            psycopg2.sql.SQL(", ").join(
                                psycopg2.sql.SQL("{} = {}").format(
                                    psycopg2.sql.Identifier(fieldName), psycopg2.sql.Literal(value))
                                for fieldName, value in book_fields.items()),
                            psycopg2.sql.Literal(data["old_isbn"]))
                    cur.execute(query)
            g.db_conn.commit()
            return {"success": True}, 200
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


# This should be called when a db user tries to add a new book
# and has to select a publisher
@bp.route("/publisher/", methods=['GET'])
def get_publishers():
    query = psycopg2.sql.SQL("SELECT publisher_name FROM publisher")
    try:
        with g.db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "publishers": results}, 200

    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}


INSERT_PUBLISHER_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "publisher_name": {'type':'string', 'maxLength': 50},
            },
        "required": ["publisher_name"],
        "additionalProperties": False,
        }


# PUBLISHER STUFF GOING ON FROM NOW ON
# Add a publisher
@bp.route("/publisher/", methods=["POST"])
def insert_publisher():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_PUBLISHER_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO publisher (publisher_name) VALUES (%s)", (data['publisher_name'],))
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        return {"success": False, "error": "unknown"}, 400

    return {"success": True}, 201


GET_BOOK_LIST_JSONSCHEMA = {
        "type": "object",
        "properties": {
            },
        "additionalProperties": False,
        }



@bp.route('/get-book-raitings/', methods=['POST'])
@jwt_required(refresh=False,locations=['headers'], verify_type=False)
def get_book_raitings():
    GET_RAITINGS = {
        "type": "object",
        "properties": {
            "isbn": {'type':'string', 'maxLength': 50},
            },
        "required": ["isbn"],
        "additionalProperties": False,
    }
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_RAITINGS)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    query = psycopg2.sql.SQL("""
    SELECT review.rate, review.body, "user".username 
    FROM review
    INNER JOIN "user"
    ON "user".user_id = review.user_id
    WHERE review.active = true AND review.isbn = (%s)""")
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, [data['isbn']])
            results = cur.fetchall()
            return {"success": True, "reviews": results}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}

