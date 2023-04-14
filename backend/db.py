import psycopg2

def insertBook(isbn, title, authors, publisher, pageNumber, summary, language, keywords, categories):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO book (isbn, title, publisher, pageNumber, summary, language)\
                VALUES (%s, %s, %s, %s, %s, %s)", (isbn, title, publisher, pageNumber, summary, language))
        for author in authors:
            cur.execute("INSERT INTO bookAuthor (isbn, author) VALUES (%s, %s)", (isbn, author))
        for keyword in keywords:
            cur.execute("INSERT INTO bookKeyword (isbn, keyword) VALUES (%s, %s)", (isbn, keyword))
        for category in categories:
            cur.execute("INSERT INTO bookCategory (isbn, category) VALUES (%s, %s)", (isbn, category))
        conn.commit()

def insertSchool():
    with conn.cursor() as cur:
        cur.execute("INSERT INTO school DEFAULT VALUES RETURNING schoolId")
        conn.commit()
        return cur.fetchone()[0]

def insertItem(isbn, schoolId):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO item (isbn, schoolId) VALUES (%s, %s) RETURNING itemId", (isbn,schoolId))
        conn.commit()
        return cur.fetchone()[0]

def insertUser(schoolId, username, firstName, lastName, email, passwordHash):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO \"user\" (schoolId, username, firstName, lastName, email, passwordHash) VALUES\
                (%s, %s, %s, %s, %s, %s) RETURNING schoolId", (schoolId, username, firstName, lastName, email, passwordHash))
        conn.commit()
        return cur.fetchone()[0]

def insertBorrow(itemId, borrowerId, expectedReturn):
    with conn.cursor() as cur:
        cur.execute("INSERT INTO borrow (itemId, borrowerId, expectedReturn) VALUES\
                (%s, %s, %s)", (itemId, borrowerId, expectedReturn))
        conn.commit()

def returnBorrow(itemId):
    with conn.cursor() as cur:
        cur.execute("UPDATE borrow SET period = TSTZRANGE(LOWER(period), NOW(),  '[]')\
                WHERE itemId = %s AND UPPER_INF(period)", (itemId,))
        conn.commit()

def userBorrowedBooks(userId):
    with conn.cursor() as cur:
        cur.execute("SELECT book.title FROM \"user\"\
                LEFT OUTER JOIN borrow ON \"user\".userId = borrow.borrowerId\
                JOIN item USING (itemId)\
                JOIN book USING (isbn)\
                WHERE userId = %s AND UPPER_INF(borrow.period)", (userId,))
        return cur.fetchall()

import datetime

conn = psycopg2.connect(dbname="library", user="libraryapi")

insertBook(
        isbn="1234567890123",
        title="TestBook",
        authors=["TestAuthor"],
        publisher="TestPublisher",
        pageNumber=123,
        summary="testSummary",
        language="testLanguage",
        keywords=["testKeyword"],
        categories=["testCategory"]
        )

schoolId = insertSchool()
itemId = insertItem(isbn="1234567890123", schoolId=schoolId)
userId = insertUser(
        schoolId=schoolId,
        username="TestUsername",
        firstName="TestFirstname",
        lastName="TestLastname",
        email="testemail@testdomain.com",
        passwordHash="testPasswordhash"
        )

insertBorrow(itemId=itemId, borrowerId=userId, expectedReturn=datetime.date(2024,12,1))
print(userBorrowedBooks(userId))
returnBorrow(itemId=itemId)

insertBorrow(itemId=itemId, borrowerId=userId, expectedReturn=datetime.date(2024,12,1))
print(userBorrowedBooks(userId))
returnBorrow(itemId=itemId)


