import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import './Book.css'
import axios from 'axios';
import ReviewForm from '../Components/ReviewForm';
import AuthContext from '../context/AuthContext';


function Book() {
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    let {bookISBN} = useParams();

    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const payload = {
                    isbn: bookISBN,
                    fetch_fields: ["isbn", "title", "publisher_name", "page_number", "language", "summary", "image_uri",
                        "authors", "keywords", "categories", "rate", "item_number"]
                };

                const response = await axios.post('http://127.0.0.1:5000/book/get/', payload, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.authTokens}`,
                }});
                setLoading(false);
                if (!response?.data?.success) {
                    setError("Something went wrong. Please try again.");
                }
                if (!response?.data?.books?.length) {
                    return navigate("/404");
                }
                if (response.data.books[0]) {
                    setBook(response.data.books[0]);
                }
            } catch (e) {
                setLoading(false);
                setError("Something went wrong. Please try again.");
            }
        };

        fetchBooks();

    }, [bookISBN, navigate]);

    return (
        <div className='book-page-container'>
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
                        <Rating name="read-only" value={book?.rate} readOnly />
                    </div>

                    <div className='book-detail'>
                        <Typography variant="h6">Περίληψη</Typography>
                        <Typography variant="body1">{book?.summary}</Typography>
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
                        <Typography variant="h6">Εκδοτικός Οίκος</Typography>
                        <Typography variant="body1">{book?.publisher_name}</Typography>
                    </div>

                    <div className='book-detail'>
                        <Typography variant="h6">Διαθεσιμότητα</Typography>
                        <Typography variant="body1" sx={{color: 'success.main'}}>Άμεσα Διαθέσιμο</Typography>
                    </div>

                    <Button variant="contained" sx={{mr: 'auto'}}>ΚΡΑΤΗΣΗ</Button>

                </div>

            </div>
            <ReviewForm bookISBN={bookISBN} />

        </div>
    )
}

export default Book;
