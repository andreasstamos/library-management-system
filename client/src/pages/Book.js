import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Rating, Typography, Alert, Backdrop, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import './Book.css'
import axios from 'axios';
import ReviewForm from '../Components/ReviewForm';
import AuthContext from '../context/AuthContext';
import Reviews from '../Components/Reviews';
import ItemsTable from '../Components/ItemsTable';
import BookingDialog from '../Components/BookingDialog';

function Book() {
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [bookingExists, setBookingExists] = useState(null);
    const [bookingExceededMax, setBookingExceededMax] = useState(null);
    const [bookingLateBorrows, setBookingLateBorrows] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openBookingDialog, setOpenBookingDialog] = useState(false);
    let {bookISBN} = useParams();

    const auth = useContext(AuthContext);
    const isLibEditor = auth?.user?.sub?.role === 'lib_editor';

    const fetchBooks = async () => {
        try {
            const payload_book = {
                isbn: bookISBN,
                fetch_fields: ["isbn", "title", "publisher_name", "page_number", "language", "summary", "image_uri",
                    "authors", "keywords", "categories", "rate", "items_available"]
            };

            const payload_booking = {
                isbn: bookISBN,
            };

            let response_book = axios.post('http://127.0.0.1:5000/book/get/', payload_book, {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.authTokens}`,
            }});

            let response_booking = axios.post('http://127.0.0.1:5000/booking/exists/', payload_booking, {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.authTokens}`,
            }});

            response_book = await response_book;
            response_booking = await response_booking;

            setLoading(false);
            if (!response_book?.data?.success || !response_booking?.data?.success) {
                setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
                return;
            }
            if (!response_book?.data?.books?.length) {
                return navigate("/404");
            }
            setBook(response_book.data.books[0]);
            setBookingExists(response_booking?.data?.exists_booking);
            setBookingExceededMax(response_booking?.data?.exceeded_max);
            setBookingLateBorrows(response_booking?.data?.late_borrows);
        } catch (e) {
            setLoading(false);
            setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [bookISBN, navigate]);

    function handleBooking() {
        const sendBooking = async () => {
            try {
                const payload = {
                    isbn: bookISBN,
                };

                const response = await axios.post('http://127.0.0.1:5000/booking/insert/', payload, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.authTokens}`,
                }});
                setLoading(false);
                if (!response?.data?.success) {
                    setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
                }
            } catch (e) {
                setLoading(false);
                setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
            }
        };

        setError(null);
        setLoading(true);
        (async () => {await sendBooking(); fetchBooks(); })();
    }

    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress/>
            </Backdrop>

            {isLibEditor && openBookingDialog && <BookingDialog open={openBookingDialog} isbn={book?.isbn} onClose={() => {setOpenBookingDialog(false);}} />}

            <div className='book-page-container'>
                {error && <Alert severity="error" sx={{mr: 'auto'}}>{error}</Alert>}
                <div className='book-container'>
                    <img className='book-image' src={book?.image_uri} />
                    <div className='book-details'>
                        <Typography variant="h2">{book?.title}</Typography>
                        <Typography variant="h3">{book?.authors.join(', ')}</Typography>

                        <div className='book-detail'>
                            <Typography variant="h6">ISBN</Typography>
                            <Typography variant="body1">{book?.isbn}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Βαθμολογία Likert</Typography>
                            <Rating name="read-only" value={parseInt(book?.rate)} readOnly />
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Περίληψη</Typography>
                            <Typography variant="body1">{book?.summary}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Εκδοτικός Οίκος</Typography>
                            <Typography variant="body1">{book?.publisher_name}</Typography>
                        </div>


                        <div className='book-detail'>
                            <Typography variant="h6">{book?.categories?.length <= 1 ? 'Κατηγορία' : 'Κατηγορίες'}</Typography>
                            <Typography variant="body1">{book?.categories.join(', ')}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Λέξεις κλειδιά</Typography>
                            <Typography variant="body1">{book?.keywords?.join(', ')}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Γλώσσα</Typography>
                            <Typography variant="body1">{book?.language}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Αριθμός σελίδων</Typography>
                            <Typography variant="body1">{book?.page_number}</Typography>
                        </div>

                        <div className='book-detail'>
                            <Typography variant="h6">Διαθεσιμότητα για δανεισμό</Typography>
                            {book?.items_available > 0 && <Typography variant="body1" sx={{color: 'success.main'}}>
                                {book?.items_available} {book?.items_available === 1 ? 'αντίτυπο άμεσα διαθέσιμο' : 'αντίτυπα άμεσα διαθέσιμα'}
                            </Typography>}

                            {book?.items_available <= 0 && <Typography variant="body1" sx={{color: 'error.main'}}>
                                Αυτή την στιγμή δεν υπάρχουν διαθέσιμα αντίτυπα για δανεισμό.
                            </Typography>}


                        </div>

                        {!isLibEditor && <>
                            {bookingExists === false && bookingExceededMax === false && bookingLateBorrows === false &&
                            <Button variant="contained" sx={{mr: 'auto'}} onClick={handleBooking}>ΚΡΑΤΗΣΗ</Button>}
                            {bookingExists === true && <Alert severity="info" sx={{mr: 'auto'}}>
                                Έχετε ήδη ενεργή κράτηση για το συγκεκριμένο βιβλίο.
                            </Alert>}
                            {bookingExists === false && bookingExceededMax === true && <Alert severity="info" sx={{mr: 'auto'}}>
                                Έχετε ήδη εκτελέσει τον μέγιστο αριθμό επιτρεπτών κρατήσεων.
                            </Alert>}
                            {bookingExists === false && bookingExceededMax === false && bookingLateBorrows === true &&
                                <Alert severity="error"> Έχετε καθυστερήσει να επιστρέψετε ένα δανεισμένο αντίτυπο, οπότε δεν επιτρέπεται η κράτηση.
                                </Alert>}

                        </>}

                        {isLibEditor && <Button variant="contained" sx={{mr: 'auto'}} onClick={() => {setOpenBookingDialog(true);}}>ΚΡΑΤΗΣΗ (ΓΙΑ ΕΣΑΣ/ΧΡΗΣΤΗ)</Button>}


                    </div>

                </div>
                <ReviewForm bookISBN={bookISBN} />
                <Reviews bookISBN={bookISBN} />

                {isLibEditor && <ItemsTable isbn={bookISBN} />}

            </div>
        </>
    )
}

export default Book;
