import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { Switch, TextField } from '@mui/material';
import './LibraryUserCard.css'
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

export default function LibraryUserCard({data, fetchUsers}) {

  const [newUsername, setNewUsername] = React.useState(data.username);
  const [newEmail, setNewEmail] = React.useState(data.email);
  const [newFirstName, setNewFirstName] = React.useState(data.first_name);
  const [newLastName, setNewLastName] = React.useState(data.last_name);
  const [newActive, setNewActive] = React.useState(data.active);
  const [newDob, setNewDob] = React.useState(data.dob);


  const [edit, setEdit] = React.useState(false);

    async function updateLibraryUser() {

        const payload = {
            user_id: data.user_id,
            username: newUsername,
            email: newEmail,
            first_name: newFirstName,
            last_name: newLastName,
            active: Boolean(newActive),
            dob: dayjs(newDob),
        }
        const response = await axios.post('http://localhost:5000/admin-api/update-library-user/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        console.log(response?.data);
        await fetchUsers();
        setEdit(false);

    }



    return (
    <Card sx={{ minWidth: 275 }}>
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
          label="First Name"
          defaultValue={data.first_name}
          onChange={(e) => setNewFirstName(e.target.value)}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        />

      <TextField
          required
          id="filled-required"
          label="Last Name"
          defaultValue={data.last_name}
          onChange={(e) => {setNewLastName(e.target.value)}}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        /> 
        <TextField
          required
          id="filled-required"
          label="Email"
          defaultValue={data.email}
          onChange={(e) => {setNewEmail(e.target.value)}}
          variant={edit ? 'outlined' : 'filled'}
          disabled={!edit}

        /> 
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateField 
                label="Date of Birth" 
                readOnly={!edit}
                defaultValue={dayjs(data.dob)}
                variant={edit === false ? 'filled' : 'outlined'} 
                onChange={(e) => {setNewDob(e)}}
                disabled={!edit}
            />
          </LocalizationProvider>
            

        <Switch
        disabled={!edit}
        // defaultValue={newActive}
        defaultChecked={newActive}
        onChange={() => setNewActive(!newActive)}
        inputProps={{ 'aria-label': 'controlled' }}
            />
    </form>
      
      </CardContent>
      <CardActions>
        <Button size="small" type='button' onClick={(e) => setEdit(!edit)}>Edit</Button>
        <Button color="secondary" disabled={!edit} onClick={(e) => updateLibraryUser()}>Update</Button>
        <Button color="error">Delete</Button>
      </CardActions>
    </Card>
  );
}