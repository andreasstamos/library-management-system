import React, { useState } from 'react'
import './UserCard.css'
import axios from 'axios'
import {useContext} from "react";
import { Card, CardContent, Typography, Button, CardActions, TextField, Switch } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';


export default function AuthorCard({data, getAuthors}) {

  const [edit, setEdit] = useState(false)
  const [newAuthorName, setNewAuthorName] = useState(data.author_name)

    

    async function updateAuthor() {
        const payload = {
            author_id: data.author_id,
            author_name:newAuthorName,
        }
        const response = await axios.post('http://localhost:5000/authors/update-author/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
         await getAuthors();
    }

    async function deleteAuthor() {
        const payload = {
            author_id: data.author_id,
        }
        const response = await axios.post('http://localhost:5000/authors/delete-author/', payload, {
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

    <Card sx={{ minWidth: 275, mt:2 }} className='user-card'>
<CardContent>
<form className='lib-editor-card-info'>

  <TextField
          required
          id="filled-required"
          label="full_name"
          defaultValue={data.author_name}
          onChange={(e) => setNewAuthorName(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}
        />
   </form>

</CardContent>
<CardActions>
  <Button size="small" variant="contained" onClick={(e) => {updateAuthor(data.author_id)}} disabled={!edit}>Ενημέρωση Author</Button>
  <Button size="small" variant="contained" color="secondary" onClick={() => setEdit(!edit)}>Επεξεργασία</Button>
  <Button size="small" variant="contained" color="error" onClick={deleteAuthor}>Διαγραφή</Button>

</CardActions>
</Card>
  )
}
