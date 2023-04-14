DROP TABLE IF EXISTS borrow;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS bookAuthor;
DROP TABLE IF EXISTS bookCategory;
DROP TABLE IF EXISTS bookKeyword;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS school;

CREATE TABLE book (
	isbn varchar(13) PRIMARY KEY,
	title TEXT,
	publisher TEXT,
	pageNumber integer,
	summary TEXT,
	language TEXT
);

CREATE TABLE bookAuthor (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE,
	author TEXT NOT NULL
);

CREATE TABLE bookCategory (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE,
	category TEXT NOT NULL
);

CREATE TABLE bookKeyword (
	isbn varchar(13) REFERENCES book ON DELETE CASCADE,
	keyword TEXT NOT NULL
);

CREATE TABLE school (
	schoolId SERIAL PRIMARY KEY,
	name TEXT,
	address TEXT,
	city TEXT,
	phone TEXT CHECK (phone ~ '^\+[0-9]+'),
	email TEXT UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$')
);

CREATE TABLE "user" (
	userId SERIAL PRIMARY KEY,
	schoolId SERIAL REFERENCES school,
	firstname TEXT,
	lastname TEXT,
	email TEXT UNIQUE CHECK (email ~ '^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-z]{2,}$'),
	username TEXT NOT NULL UNIQUE,
	passwordhash TEXT
);

CREATE TABLE item (
	itemId SERIAL PRIMARY KEY,
	isbn varchar(13) REFERENCES book CHECK (isbn ~ '^[0-9]{13}'),
	schoolId SERIAL REFERENCES school
);

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE borrow (
	itemId SERIAL REFERENCES item,
	borrowerId SERIAL REFERENCES "user",
	period TSTZRANGE DEFAULT TSTZRANGE(NOW(), NULL),
	expectedReturn DATE CHECK (expectedReturn >= LOWER(period)),
	EXCLUDE USING GIST (itemId WITH =, period WITH &&)
);

