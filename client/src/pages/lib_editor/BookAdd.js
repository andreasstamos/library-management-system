import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Box, TextField, Backdrop, CircularProgress } from '@mui/material';
import { FilterBarCategory, FilterBarPublisher, FilterBarKeyword, FilterBarAuthor, FilterBarLanguage } from '../../Components/FilterBarBooks';
import InsertedDialog from '../../Components/InsertedDialog';

import AuthContext from "../../context/AuthContext";
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
    const [imageURI, setImageURI] = useState('');

    const [exists, setExists] = useState(false);
    const [editing, setEditing] = useState(true);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [loadingInsert, setLoadingInsert] = useState(null);
    const [itemid, setItemid] = useState(null);
    const [errorInsert, setErrorInsert] = useState(null);

    const [openInsertedDialog, setOpenInsertedDialog] = useState(false);

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
                    "all_schools": true,
                    "fetch_fields": ["title", "authors", "publisher_name", "language", "categories", "keywords", "summary", "page_number", "image_uri"]
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
                    setImageURI(book?.image_uri);
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

    function handleInsert({doInsertItem}) {
        if (!validISBN) return;
        setErrorInsert(null);
        const insertItem = async () => {
            try {
                let response;
                if (exists && !editing) {
                    const payload = {
                        "isbn": isbn,
                    };

                    setLoadingInsert(true);
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
                        "image_uri": imageURI,
                        "insert_item": doInsertItem,
                    }
                    if (!(Object.values(payload).every((value) => value && !(Array.isArray(value) && value?.length === 0)))) {
                        setErrorInsert("Παρακαλούμε συμπληρώστε όλα τα πεδία.")
                        return;
                    }

                    setLoadingInsert(true);
                    response = await axios.post('http://127.0.0.1:5000/book/insert-update/', payload, {headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${auth.authTokens}`,
                    }});
                }
                setLoadingInsert(false);
                if (!response?.data?.success) {
                    setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
                    return;
                }
                fetchBook();
                if (insertItem) {
                    if (response?.data?.item_id) {
                        setItemid(response?.data?.item_id);
                        setOpenInsertedDialog(true);
                        return;
                    }
                } else {
                    setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
                    return;
                }
            } catch (e) {
                setLoadingInsert(false);
                setErrorInsert("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
                return;
            }
        };

        insertItem();
    }

    return (
        <div>
	    <h1 className='title-with-hr'>Διαχείριση βιβλίων (προσθήκη/επεξεργασία)</h1>
            
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loadingInsert ? true : false}
            >
                <CircularProgress/>
            </Backdrop>
            {openInsertedDialog && <InsertedDialog
                open={openInsertedDialog}
                itemid={itemid}
                onClose={() => {navigate("/");}}
            />}
            <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
                {!loading && errorInsert && <Alert severity="error" sx={{mr: 'auto'}}>{errorInsert}</Alert>}
                {!loading && exists && !editing && <Alert severity="success" sx={{mr: 'auto'}}>
                    Το βιβλίο βρέθηκε καταχωρημένο στο σύστημα. Δεν απαιτείται επανεισαγωγή των στοιχείων του. 
                </Alert>}
                {!loading && exists && editing && <Alert severity="warning" sx={{mr: 'auto'}}>
                    Η επεξεργασία των στοιχείων του βιβλίου θα εμφανιστεί σε όλα τα αντίτυπα. Παρακολούμε να είστε προσεκτικοί.
                </Alert>}
                {!loading && !exists && validISBN && !error && <Alert severity="info" sx={{mr: 'auto'}}>
                    Το βιβλίο δεν βρέθηκε καταχωρημένο στο σύστημα. Παρακολούμε εισάγετε τα στοιχεία του.
                </Alert>}
                <Box sx={{display: 'flex', flexWrap: 'wrap', columnGap: '1rem', rowGap: '1rem'}}>
                    <TextField autoFocus required focused={!validISBN}  label="ISBN" value={isbn} onChange={(e) => {setISBN(e.target.value);}} 
                        color={(!validISBN) ? 'error' : 'primary'}
                    />
                    <TextField required label="Τίτλος" InputProps={{readOnly: !editing}} value={title} onChange={(e) => {setTitle(e.target.value);}} />
                    <FilterBarAuthor edit readOnly={!editing} value={authors} handleChangeValue={(value) => {setAuthors(value);}} />
                    <FilterBarPublisher edit singlevalue readOnly={!editing} value={publisher} handleChangeValue={(value) => {setPublisher(value);}} />
                    <FilterBarLanguage edit singlevalue readOnly={!editing} value={language} handleChangeValue={(value) => {setLanguage(value);}} />
                    <TextField required label="Αριθμός σελίδων" InputProps={{readOnly: !editing}} value={pageNumber}
                        onChange={(e) => {setPageNumber(Number(e.target.value) ? Number(e.target.value): '')}} />
                    <FilterBarCategory edit readOnly={!editing} value={categories} handleChangeValue={(value) => {setCategories(value);}} />
                    <FilterBarKeyword edit readOnly={!editing} value={keywords} handleChangeValue={(value) => {setKeywords(value);}} />
                </Box>
                <TextField required sx={{mr: '40vw'}} label="URL εικόνας εξωφύλλου" type="url" InputProps={{readOnly: !editing}}
                    value={imageURI} onChange={(e) => {setImageURI(e.target.value);}} />
                <TextField required sx={{mr: '40vw'}} label="Περίληψη" multiline
                    InputProps={{readOnly: !editing}} value={summary} onChange={(e) => {setSummary(e.target.value);}} />
                <Box sx={{display: 'flex', columnGap: '1rem'}}>
                    <Button variant="contained" onClick={() => {handleInsert({doInsertItem: true})}}>ΕΙΣΑΓΩΓΗ ΑΝΤΙΤΥΠΟΥ</Button>
                    {exists && !editing &&
                    <Button variant="contained" sx={{mr: 'auto'}} color="secondary" onClick={() => {setEditing(true);}}>ΕΠΕΞΕΡΓΑΣΙΑ</Button>
                    }
                    {exists && editing &&
                        <Button variant="contained" onClick={() => {handleInsert({doInsertItem: false})}}>ΜΟΝΟ ΕΝΗΜΕΡΩΣΗ</Button>
                    }
                    {exists && editing &&
                        <Button variant="contained" sx={{mr: 'auto'}} color="secondary" onClick={() => {fetchBook();}}>ΑΚΥΡΩΣΗ</Button>
                    }
                </Box>
            </Box>
        </div>
    );
}

export default BookAdd;
