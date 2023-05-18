import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Box, TextField, Backdrop, CircularProgress } from '@mui/material';
import { FilterBarCategory, FilterBarPublisher, FilterBarKeyword, FilterBarAuthor, FilterBarLanguage } from '../Components/FilterBarBooks';
import InsertedDialog from '../Components/InsertedDialog';

import AuthContext from "../context/AuthContext";
import axios from "axios";
import debounce from "lodash/debounce";


function BookAdd() {
    const [isbn, setISBN] = useState('');
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState([]);
    const [publisher, setPublisher] = useState('');
    const [pageNumber, setPageNumber] = useState('');
    const [language, setLanguage] = useState('');
    const [categories, setCategories] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [summary, setSummary] = useState('');

    const [exists, setExists] = useState(false);
    const [editing, setEditing] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [loadingInsert, setLoadingInsert] = useState(null);
    const [itemid, setItemid] = useState(null);
    const [errorInsert, setErrorInsert] = useState(null);

    const openInsertedDialog = (itemid && !errorInsert && !loadingInsert) ? true : false;

    const auth = useContext(AuthContext);
    
    const navigate = useNavigate();

    const validISBN = /^[0-9]{13}$/.test(isbn);

    const fetchBook = () => {
        setErrorInsert(null);
        if (exists) {
            setTitle('');
            setAuthors([]);
            setPublisher('');
            setLanguage('');
            setPageNumber('');
            setCategories([]);
            setKeywords([]);
        }
        setExists(false);
        setEditing(false);

        if (!validISBN) return;

        async function fetchBook_async() {
            try {
                const payload = {
                    "isbn": isbn,
                    "fetch_fields": ["title", "authors", "publisher_name", "language", "categories", "keywords", "summary", "page_number"]
                };

                const response = await axios.post('http://127.0.0.1:5000/book/get/', payload, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.authTokens}`,
                }});
                setLoading(false);
                if (!response?.data?.success) {
                    setError("Something went wrong. Please try again.");
                }
                if (response?.data?.books) {
                    if (!response?.data?.books?.length) {
                        setExists(false);
                        setEditing(true);
                        return;
                    }

                    const book = response?.data?.books[0];
                    setExists(true);
                    setEditing(false);
                    setTitle(book?.title);
                    setAuthors(book?.authors);
                    setLanguage(book?.language);
                    setPageNumber(book?.page_number);
                    setPublisher(book?.publisher_name);
                    setCategories(book?.categories);
                    setKeywords(book?.keywords);
                    setSummary(book?.summary);
                }
            } catch (e) {
                setLoading(false);
                setError("Something went wrong. Please try again.");
            }
        }

        fetchBook_async();
    };

    useEffect(() => {
        if (exists && editing) return;
        const debounced_fetchBook = debounce(() => {
            setLoading(true);
            fetchBook();
        }, 200); //200ms between search calls to api.
        debounced_fetchBook();

        return () => {debounced_fetchBook.cancel();}
    }, [isbn]);

    function handleInsert() {
        if (!validISBN) return;
        setLoadingInsert(true);
        setErrorInsert(null);
        const insertItem = async () => {
            try {
                let response;
                if (exists && !editing) {
                    const payload = {
                        "isbn": isbn,
                    };

                    response = await axios.post('http://127.0.0.1:5000/item/insert/', payload, {headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth.authTokens}`,
                    }});
                } else {
                    const payload = {
                        "isbn": isbn,
                        "title": title,
                        "publisher": publisher,
                        "page_number": pageNumber,
                        "summary": summary,
                        "language": language,
                        "authors": authors,
                        "keywords": keywords,
                        "categories": categories,
                        "insert_item": true,
                    }

                    response = await axios.post('http://127.0.0.1:5000/book/insert-update/', payload, {headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth.authTokens}`,
                    }});
                }
                setLoadingInsert(false);
                if (!response?.data?.success) {
                    setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
                }
                if (response?.data?.item_id) {
                    setItemid(response?.data?.item_id);
                    return;
                }
                setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
            } catch (e) {
                setLoadingInsert(false);
                setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
            }
        };

        insertItem();
    }

    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loadingInsert ? true : false}
            >
                <CircularProgress/>
            </Backdrop>
            <InsertedDialog
                open={openInsertedDialog}
                itemid={itemid}
                onClose={() => {navigate("/");}}
            />
            <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
                {errorInsert && <Alert severity="error" sx={{mr: 'auto'}}>{errorInsert}</Alert>}
                {exists && !editing && <Alert severity="success" sx={{mr: 'auto'}}>
                    Το βιβλίο βρέθηκε καταχωρημένο στο σύστημα. Δεν απαιτείται επανεισαγωγή των στοιχείων του. 
                </Alert>}
                {exists && editing && <Alert severity="warning" sx={{mr: 'auto'}}>
                    Η επεξεργασία των στοιχείων του βιβλίου θα εμφανιστεί σε όλα τα αντίτυπα. Παρακολούμε να είστε προσεκτικοί.
                </Alert>}
                {!exists && validISBN && !error && <Alert severity="info" sx={{mr: 'auto'}}>
                    Το βιβλίο δεν βρέθηκε καταχωρημένο στο σύστημα. Παρακολούμε εισάγετε τα στοιχεία του.
                </Alert>}
                <Box sx={{display: 'flex', flexWrap: 'wrap', columnGap: '1rem', rowGap: '1rem'}}>
                    <TextField autoFocus required focused={!validISBN}  label="ISBN" value={isbn} onChange={(e) => {setISBN(e.target.value);}} 
                        color={(!validISBN) ? 'error' : 'primary'}
                    />
                    <TextField label="Τίτλος" InputProps={{readOnly: !editing}} value={title} onChange={(e) => {setTitle(e.target.value);}} />
                    <FilterBarAuthor edit readOnly={!editing} value={authors} handleChangeValue={(value) => {setAuthors(value);}} />
                    <FilterBarPublisher edit singlevalue readOnly={!editing} value={publisher} handleChangeValue={(value) => {setPublisher(value);}} />
                    <FilterBarLanguage edit singlevalue readOnly={!editing} value={language} handleChangeValue={(value) => {setLanguage(value);}} />
                    <TextField label="Αριθμός σελίδων" InputProps={{readOnly: !editing}} value={pageNumber}
                        onChange={(e) => {setPageNumber(Number(e.target.value) ? Number(e.target.value): '')}} />
                    <FilterBarCategory edit readOnly={!editing} value={categories} handleChangeValue={(value) => {setCategories(value);}} />
                    <FilterBarKeyword edit readOnly={!editing} value={keywords} handleChangeValue={(value) => {setKeywords(value);}} />
                </Box>
                <TextField sx={{mr: '40vw'}} label="Περίληψη" multiline
                    InputProps={{readOnly: !editing}} value={summary} onChange={(e) => {setSummary(e.target.value);}} />
                <Box sx={{display: 'flex', columnGap: '1rem'}}>
                    <Button variant="contained" onClick={handleInsert}>ΕΙΣΑΓΩΓΗ</Button>
                    {exists && !editing &&
                    <Button variant="contained" sx={{mr: 'auto'}} color="secondary" onClick={() => {setEditing(true);}}>ΕΠΕΞΕΡΓΑΣΙΑ</Button>
                    }
                    {exists && editing &&
                        <Button variant="contained" sx={{mr: 'auto'}} color="secondary" onClick={() => {fetchBook();}}>ΑΚΥΡΩΣΗ</Button>
                    }
                </Box>
            </Box>
        </>
    );
}

export default BookAdd;
