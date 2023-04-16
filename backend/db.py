import psycopg2

def insertBook(isbn, title, authors, publisher, page_number, summary, language, keywords, categories):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO book (isbn, title, publisher, page_number, summary, language)\
                VALUES (%s, %s, %s, %s, %s, %s)", (isbn, title, publisher, page_number, summary, language))
        for author in authors:
            cur.execute("INSERT INTO book_author (isbn, author) VALUES (%s, %s)", (isbn, author))
        for keyword in keywords:
            cur.execute("INSERT INTO book_keyword (isbn, keyword) VALUES (%s, %s)", (isbn, keyword))
        for category in categories:
            cur.execute("INSERT INTO book_category (isbn, category) VALUES (%s, %s)", (isbn, category))
        conn.commit()

def insertSchool():
    with conn.cursor() as cur:
        cur.execute("INSERT INTO school DEFAULT VALUES RETURNING school_id")
        conn.commit()
        return cur.fetchone()[0]

def insertItem(isbn, school_id):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO item (isbn, school_id) VALUES (%s, %s) RETURNING item_id", (isbn,school_id))
        conn.commit()
        return cur.fetchone()[0]

def insertUser(school_id, username, first_name, last_name, email, password_hash):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO \"user\" (school_id, username, first_name, last_name, email, password_hash) VALUES\
                (%s, %s, %s, %s, %s, %s) RETURNING user_id", (school_id, username, first_name, last_name, email, password_hash))
        conn.commit()
        return cur.fetchone()[0]

def insertBorrow(item_id, borrower_id, expected_return):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO borrow (item_id, borrower_id, expected_return) VALUES\
                (%s, %s, %s)", (item_id, borrower_id, expected_return))
        conn.commit()

def returnBorrow(item_id):
    with conn.cursor() as cur:
        cur.execute("UPDATE borrow SET period = TSTZRANGE(LOWER(period), NOW(),  '[]')\
                WHERE item_id = %s AND UPPER_INF(period)", (item_id,))
        conn.commit()

def userBorrowedBooks(user_id):
    with conn.cursor() as cur:
        cur.execute("SELECT book.title FROM \"user\"\
                LEFT OUTER JOIN borrow ON \"user\".user_id = borrow.borrower_id\
                JOIN item USING (item_id)\
                JOIN book USING (isbn)\
                WHERE user_id = %s AND UPPER_INF(borrow.period)", (user_id,))
        return cur.fetchall()

import datetime

import configparser

config = configparser.ConfigParser()
config.read("secrets.ini")

conn = psycopg2.connect(
        host    =   config["DATABASE"]["DB_HOST"],
        port    =   config["DATABASE"].getint("DB_PORT"),
        database=   config["DATABASE"]["DB_NAME"],
        user    =   config["DATABASE"]["DB_USER"],
        password=   config["DATABASE"]["DB_PASSWORD"],
)


insertBook(
        isbn="1234567890123",
        title="TestBook",
        authors=["TestAuthor"],
        publisher="TestPublisher",
        page_number=123,
        summary="testSummary",
        language="testLanguage",
        keywords=["testKeyword"],
        categories=["testCategory"]
        )

school_id = insertSchool()
item_id = insertItem(isbn="1234567890123", school_id=school_id)
user_id = insertUser(
        school_id=school_id,
        username="TestUsername",
        first_name="TestFirstname",
        last_name="TestLastname",
        email="testemail@testdomain.com",
        password_hash="testPasswordhash"
        )

insertBorrow(item_id=item_id, borrower_id=user_id, expected_return=datetime.date(2024,12,1))
print(userBorrowedBooks(user_id))
returnBorrow(item_id=item_id)

insertBorrow(item_id=item_id, borrower_id=user_id, expected_return=datetime.date(2024,12,1))
print(userBorrowedBooks(user_id))
returnBorrow(item_id=item_id)


