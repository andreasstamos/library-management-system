import React, { useEffect, useState } from 'react'
import './UsersControl.css'
import axios from 'axios';
import UserCard from './UserCard';
import { CircularProgress, Switch, TextField, Button } from '@mui/material';
import AuthorCard from './AuthorCard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';



function AuthorControl() {

    const [authors, setAuthors] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchAuthors() {
        setAuthors(null)
        setLoading(true);
        const response = await axios.post('http://localhost:5000/authors/get-authors/', {}, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          console.log(response);
          setAuthors(response?.data?.authors);
          setLoading(false);
    }


    useEffect( () => {
        fetchAuthors();
    }, [])



  return (
    <div className='dashboard-component'>
        <h2 className='component-title title-with-hr'>Authors</h2>
        <AddAuthor getAuthors={fetchAuthors}/>

        <div className='component-details users-control'>
        {loading && <CircularProgress />}
        {authors && (authors.length > 0 ? authors.map(author => <AuthorCard key={author?.author_id}
            data={author} getAuthors={fetchAuthors}/>) : <h3>Δεν βρέθηκαν Συγγραφείς</h3>)}
           
        </div>
    </div>
  )
}

export default AuthorControl



function AddAuthor({getAuthors}) {
    const [authorName, setAuthorName] = useState('');

    async function addAuthor() {
        const payload = {
            author_name:authorName
        }
        const response = await axios.post('http://localhost:5000/authors/add-author/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getAuthors();

    }

    return (
        <>
        <TextField id="outlined-basic" label="Συγγραφέας" variant="outlined" size="small" value={authorName} onChange={(e) => setAuthorName(e.target.value)} sx={{mr:2}} />
        <Button variant="contained"  onClick={addAuthor} endIcon={<PersonAddIcon />}>Προσθήκη</Button>
        </>


    )
}
