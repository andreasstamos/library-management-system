DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS book_author;
DROP TABLE IF EXISTS book_category;
DROP TABLE IF EXISTS book_keyword;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS keyword;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS publisher;
DROP TABLE IF EXISTS lib_user;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS "admin";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS school;

CREATE TABLE publisher (
	publisher_id SERIAL PRIMARY KEY,
	publisher_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX index_publisher ON publisher USING GIST (publisher_name gist_trgm_ops);

CREATE TABLE book (
	isbn VARCHAR(13) PRIMARY KEY CHECK (isbn ~ '^[0-9]{13}'),
	title VARCHAR(200),
	page_number SMALLINT CHECK (page_number > 0),
	summary VARCHAR(10000),
	language VARCHAR(30),
	publisher_id INTEGER REFERENCES publisher,
	image_uri VARCHAR(1000)
);


CREATE INDEX index_book_title ON book USING GIST (publisher_name gist_trgm_ops);
CREATE INDEX index_book_publisher_id ON book (publisher_id);

CREATE TABLE author (
	author_id SERIAL PRIMARY KEY,
	author_name VARCHAR(100) UNIQUE NOT NULL UNIQUE
);

CREATE INDEX index_author ON author USING GIST (author_name gist_trgm_ops);

CREATE TABLE book_author (
	isbn VARCHAR(13) NOT NULL REFERENCES book ON UPDATE CASCADE,
	author_id INTEGER NOT NULL REFERENCES author,
	UNIQUE(isbn, author_id) --builts index
);

CREATE TABLE category (
	category_id SERIAL PRIMARY KEY,
	category_name VARCHAR(20) NOT NULL UNIQUE
);

CREATE INDEX index_category ON category USING GIST (category_name gist_trgm_ops);

CREATE TABLE book_category (
	isbn VARCHAR(13) NOT NULL REFERENCES book,
	category_id INTEGER NOT NULL REFERENCES category,
	UNIQUE(isbn, category_id)
);

CREATE TABLE keyword (
	keyword_id SERIAL PRIMARY KEY,
	keyword_name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE book_keyword (
	isbn VARCHAR(13) NOT NULL REFERENCES book,
	keyword_id INTEGER NOT NULL REFERENCES keyword,
	UNIQUE(isbn, keyword_id)
);

CREATE TABLE school (
	school_id SERIAL PRIMARY KEY,
	name VARCHAR(150) NOT NULL,
	address VARCHAR(20) NOT NULL,
	city VARCHAR(50) NOT NULL,
	phone VARCHAR(15) CHECK (phone ~ '^\+[0-9]+'),
	email VARCHAR(256) UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$')
);

CREATE TABLE "user" (
	user_id SERIAL PRIMARY KEY,
	school_id INTEGER NOT NULL REFERENCES school ON DELETE CASCADE,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(256) UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$'),
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(500) NOT NULL,
	dob DATE NOT NULL,
	active BOOLEAN DEFAULT FALSE
);

CREATE INDEX index_user_username ON "user" (username);
CREATE INDEX index_user_active ON "user" (active);
CREATE INDEX index_user_school_id ON "user" (school_id);

CREATE TABLE "admin" (
	admin_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL UNIQUE REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE lib_user (
	lib_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL UNIQUE REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE student (
	student_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL UNIQUE REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE teacher (
	teacher_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL UNIQUE REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE item (
	item_id SERIAL PRIMARY KEY,
	isbn varchar(13) NOT NULL REFERENCES book ON UPDATE CASCADE ON DELETE CASCADE,
	school_id INTEGER NOT NULL REFERENCES school ON DELETE CASCADE
);

CREATE INDEX index_item ON item (isbn, school_id);

CREATE TABLE review (
	review_id SERIAL PRIMARY KEY,
	isbn VARCHAR(13) NOT NULL REFERENCES "book" ON DELETE CASCADE,
	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE,
	rate SMALLINT NOT NULL CHECK (rate >= 1 AND rate <= 5),
	body VARCHAR(500) NOT NULL,
	active BOOLEAN DEFAULT FALSE,
	UNIQUE(user_id, isbn)
	-- One user can do only one review on a specific book
);

CREATE INDEX index_review ON review (isbn, active);

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE borrow (
	borrow_id SERIAL PRIMARY KEY,
	item_id INTEGER NOT NULL REFERENCES item ON DELETE CASCADE,
	lender_id INTEGER NOT NULL REFERENCES "user" ON DELETE CASCADE,
	borrower_id INTEGER NOT NULL REFERENCES "user" ON DELETE CASCADE,
	period TSTZRANGE NOT NULL DEFAULT TSTZRANGE(NOW(), NULL),
	expected_return DATE CHECK (expected_return >= LOWER(period)),
	EXCLUDE USING GIST (item_id WITH =, period WITH &&)
);

CREATE INDEX index_borrow_item_id ON borrow (item_id);
CREATE INDEX index_borrow_borrower_id ON borrow (borrower_id);

CREATE TABLE booking (
 	booking_id SERIAL PRIMARY KEY,
	borrow_id INTEGER REFERENCES borrow ON DELETE CASCADE,
 	isbn VARCHAR(13) NOT NULL REFERENCES book,
 	user_id INTEGER NOT NULL REFERENCES "user",
 	period TSTZRANGE NOT NULL DEFAULT (TSTZRANGE(NOW(), NOW() + INTERVAL '1 week')),
	EXCLUDE USING GIST (user_id WITH =, isbn WITH =, period WITH &&)
);

CREATE INDEX index_booking_isbn ON booking (isbn);
CREATE INDEX index_booking_user_id ON booking (user_id);

