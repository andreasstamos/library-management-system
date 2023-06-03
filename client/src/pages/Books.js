import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import BookCard from '../Components/BookCard';
import './Books.css';
import SearchBarBooks from '../Components/SearchBarBooks';
import { FilterBarCategory, FilterBarPublisher, FilterBarKeyword, FilterBarAuthor } from '../Components/FilterBarBooks';
import AuthContext from '../context/AuthContext';
import TextField from '@mui/material/TextField';
import { Typography, Box, Pagination, Button } from '@mui/material';

function Books() {

    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [availablePages, setAvailablePages] = useState(10);

    // this is an error which occurs when item id is not found
    const [searchError, setSearchError] = useState('');


    const BooksPerPage = 9;

    const [searchValue, setSearchValue] = useState(null);
    const [categoriesValue, setCategoriesValue] = useState([]);
    const [publishersValue, setPublishersValue] = useState([]);
    const [keywordsValue, setKeywordsValue] = useState([]);
    const [authorsValue, setAuthorsValue] = useState([]);
    const [itemId, setItemId] = useState(null);

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
                    fetch_fields: ["isbn", "title", "summary", "image_uri", "rate", "items_available"],
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

    // different handling for item_id
    async function getBookByItemId() {
        setSearchError('');
        const payload = {
            item_id: parseInt(itemId),
            fetch_fields: ["isbn", "title", "summary", "image_uri", "rate", "items_available"],
        }
        try {
            const response = await axios.post('http://127.0.0.1:5000/book/get/', payload, {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.authTokens}`,
            }});
            if (response?.data?.books.length === 1) navigate(`/book/${response?.data?.books[0]?.isbn}`)
            if (response?.data?.books.length === 0) setSearchError("Δεν Βρέθηκε.")

        } catch(e) {
            setSearchError("Κάτι Πήγε Λάθος.")

        }
        
        
    }

    useEffect(() => {
        if (searchValue?.isbn) navigate(`/book/${searchValue?.isbn}`);
    }, [searchValue]);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1.5rem'}}>
            <Typography variant="h3" component="h1" className='title-with-hr'>Βιβλία</Typography>
            <Box sx={{display: 'flex', columnGap: '1rem'}}>
                <FilterBarAuthor    value={authorsValue}        handleChangeValue={(value) => {setAuthorsValue(value);}}    />
                <FilterBarPublisher value={publishersValue}     handleChangeValue={(value) => {setPublishersValue(value);}} />
                <FilterBarCategory  value={categoriesValue}     handleChangeValue={(value) => {setCategoriesValue(value);}} />
                <FilterBarKeyword   value={keywordsValue}       handleChangeValue={(value) => {setKeywordsValue(value);}}   />
                {auth.user.sub.role === 'lib_editor' &&   
                <Box sx={{display: 'flex', alignItems:'flex-end'}}>
                    <TextField
                    id="standard-search"
                    label="Αντίτυπο"
                    type="search"
                    variant="standard"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    helperText={searchError}
                    error={searchError != ''}
                    />
                    <Button variant="text" sx={{padding:'0'}} onClick={getBookByItemId}>Αναζητηση Item</Button>
                    </Box>      
                   
                          }
                
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

