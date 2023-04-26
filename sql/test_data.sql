--CHATGPT GENERATED

INSERT INTO publisher (publisher_name) VALUES ('Penguin Books');
INSERT INTO publisher (publisher_name) VALUES ('HarperCollins');
INSERT INTO publisher (publisher_name) VALUES ('Random House');

INSERT INTO book (isbn, title, page_number, summary, language, publisher_name) VALUES
('9780142437230', 'To Kill a Mockingbird', 336, 'A classic novel about racial injustice in the American South.', 'English', 'HarperCollins'),
('9780061120084', '1984', 328, 'A dystopian novel about a totalitarian government and its impact on society.', 'English', 'Penguin Books'),
('9780525537561', 'Becoming', 448, 'A memoir by former First Lady Michelle Obama.', 'English', 'Random House');

INSERT INTO book_author (isbn, author_name) VALUES
('9780142437230', 'Harper Lee'),
('9780061120084', 'George Orwell'),
('9780525537561', 'Michelle Obama');

INSERT INTO category (category_name) VALUES ('Fiction');
INSERT INTO category (category_name) VALUES ('Non-fiction');

INSERT INTO book_category (isbn, category_name) VALUES
('9780142437230', 'Fiction'),
('9780061120084', 'Fiction'),
('9780525537561', 'Non-fiction');

INSERT INTO book_keyword (isbn, keyword_name) VALUES
('9780142437230', 'race'),
('9780142437230', 'justice'),
('9780061120084', 'dystopia'),
('9780061120084', 'government'),
('9780525537561', 'memoir'),
('9780525537561', 'politics');

INSERT INTO item (isbn, school_id) VALUES
('9780142437230', 2),
('9780061120084', 2),
('9780525537561', 2);

