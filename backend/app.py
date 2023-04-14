from flask import Flask, jsonify
import psycopg2


app = Flask(__name__)
conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="library",
        user="postgres",
        password="test"
)

@app.route("/", methods=["GET"])
def index():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM books;")
    results = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    print(columns)
    return results