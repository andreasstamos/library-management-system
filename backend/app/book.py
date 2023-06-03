from flask import Blueprint, request, g
import jsonschema
import psycopg2.sql
import psycopg2.extras

from flask_jwt_extended import jwt_required, get_jwt_identity

from .roles_decorators import check_roles

bp = Blueprint("book", __name__)


def insert_multiple_entity_relationship_book(cur, entity, entity_type, values, isbn):
    cur.execute(f"CREATE TEMPORARY TABLE temp ({entity}_name {entity_type})")
    psycopg2.extras.execute_values(cur, f"INSERT INTO temp ({entity}_name) VALUES %s", ((value,) for value in values))
    cur.execute(f"INSERT INTO {entity} ({entity}_name) SELECT {entity}_name FROM temp ON CONFLICT DO NOTHING")
    cur.execute(f"DELETE FROM book_{entity} WHERE isbn = %s", (isbn,))
    cur.execute(f"INSERT INTO book_{entity} (isbn, {entity}_id)\
            SELECT %s, {entity}_id FROM temp JOIN {entity} USING ({entity}_name)", (isbn,))
    cur.execute("DROP TABLE temp");

INSERT_UPDATE_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "new_isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0, "maximum": 32767},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            "image_uri": {"type": "string", "format": "uri"},
            "insert_item": {"type": "boolean"}, #If given will also insert one item (the 1st item) at the school_id in the jwt identity
            },
        "additionalProperties": False,
        "required": ["isbn", "title", "publisher", "page_number", "summary", "language", "authors", "keywords", "categories"],
        }

@bp.route("/insert-update/", methods=["POST"])
@check_roles("lib_editor")
def insert_update_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, INSERT_UPDATE_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    insert_item = False
    if "insert_item" in data.keys() and data["insert_item"]:
        identity = get_jwt_identity()
        school_id = identity["school_id"]
        insert_item = True
    
    try:
        with g.db_conn.cursor() as cur:           
            cur.execute("INSERT INTO publisher (publisher_name) VALUES (%s) ON CONFLICT DO NOTHING",\
                    (data["publisher"],))
             
            cur.execute("INSERT INTO book (isbn, title, page_number, summary, language, image_uri, publisher_id)\
                    SELECT %s, %s, %s, %s, %s, %s, publisher_id\
                    FROM publisher\
                    WHERE publisher_name = %s\
                    ON CONFLICT (isbn) DO UPDATE SET\
                        title = EXCLUDED.title,\
                        page_number = EXCLUDED.page_number,\
                        summary = EXCLUDED.summary,\
                        language = EXCLUDED.language,\
                        publisher_id = EXCLUDED.publisher_id,\
                        image_uri = EXCLUDED.image_uri",
                    (data["isbn"], data["title"], data["page_number"], data["summary"], data["language"], data["publisher"], data["image_uri"]))

            if "new_isbn" in data.keys():
                cur.execute("UPDATE book SET isbn = %s WHERE isbn = %s", (data["new_isbn"], data["isbn"]))

            insert_multiple_entity_relationship_book(cur, "author", "VARCHAR(100)", data["authors"], data["isbn"])
            insert_multiple_entity_relationship_book(cur, "category", "VARCHAR(100)", data["categories"], data["isbn"])
            insert_multiple_entity_relationship_book(cur, "keyword", "VARCHAR(100)", data["keywords"], data["isbn"])

            if insert_item:
                cur.execute("INSERT INTO item (isbn, school_id) VALUES (%s, %s) RETURNING item_id", (data["isbn"], school_id))
                item_id = cur.fetchone()[0]

            g.db_conn.commit()

            if insert_item:
                return {"success": True, "item_id": item_id}, 201

            return {"success": True}, 201
 
    except psycopg2.Error as err:
        g.db_conn.rollback()
        print(err)
        return {"success": False, "error": "unknown"}, 400

GET_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "item_id": {"type": "integer"},
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},

            "title": {"type": "string"},
            
            "publishers": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "categories": {"type": "array", "items": {"type": "string"}, "minItems": 1},

            "limit": {"type": "integer", "minimum": 1},
            "offset": {"type": "integer", "minimum": 0},
            
            "fetch_fields": {"type": "array", "minItems": 1, "items": {"type": "string", "enum":\
                    ["isbn", "title", "publisher_name", "page_number", "language", "summary", "image_uri",
                        "authors", "keywords", "categories", "rate", "items_available"]}}
            },
        "additionalProperties": False,
        "required": ["fetch_fields"],
        }

# typicaly i think we should prevent students/teachers from searching by item_id
@bp.route("/get/", methods=["POST"])
@check_roles()
def get_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    select_clause = []
    select_clause += set(data["fetch_fields"]) - {"items_available"}
    if "items_available" in data["fetch_fields"]:
        select_clause.append("items_available(isbn, %(user_id)s) AS items_available")
        data["user_id"] = get_jwt_identity()["user_id"]
    select_clause = ','.join(select_clause)

    join_clause = []
    if 'authors' in data.keys() or 'authors' in data["fetch_fields"]:
        join_clause.append("""LEFT JOIN (\
                SELECT isbn, ARRAY_AGG(author_name) AS authors\
                FROM book_author\
                JOIN author USING (author_id)\
                GROUP BY isbn) AS authors\
                USING (isbn)""")

    if 'keywords' in data.keys() or 'keywords' in data["fetch_fields"]:
        join_clause.append("""LEFT JOIN (\
                SELECT isbn, ARRAY_AGG(keyword_name) AS keywords\
                FROM book_keyword\
                JOIN keyword USING (keyword_id)\
                GROUP BY isbn) AS keywords\
                USING (isbn)""")

    if 'categories' in data.keys() or 'categories' in data["fetch_fields"]:
        join_clause.append("""LEFT JOIN (\
                SELECT isbn, ARRAY_AGG(category_name) AS categories\
                FROM book_category\
                JOIN category USING (category_id)\
                GROUP BY isbn) AS categories\
                USING (isbn)""")

    if 'rate' in data["fetch_fields"]:
        join_clause.append("""LEFT JOIN (\
                SELECT isbn, ROUND(AVG(rate)) AS rate\
                FROM review\
                WHERE active=true\
                GROUP BY isbn) AS rate\
                USING (isbn)""")

    if 'publishers' in data.keys() or 'publisher_name' in data["fetch_fields"]:
        join_clause.append('LEFT JOIN publisher USING (publisher_id)') 

    join_clause = ' '.join(join_clause)

    where_clause = []
    where_clause += [f"{field} && %({field})s::varchar[]"
            for field in {'authors', 'keywords', 'categories'} & set(data.keys())]
    if 'publishers' in data.keys():
        data["publishers"] = tuple(data["publishers"])
        where_clause.append("publisher_name IN %(publishers)s")
    where_clause = ' AND '.join(where_clause)
    
    if 'isbn' in data.keys():
        where_clause = "isbn = %(isbn)s"
    if 'item_id' in data.keys():
        where_clause = "isbn = (SELECT isbn FROM item WHERE item_id = %(item_id)s)"
    if where_clause:
        where_clause = f"WHERE {where_clause}"

    query = f"""SELECT {select_clause}\
            FROM book\
            {join_clause}
            {where_clause}\
            {'ORDER BY (title <-> %(title)s)' if 'title' in data.keys() else ''}\
            {'OFFSET %(offset)s' if 'offset' in data.keys() else ''}\
            {'LIMIT %(limit)s' if 'limit' in data.keys() else ''}"""
    
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, data)
            results = cur.fetchall()
            return {"success": True, "books": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}, 200


GET_PUBLISHER_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "additionalProperties": False,
        }

# This should be called when a db user tries to add a new book
# and has to select a publisher
@bp.route("/publisher/get/", methods=["POST"])
def get_publisher():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_CATEGORY_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT publisher_name FROM publisher")
            publishers = cur.fetchall()
            return {"success": True, "publishers": publishers}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400

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
@bp.route("/publisher/insert/", methods=["POST"])
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


@bp.route('/get-book-raitings/', methods=['POST'])
@check_roles()
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

GET_CATEGORY_JSONSCHEMA = {
        "type": "object",
        "properties": {},
        "additionalProperties": False,
        }

@bp.route("/category/get/", methods=["POST"])
def get_category():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_CATEGORY_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT category_id, category_name FROM category")
            categories = cur.fetchall()
            return {"success": True, "categories": categories}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400

GET_KEYWORD_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "keyword": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1}
            },
        "additionalProperties": False,
        }

@bp.route("/keyword/get/", methods=["POST"])
def get_keyword():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_KEYWORD_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    query = f"""SELECT keyword_name\
            FROM keyword\
            {'ORDER BY (keyword_name <-> %(keyword)s)' if 'keyword' in data.keys() else ''}\
            {'LIMIT %(limit)s' if 'limit' in data.keys() else ''}"""
 
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, data)
            keywords = cur.fetchall()
            return {"success": True, "keywords": keywords}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400


GET_AUTHOR_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "author": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1}
            },
        "additionalProperties": False,
        }

@bp.route("/author/get/", methods=["POST"])
def get_author():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_AUTHOR_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    query = f"""SELECT author_name\
            FROM author\
            {'ORDER BY (author_name <-> %(author)s)' if 'author' in data.keys() else ''}\
            {'LIMIT %(limit)s' if 'limit' in data.keys() else ''}"""
 
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, data)
            authors = cur.fetchall()
            return {"success": True, "authors": authors}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400

GET_LANGUAGE_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "language": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1}
            },
        "additionalProperties": False,
        }

@bp.route("/language/get/", methods=["POST"])
def get_language():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_LANGUAGE_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    query = f"""WITH languages AS (\
                    SELECT DISTINCT language\
                    FROM book\
                )\
                SELECT language\
                FROM languages\
                {'ORDER BY (language <-> %(language)s)' if 'language' in data.keys() else ''}\
                {'LIMIT %(limit)s' if 'limit' in data.keys() else ''}"""
 
    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, data)
            languages = cur.fetchall()
            return {"success": True, "languages": languages}, 200
    except psycopg2.Error as err:
        print(err)
        return {"success": False, "error": "unknown"}, 400