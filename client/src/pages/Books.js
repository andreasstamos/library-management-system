import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import BookCard from '../Components/BookCard';
import './Books.css';
import SearchBarBooks from '../Components/SearchBarBooks';
import { FilterBarCategory, FilterBarPublisher, FilterBarKeyword, FilterBarAuthor } from '../Components/FilterBarBooks';
import AuthContext from '../context/AuthContext';
import { Typography, Box, Pagination } from '@mui/material';

function Books() {

    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [availablePages, setAvailablePages] = useState(10);

    const BooksPerPage = 9;

    const [searchValue, setSearchValue] = useState(null);
    const [categoriesValue, setCategoriesValue] = useState([]);
    const [publishersValue, setPublishersValue] = useState([]);
    const [keywordsValue, setKeywordsValue] = useState([]);
    const [authorsValue, setAuthorsValue] = useState([]);

    const navigate = useNavigate();

    const auth = useContext(AuthContext);


    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const payload = {
                    ...(searchValue) && {title: searchValue},
                    ...(categoriesValue?.length) && {categories: categoriesValue},
                    ...(keywordsValue?.length) && {keywords: keywordsValue},
                    ...(publishersValue?.length) && {publishers: publishersValue},
                    ...(authorsValue?.length) && {authors: authorsValue},
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
    }, [searchValue, categoriesValue, publishersValue, keywordsValue, authorsValue, page]);

    useEffect(() => {
        if (searchValue?.isbn) navigate(`/book/${searchValue?.isbn}`);
    }, [searchValue]);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1.5rem'}}>
            <Typography variant="h3" component="h1">Βιβλία</Typography>
            <Box sx={{display: 'flex', columnGap: '1rem'}}>
                <FilterBarAuthor value={authorsValue} handleChangeValue={(value) => {setAuthorsValue(value);}} />
                <FilterBarPublisher value={publishersValue} handleChangeValue={(value) => {setPublishersValue(value);}} />
                <FilterBarCategory value={categoriesValue} handleChangeValue={(value) => {setCategoriesValue(value);}} />
                <FilterBarKeyword value={keywordsValue} handleChangeValue={(value) => {setKeywordsValue(value);}} />
                <Box sx={{ml: 'auto'}}>
                    <SearchBarBooks value={searchValue} handleChangeValue={(value) => {setSearchValue(value)}} />
                </Box>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Pagination count={availablePages} variant="outlined" color="primary" page={page}
                    onChange={(event,value) => {setPage(value);}} />
            </Box>
            
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
        </Box>
    )
}

export default Books;

