import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import PaginationControlled from '../Components/PaginationControlled';
import BookCard from '../Components/BookCard';
import './Books.css'
import SearchBarBooks from '../Components/SearchBarBooks';
import AuthContext from '../context/AuthContext';
import Typography from '@mui/material/Typography';

function Books() {

    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const payload = {
                    fetch_fields: ["isbn", "title", "summary", "image_uri", "rate"]
                };

                const response = await axios.post('http://127.0.0.1:5000/book/get/', payload, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.authTokens}`,
                }});
                setLoading(false);
                if (!response.data.success) {
                    setError("Something went wrong. Please try again.");
                }
                if (response.data.books) {
                    setBooks(response.data.books);
                }
            } catch (e) {
                setLoading(false);
                setError("Something went wrong. Please try again.");
            }
        };

        fetchBooks();

    }, []);

    return (
        <div className='books-page-container'>
            <Typography variant="h3" component="h1">Βιβλία</Typography>
            <div className='page-filters'>
                <PaginationControlled totalPages={10} page={page} setPage={setPage} />
                <SearchBarBooks />
            </div>
            <div className='books-container'>

                {books.map((book) =>
                <BookCard
                    key={book.isbn}
                    isbn={book.isbn}
                    rating={book.rate}
                    imageURI={book.image_uri}
                    title={book.title}
                    summary={book.summary}/>
                )}


            </div>
        </div>
    )
}

export default Books;

