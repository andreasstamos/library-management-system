DROP FUNCTION IF EXISTS items_available;
DROP FUNCTION IF EXISTS borrow_item;
DROP FUNCTION IF EXISTS booking_book;

CREATE OR REPLACE FUNCTION items_available(isbn VARCHAR(13), user_id INTEGER) RETURNS integer STABLE AS $$

SELECT  
 --available items not borrowed
(SELECT COUNT(1)
FROM item
WHERE isbn = items_available.isbn
AND school_id = (SELECT school_id FROM "user" WHERE user_id = items_available.user_id)
AND NOT EXISTS (SELECT 1 FROM borrow WHERE item_id = item.item_id AND NOW() <@ period)
)

-

(WITH user_booking AS
(SELECT booking_id
FROM booking
WHERE borrow_id IS NULL AND isbn = items_available.isbn AND user_id = items_available.user_id AND NOW() <@ period)

--booked books with higher priority than current user's
SELECT count(1)
FROM booking
JOIN "user" USING (user_id)
LEFT JOIN user_booking ON TRUE
AND isbn = items_available.isbn
AND NOW() <@ period
AND (user_booking.booking_id is NULL OR booking.booking_id < user_booking.booking_id)
AND school_id = (SELECT school_id FROM "user" WHERE user_id = items_available.user_id)
);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION borrow_item(v_item_id INTEGER, v_lender_id INTEGER, v_borrower_id INTEGER, v_expected_return DATE,
	OUT v_bookings_constraint BOOLEAN, OUT v_borrow_number_constraint BOOLEAN, OUT v_book_same_constraint BOOLEAN,
	OUT v_item_school_constraint BOOLEAN, OUT v_borrower_school_constraint BOOLEAN) AS $$
DECLARE
	v_borrow_id INTEGER;
	v_isbn VARCHAR(13);
BEGIN
       	SELECT isbn INTO v_isbn FROM item WHERE item_id = v_item_id;
        INSERT INTO borrow (item_id, lender_id, borrower_id, expected_return) VALUES (v_item_id, v_lender_id, v_borrower_id, v_expected_return)
		RETURNING borrow_id INTO v_borrow_id;
	UPDATE booking SET borrow_id = v_borrow_id, period = TSTZRANGE(LOWER(period), NOW(), '[]') 
		WHERE user_id = v_borrower_id AND isbn = v_isbn AND NOW() <@ period;

	v_borrower_school_constraint := (SELECT TRUE FROM "user" borrower JOIN "user" lender USING (school_id)
		WHERE borrower.user_id = v_borrower_id AND lender.user_id = v_lender_id);

	IF NOT v_borrower_school_constraint THEN RETURN;
	END IF;

	v_item_school_constraint := (SELECT TRUE FROM item JOIN "user" USING (school_id) WHERE item_id = v_item_id AND user_id = v_borrower_id);

	IF NOT v_item_school_constraint THEN RETURN;
	END IF;

	v_borrow_number_constraint := (SELECT (count(1) <= 2) FROM borrow WHERE borrower_id = v_borrower_id AND NOW() <@ period);

	IF NOT v_borrow_number_constraint THEN RETURN;
	END IF;

	v_book_same_constraint := (SELECT (COUNT(1) = 1) FROM item JOIN borrow USING (item_id) WHERE borrower_id = v_borrower_id
		AND NOW() <@ period AND ISBN = v_isbn);

	IF NOT v_book_same_constraint THEN RETURN;
	END IF;

	v_bookings_constraint := items_available(v_isbn, v_borrower_id) >= 0;

	IF NOT v_bookings_constraint THEN RETURN;
	END IF;

END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION booking_book(v_isbn VARCHAR(13), v_user_id INTEGER,
	OUT v_booking_number_constraint BOOLEAN) AS $$
BEGIN
	INSERT INTO booking (isbn, user_id) VALUES (v_isbn, v_user_id);

	v_booking_number_constraint := (SELECT (COUNT(1) <= 2) FROM booking WHERE user_id = v_user_id AND NOW() <@ period);

	IF NOT v_booking_number_constraint THEN RETURN;
	END IF;
END
$$ LANGUAGE plpgsql;

