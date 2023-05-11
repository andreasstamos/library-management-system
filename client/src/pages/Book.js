import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from '@mui/material'
import Button from '@mui/material/Button';
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
                    <h1 className='book-title title-with-hr'>{book?.title}</h1>
                    <h3 className='book-author'>{book?.authors.join(', ')}</h3>

                    <div className='book-detail'>
                        <h4>ISBN</h4>
                        <p>{book?.isbn}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Βαθμολογία Likert</h4>
                        <Rating name="read-only" value={book?.rate} readOnly />
                    </div>

                    <div className='book-detail'>
                        <h4>Περίληψη</h4>
                        <p>{book?.summary}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>{book?.categories?.length <= 1 ? 'Κατηγορία' : 'Κατηγορίες'}</h4>
                        <p>{book?.categories.join(', ')}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Λέξεις κλειδιά</h4>
                        <p>{book?.keywords?.join(', ')}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Γλώσσα</h4>
                        <p>{book?.language}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Αριθμός σελίδων</h4>
                        <p>{book?.page_number}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Εκδοτικός Οίκος</h4>
                        <p>{book?.publisher_name}</p>
                    </div>

                    <div className='book-detail'>
                        <h4>Διαθεσιμότητα</h4>
                        <p className='affirmative'>Άμεσα Διαθέσιμο</p>
                    </div>

                    <Button variant="contained">Κράτηση</Button>

                </div>


            </div>
            <ReviewForm bookISBN={bookISBN} />

        </div>
    )
}

export default Book;
