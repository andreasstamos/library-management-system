DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS book_author;
DROP TABLE IF EXISTS book_category;
DROP TABLE IF EXISTS book_keyword;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS school;

CREATE TABLE book (
	isbn varchar(13) PRIMARY KEY CHECK (isbn ~ '^[0-9]{13}'),
	title TEXT,
	publisher TEXT,
	page_number integer,
	summary TEXT,
	language TEXT
);

CREATE TABLE book_author (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE ON UPDATE CASCADE,
	author TEXT NOT NULL
);

CREATE TABLE book_category (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE ON UPDATE CASCADE,
	category TEXT NOT NULL
);

CREATE TABLE book_keyword (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE ON UPDATE CASCADE,
	keyword TEXT NOT NULL
);

CREATE TABLE school (
	school_id SERIAL PRIMARY KEY,
	name TEXT,
	address TEXT,
	city TEXT,
	phone TEXT CHECK (phone ~ '^\+[0-9]+'),
	email TEXT UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$')
);

CREATE TABLE "user" (
	user_id SERIAL PRIMARY KEY,
	school_id SERIAL REFERENCES school,
	first_name TEXT,
	last_name TEXT,
	email TEXT UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$'),
	username TEXT NOT NULL UNIQUE,
	password_hash TEXT
);

CREATE TABLE item (
	item_id SERIAL PRIMARY KEY,
	isbn varchar(13) REFERENCES book ON UPDATE CASCADE,
	school_id SERIAL REFERENCES school
);

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE borrow (
	item_id SERIAL REFERENCES item,
	borrower_id SERIAL REFERENCES "user",
	period TSTZRANGE DEFAULT TSTZRANGE(NOW(), NULL),
	expected_return DATE CHECK (expected_return >= LOWER(period)),
	EXCLUDE USING GIST (item_id WITH =, period WITH &&)
);

