import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import PaginationControlled from '../Components/PaginationControlled';
import BookCard from '../Components/BookCard';
import './Books.css';
import SearchBarBooks from '../Components/SearchBarBooks';
import AuthContext from '../context/AuthContext';
import Typography from '@mui/material/Typography';

function Books() {

    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [availablePages, setAvailablePages] = useState(10);
    const BooksPerPage = 1;

    const [searchValue, setSearchValue] = useState(null);

    const navigate = useNavigate();

    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const payload = {
                    ...(searchValue) && {title: searchValue},
                    fetch_fields: ["isbn", "title", "summary", "image_uri", "rate"],
                    limit: BooksPerPage,
                    offset: page>0 ? (page-1)*BooksPerPage : 0,
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
                    if (response.data.books.length) {
                        setAvailablePages(Math.max(availablePages, page+5));
                    }
                }
            } catch (e) {
                setLoading(false);
                setError("Something went wrong. Please try again.");
            }
        };

        fetchBooks();
    }, [searchValue, page]);

    useEffect(() => {
        if (searchValue?.isbn) navigate(`/book/${searchValue?.isbn}`);
    }, [searchValue]);

    console.log(page);
    return (
        <div className='books-page-container'>
            <Typography variant="h3" component="h1">Βιβλία</Typography>
            <div className='page-filters'>
                <PaginationControlled totalPages={availablePages} page={page} setPage={setPage} />
                <SearchBarBooks value={searchValue} handleChangeValue={(value) => {setSearchValue(value)}} />
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

