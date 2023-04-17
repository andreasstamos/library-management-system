import configparser

import psycopg2
import psycopg2.extras
import psycopg2.sql
import psycopg2.pool

from flask import Flask, request, g
import jsonschema

config = configparser.ConfigParser()
config.read("secrets.ini")

app = Flask(__name__)
db_pool = psycopg2.pool.SimpleConnectionPool(
        minconn     =   config["DATABASE"].getint("DB_MIN_CONNECTIONS"),
        maxconn     =   config["DATABASE"].getint("DB_MAX_CONNECTIONS"),
        host        =   config["DATABASE"]["DB_HOST"],
        port        =   config["DATABASE"].getint("DB_PORT"),
        database    =   config["DATABASE"]["DB_NAME"],
        user        =   config["DATABASE"]["DB_USER"],
        password    =   config["DATABASE"]["DB_PASSWORD"],
)


@app.before_request
def before_request():
    g.db_conn = db_pool.getconn()

@app.teardown_request
def teardown_request(exception=None):
    db_pool.putconn(g.db_conn)



INSERT_BOOK_JSONSCHEMA = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            },
        "additionalProperties": False,
        "required": ["isbn", "title", "publisher", "page_number", "summary", "language", "authors", "keywords", "categories"]
        }


@app.route("/book/", methods=["POST"])
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
                    (data["isbn"], data["title"], data["page_number"], data["summary"], data["language"], data["publisher"]))

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
            "publisher": {"type": "string"},
            "page_number": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "categories": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            },
        "additionalProperties": False,
        }

@app.route("/book/", methods=["GET"])
def get_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, GET_BOOK_JSONSCHEMA)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    query = psycopg2.sql.SQL("SELECT book.*,\
 array_remove(array_agg(DISTINCT book_author.author_name), NULL) AS authors,\
 array_remove(array_agg(DISTINCT book_keyword.keyword_name), NULL) AS keywords,\
 array_remove(array_agg(DISTINCT book_category.category_name), NULL) AS categories\
 FROM book\
 LEFT OUTER JOIN book_author USING (isbn)\
 LEFT OUTER JOIN book_keyword USING (isbn)\
 LEFT OUTER JOIN book_category USING (isbn)")

    where_clause = {fieldName: value for fieldName, value in data.items()
            if fieldName in {"isbn", "title", "page_number", "language", "publisher_name"}}


    if len(where_clause) > 0:
        query += psycopg2.sql.SQL(" WHERE {}").format(
                psycopg2.sql.SQL(" AND ").join(
                    psycopg2.sql.SQL(f"{{}} {'IN' if type(value) is tuple else '='} {{}}").format(psycopg2.sql.Identifier(fieldName), psycopg2.sql.Literal(value))
                    for fieldName, value in where_clause.items()))

    query += psycopg2.sql.SQL(" GROUP BY isbn")

    having_sql = []
    if "authors" in data.keys():
        having_sql.append(psycopg2.sql.SQL("array_agg(book_author.author_name) @> {}::varchar[]").format(
                psycopg2.sql.Literal(data["authors"])))

    if "keywords" in data.keys():
        having_sql.append(psycopg2.sql.SQL("array_agg(book_keyword.keyword_name) @> {}::varchar[]").format(
                psycopg2.sql.Literal(data["keywords"])))

    if "categories" in data.keys():
        having_sql.append(psycopg2.sql.SQL("array_agg(book_categoru.category_name) @> {}::varchar[]").format(
                psycopg2.sql.Literal(data["categories"])))
    
    if len(having_sql) > 0:
        query += psycopg2.sql.SQL(" HAVING {}").format(
                psycopg2.sql.SQL(" AND ").join(having_sql)) 

    try:
        with g.db_conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query)
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
            "publisher": {"type": "string"},
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

@app.route("/book/", methods=["PATCH"])
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
                if fieldName in {"isbn", "title", "publisher", "page_number", "summary", "language"}}
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
@app.route("/get-publishers/", methods=['GET'])
def get_publishers():
    query = psycopg2.sql.SQL("SELECT * FROM publisher")
    try:
        with g.db_conn.cursor() as cur:
            cur.execute(query)
            results = cur.fetchall()
            return {"success": True, "publishers": serializer(results, cur.description)}, 200

    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}
    
# PUBLISHER STUFF GOING ON FROM NOW ON
# Add a publisher
@app.route("/new-publisher/", methods=["POST"])
def new_publisher():
    new_publisher_schema = {
        "type": "object",
        "properties": {
            "name": {'type':'string', 'maxLength': 50},
            },
        "required": ["name"],
        "additionalProperties": False,
        }
    data = request.get_json()
    try:
        jsonschema.validate(data, new_publisher_schema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400
    
    try:
        with g.db_conn.cursor() as cur:
            cur.execute("INSERT INTO publisher (name) VALUES (%s)", [data['name']])
            g.db_conn.commit()
    except psycopg2.IntegrityError as err:
        g.db_conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        g.db_conn.rollback()
        return {"success": False, "error": "unknown"}, 400
    
    return {"success": True}, 201

app.run(host='0.0.0.0', port=5000)
