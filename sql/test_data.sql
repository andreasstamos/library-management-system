--CHATGPT GENERATED

-- Insert dummy data into the publisher table
INSERT INTO publisher (publisher_name) VALUES
('ABC Publishers'),
('XYZ Books'),
('The Book Company');

-- Insert dummy data into the book table
INSERT INTO book (isbn, title, page_number, summary, language, publisher_id, image_uri) VALUES
('9780000000001', 'The Adventure Begins', 350, 'Join the thrilling journey of a young hero as he embarks on a quest to save the world.', 'English', 1, 'https://media.gettyimages.com/id/157482029/photo/stack-of-books.jpg?s=612x612&w=gi&k=20&c=_Yaofm8sZLZkKs1eMkv-zhk8K4k5u0g0fJuQrReWfdQ='),
('9780000000002', 'Secrets of the Past', 250, 'Uncover the hidden secrets of a mysterious ancient civilization.', 'English', 2, 'https://static.vecteezy.com/system/resources/previews/009/399/398/original/old-vintage-book-clipart-design-illustration-free-png.png'),
('9780000000003', 'El Misterio del Pasado', 200, 'Descubre los secretos ocultos de una misteriosa civilización antigua.', 'Spanish', 1, 'http://example.com/book3.jpg');

-- Insert dummy data into the author table
INSERT INTO author (author_name) VALUES
('John Smith'),
('Emily Johnson'),
('Michael Anderson');

-- Insert dummy data into the book_author table
INSERT INTO book_author (isbn, author_id) VALUES
('9780000000001', 1),
('9780000000001', 2),
('9780000000002', 2),
('9780000000003', 3);

-- Insert dummy data into the category table
INSERT INTO category (category_name) VALUES
('Adventure'),
('Mystery'),
('Historical Fiction');

-- Insert dummy data into the book_category table
INSERT INTO book_category (isbn, category_id) VALUES
('9780000000001', 1),
('9780000000001', 2),
('9780000000002', 2),
('9780000000003', 3);

-- Insert dummy data into the keyword table
INSERT INTO keyword (keyword_name) VALUES
('Fantasy'),
('Thriller'),
('Ancient Civilization');

-- Insert dummy data into the book_keyword table
INSERT INTO book_keyword (isbn, keyword_id) VALUES
('9780000000001', 1),
('9780000000001', 2),
('9780000000002', 2),
('9780000000003', 3);

INSERT INTO school (name, address, city, phone, email) VALUES
('ABC School', '123 Main St', 'New York', '+1234567890', 'info@abcschool.com'),
('XYZ School', '456 Elm St', 'Los Angeles', '+9876543210', 'info@xyzschool.com');

INSERT INTO item (isbn, school_id) VALUES
('9780000000001', 1),
('9780000000002', 1),
('9780000000003', 2);

INSERT INTO "user" (school_id, first_name, last_name, email, username, password_hash, dob, active) VALUES
--password123
(1, 'John', 'Doe', 'johndoe@example.com', 'johndoe', '$2b$12$dlE/DWLZoIYcB6UI6rK0I.tL6owgllKG52pM6h6UiGWhHipwyfQ.6', '1990-01-01', true),
--letmein123
(1, 'Jane', 'Doe', 'janedoe@example.com', 'janedoe', '$2b$12$vZXec/tilJiOhvexjbKxguJXVKwzwk4FZklfMkeQWwdHT7ZDIkfOu', '1995-05-05', true);


INSERT INTO lib_user (user_id) VALUES (1);

-- kostaras
INSERT INTO "user" (user_id, school_id,first_name, last_name, username, email, password_hash, dob, active) VALUES 
(15, 1, 'admin', 'admin', 'admin', 'admin@example.com', '$2b$12$6tR3o8yFEuG15ajoez06uOMGKXVU.4n/xPCy6OHevHPmNBbdZXBki', '02-04-2002', true);
INSERT INTO "admin" (user_id) VALUES (15);

INSERT INTO review (isbn, user_id, rate, body, active) VALUES
    ('9780000000001', 1, 5, 'This book exceeded my expectations. The writing was superb, and the plot twists were unexpected.', true),
    ('9780000000002', 1, 4, 'I found this book to be quite intriguing. The mystery kept me guessing until the end.', true),
    ('9780000000003', 1, 4, 'An excellent read! The author did a great job of building suspense throughout the story.', true),
    ('9780000000001', 2, 2, 'Unfortunately, this book did not resonate with me. I struggled to connect with the characters.', true),
    ('9780000000002', 2, 3, 'The book had its moments, but I felt that it lacked depth in certain areas.', true),
    ('9780000000003', 2, 5, 'I couldn''t put this book down! The author created a vivid and immersive world.', true);