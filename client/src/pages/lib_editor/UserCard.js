import React, { useState } from 'react'
import './UserCard.css'
import axios from 'axios'
import {useContext} from "react";
import AuthContext from '../../context/AuthContext';
import { Card, CardContent, Typography, Button, CardActions, TextField, Switch } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


export default function UserCard({data,  getUsers}) {
  let {user} = useContext(AuthContext);

  const [edit, setEdit] = useState(false)


  const [newUsername, setNewUsername] = useState(data.username);
  const [newEmail, setNewEmail] = useState(data.email);
  const [newFirstName, setNewFirstName] = useState(data.first_name);
  const [newLastName, setNewLastName] = useState(data.last_name);
  const [newActive, setNewActive] = useState(data.active);
  const [newDob, setNewDob] = useState(data.dob);


  async function handleSubmit(user_id) {
      const payload = {
          user_id: data.user_id,
          username: newUsername,
          email: newEmail,
          first_name:newFirstName,
          last_name:newLastName,
          active:newActive,
          dob:dayjs(newDob)
    }
      const response = await axios.post('http://127.0.0.1:5000/lib-api/update-user/', payload, {headers: {
        'Access-Control-Expose-Headers' : '*',
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
     }})
     await getUsers();
  }


  async function deleteUser() {
    const payload = {
      user_id:data.user_id
    }
    const response = await axios.post('http://localhost:5000/lib-api/delete-user/', payload, {headers: {
      'Access-Control-Expose-Headers' : '*',
      'Access-Control-Allow-Origin': '*', 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
   }})
   await getUsers();
  }


  return (

    <Card sx={{ minWidth: 275 }} className='user-card'>
<CardContent>
<form className='lib-editor-card-info'>

  <TextField
          required
          id="filled-required"
          label="Username"
          defaultValue={data.username}
          onChange={(e) => setNewUsername(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        />
   <TextField
          required
          id="filled-required"
          label="Όνομα"
          defaultValue={data.first_name}
          onChange={(e) => setNewFirstName(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        />
   <TextField
          required
          id="filled-required"
          label="Επίθετο"
          defaultValue={data.last_name}
          onChange={(e) => setNewLastName(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        />
   <TextField
          required
          id="filled-required"
          label="Email"
          defaultValue={data.email}
          onChange={(e) => setNewEmail(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        />

<LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateField 
                label="Ημερομηνία γέννησης" 
                readOnly={!edit}
                defaultValue={dayjs(data.dob)}
                variant={edit === false ? 'filled' : 'outlined'} 
                onChange={(e) => {setNewDob(e)}}
                disabled={!edit}
            />
          </LocalizationProvider>

<FormControlLabel
              control={<Switch
                  disabled={!edit}
                  defaultChecked={newActive}
                  onChange={() => setNewActive(!newActive)}
                  inputProps={{ 'aria-label': 'controlled' }}
              />}
              label={newActive ? "Ενεργός" : "Ανενεργός"} 
          />
   </form>
  {/* <Typography variant="h5" component="div">
    be{bull}nev{bull}o{bull}lent
  </Typography>
  <Typography sx={{ mb: 1.5 }} color="text.secondary">
    adjective
  </Typography>
  <Typography variant="body2">
    well meaning and kindly.
    <br />
    {'"a benevolent smile"'}
  </Typography> */}

</CardContent>
<CardActions>
  <Button size="small" variant="contained" onClick={(e) => {handleSubmit(data.user_id)}} disabled={!edit}>Update User</Button>
  <Button size="small" variant="contained" color="secondary" onClick={() => setEdit(!edit)}>Επεξεργασία</Button>
  <Button size="small" variant="contained" color="error" onClick={deleteUser}>Διαγραφή</Button>

</CardActions>
</Card>
  )
}
