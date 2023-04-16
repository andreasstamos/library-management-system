import configparser


import psycopg2
import psycopg2.extras
import psycopg2.sql

from flask import Flask, request
import jsonschema


config = configparser.ConfigParser()
config.read("secrets.ini")

app = Flask(__name__)
conn = psycopg2.connect(
        host    =   config["DATABASE"]["DB_HOST"],
        port    =   config["DATABASE"].getint("DB_PORT"),
        database=   config["DATABASE"]["DB_NAME"],
        user    =   config["DATABASE"]["DB_USER"],
        password=   config["DATABASE"]["DB_PASSWORD"],
)

book_jsonschema = {
        "type": "object",
        "properties": {
            "isbn": {"type": "string", "pattern": "^[0-9]{13}$"},
            "title": {"type": "string"},
            "publisher": {"type": "string"},
            "pageNumber": {"type": "integer", "minimum": 0},
            "summary": {"type": "string"},
            "language": {"type": "string"},
            "authors": {"type": "array", "items": {"type": "string"}, "minItems": 1},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "categories": {"type": "array", "items": {"type": "string"}},
            },
        "additionalProperties": False,
        }

insert_book_jsonschema = dict(book_jsonschema)
insert_book_jsonschema["required"] = ["isbn", "title", "publisher", "pageNumber", "summary", "language", "authors", "keywords", "categories"]


@app.route("/book/", methods=["POST"])
def insert_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, book_jsonschema)
    except jsonschema.ValidationError as err:
        return {"success": False, "error": err.message}, 400

    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO book (isbn, title, publisher, pageNumber, summary, language)\
                    VALUES (%s, %s, %s, %s, %s, %s)",\
                    (data["isbn"], data["title"], data["publisher"], data["pageNumber"], data["summary"], data["language"]))

            for author in data["authors"]:
                cur.execute("INSERT INTO bookAuthor (isbn, author) VALUES (%s, %s)",\
                        (data["isbn"], author))
            for keyword in data["keywords"]:
                cur.execute("INSERT INTO bookKeyword (isbn, keyword) VALUES (%s, %s)",\
                        (data["isbn"], keyword))
            for category in data["categories"]:
                cur.execute("INSERT INTO bookCategory (isbn, category) VALUES (%s, %s)",\
                        (data["isbn"], category))
            conn.commit()
    except psycopg2.IntegrityError as err:
        conn.rollback()
        return {"success": False, "error": err.pgerror}, 400
    except psycopg2.Error as err:
        conn.rollback()
        return {"success": False, "error": "unknown"}, 400

    return {"success": True}, 201

@app.route("/book/", methods=["GET"])
def get_book():
    data = request.get_json()
    try:
        jsonschema.validate(data, book_jsonschema)
    except jsonschema.ValidationErorr as err:
        return {"success": False, "error": err.message}, 400

    try:
        with conn.cursor(cursor_factory = psycopg2.extras.RealDictCursor) as cur:
            query = psycopg2.sql.SQL("SELECT * FROM book")
            if len(data) > 0:
                query += psycopg2.sql.SQL(" WHERE{}").format(
                        psycopg2.sql.SQL(" AND ").join(
                            psycopg2.sql.SQL("{} = %s").format(psycopg2.sql.Identifier(fieldName)) for fieldName in data.keys()
                            )
                        )
            cur.execute(query, tuple(data.values()))
            results = cur.fetchall()
            return {"success": True, "books": results}, 200
    except psycopg2.Error as err:
        print(err.pgerror)
        return {"success": False, "error": "unknown"}

app.run(host='0.0.0.0', port=5000)
