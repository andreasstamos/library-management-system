CREATE OR REPLACE FUNCTION items_available(isbn VARCHAR(13), user_id INTEGER) RETURNS integer STABLE AS $$

SELECT  
 --available items not borrowed
(SELECT COUNT(*)
FROM item
LEFT JOIN borrow USING (item_id)
WHERE isbn = items_available.isbn AND (period IS NULL OR (NOW() <@ period) IS FALSE)
AND school_id = (SELECT school_id FROM "user" WHERE user_id = items_available.user_id))

-

(WITH user_booking AS
(SELECT booking_id
FROM booking
WHERE borrow_id IS NULL AND isbn = items_available.isbn AND user_id = items_available.user_id AND NOW() <@ period)

--booked books with higher priority than current user's
SELECT count(*)
FROM booking
JOIN "user" USING (user_id)
LEFT JOIN user_booking ON TRUE
WHERE borrow_id IS NULL
AND isbn = items_available.isbn
AND (NOW() <@ period)
AND (user_booking.booking_id is NULL OR booking.booking_id < user_booking.booking_id)
AND school_id = (SELECT school_id FROM "user" WHERE user_id = items_available.user_id)
);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION borrow_item(v_item_id INTEGER, v_lender_id INTEGER, v_user_id INTEGER, v_expected_return DATE, OUT v_bookings_constraint BOOLEAN) AS $$
DECLARE
	v_borrow_id INTEGER;
	v_isbn VARCHAR(13);
BEGIN
       	SELECT isbn INTO v_isbn FROM item WHERE item_id = v_item_id;
        INSERT INTO borrow (item_id, lender_id, borrower_id, expected_return) VALUES (v_item_id, v_lender_id, v_user_id, v_expected_return)
		RETURNING borrow_id INTO v_borrow_id;
	v_bookings_constraint := items_available(v_isbn, v_user_id) >= 0;
	UPDATE booking SET borrow_id = v_borrow_id, period = TSTZRANGE(LOWER(period), NOW(), '[]') 
		WHERE user_id = v_user_id AND isbn = v_isbn AND NOW() <@ period;
END
$$ LANGUAGE plpgsql;
