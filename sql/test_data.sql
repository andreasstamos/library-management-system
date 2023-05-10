--CHATGPT GENERATED

INSERT INTO publisher (publisher_name) VALUES ('Penguin Books');
INSERT INTO publisher (publisher_name) VALUES ('HarperCollins');
INSERT INTO publisher (publisher_name) VALUES ('Random House');

INSERT INTO book (isbn, title, page_number, summary, language, publisher_name, image_uri) VALUES
('9780142437230', 'To Kill a Mockingbird', 336, 'A classic novel about racial injustice in the American South.', 'English', 'HarperCollins', 'https://upload.wikimedia.org/wikipedia/commons/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg'),
('9780061120084', '1984', 328, 'A dystopian novel about a totalitarian government and its impact on society.', 'English', 'Penguin Books', 'https://upload.wikimedia.org/wikipedia/commons/c/c3/1984first.jpg'),
('9780525537561', 'Becoming', 448, 'A memoir by former First Lady Michelle Obama.', 'English', 'Random House', null);

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

INSERT INTO school (name, address, city, phone, email) VALUES
('ABC School', '123 Main St', 'New York', '+1234567890', 'info@abcschool.com'),
('XYZ School', '456 Elm St', 'Los Angeles', '+9876543210', 'info@xyzschool.com');

INSERT INTO item (isbn, school_id) VALUES
('9780142437230', 1),
('9780061120084', 1),
('9780525537561', 2);

INSERT INTO "user" (school_id, first_name, last_name, email, username, password_hash, dob, active) VALUES
--password123
(1, 'John', 'Doe', 'johndoe@example.com', 'johndoe', '$2b$12$M3JfFI4eG/AInpxxJ5yZ6Orc/iu2dPGf96yMmtmsb/xpW1jAuXYMq', '1990-01-01', true),
--letmein123
(1, 'Jane', 'Doe', 'janedoe@example.com', 'janedoe', '$2b$12$kwVH7O4tG0PU3R/w6XnEZOt63vG2UjY5oJj.CErFhIWpK2xpZB3JG', '1995-05-05', true);

INSERT INTO lib_user (user_id) VALUES (1);

INSERT INTO review (isbn, user_id, rate, body, active) VALUES
('9780142437230', 1, 5, 'This is a must-read classic that everyone should experience.', true),
('9780525537561', 1, 5, 'Becoming is an inspiring memoir that shows the power of hard work and determination.', true),
('9780061120084', 1, 2, 'This book was too depressing for me. I wouldn''t recommend it unless you want to feel hopeless about the world.', true),
('9780142437230', 2, 4, 'To Kill a Mockingbird is a timeless classic that is still relevant today.', true),
('9780525537561', 2, 3, 'I enjoyed reading this book, but it didn''t quite live up to the hype for me.', true),
('9780061120084', 2, 4, '1984 is a dark and thought-provoking book that really makes you question the world we live in.', true);
