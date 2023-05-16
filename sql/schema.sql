DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS book_author;
DROP TABLE IF EXISTS book_category;
DROP TABLE IF EXISTS book_keyword;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS publisher;
DROP TABLE IF EXISTS lib_user;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS "admin";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS school;

CREATE TABLE publisher (
	publisher_name VARCHAR(50) PRIMARY KEY
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE book (
	isbn VARCHAR(13) PRIMARY KEY CHECK (isbn ~ '^[0-9]{13}'),
	title VARCHAR(200),
	page_number SMALLINT CHECK (page_number > 0),
	summary VARCHAR(10000),
	language VARCHAR(30),
	publisher_name VARCHAR(50) REFERENCES publisher ON UPDATE CASCADE,
	image_uri VARCHAR(1000)
);

CREATE TABLE book_author (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE ON UPDATE CASCADE,
	author_name VARCHAR(100) NOT NULL,
	UNIQUE(isbn, author_name)
);

CREATE TABLE category (
	category_name VARCHAR(20) PRIMARY KEY
);

CREATE TABLE book_category (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE,
	category_name VARCHAR(20) REFERENCES category ON UPDATE CASCADE,
	UNIQUE(isbn, category_name)
);

CREATE TABLE book_keyword (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE,
	keyword_name VARCHAR(20) NOT NULL,
	UNIQUE(isbn, keyword_name)
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
	school_id SERIAL REFERENCES school ON DELETE CASCADE,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(256) UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$'),
	username VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(500) NOT NULL,
	dob DATE NOT NULL,
	active BOOLEAN DEFAULT FALSE
);

CREATE TABLE "admin" (
	admin_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE lib_user (
	lib_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE student (
	student_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE teacher (
	teacher_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE item (
	item_id SERIAL PRIMARY KEY,
	isbn varchar(13) REFERENCES book ON UPDATE CASCADE,
	school_id SERIAL REFERENCES school
);

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

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE borrow (
	item_id SERIAL REFERENCES item,
	borrower_id SERIAL REFERENCES "user",
	period TSTZRANGE DEFAULT TSTZRANGE(NOW(), NULL),
	expected_return DATE CHECK (expected_return >= LOWER(period)),
	EXCLUDE USING GIST (item_id WITH =, period WITH &&)
);

-- CREATE TABLE booking (
-- 	booking_id SERIAL PRIMARY KEY,
-- 	isbn VARCHAR(13) NOT NULL REFERENCES "book" ON DELETE CASCADE,
-- 	user_id INT NOT NULL REFERENCES "user" ON DELETE CASCADE,
-- 	period TSTZRANGE DEFAULT (TSTZRANGE(NOW(), NOW() + INTERVAL '1 week')),

-- )
