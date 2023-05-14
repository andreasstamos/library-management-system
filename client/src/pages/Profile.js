import React, { useContext, useEffect, useState } from 'react'
import { Alert, CircularProgress, TextField, Typography } from '@mui/material'
import './Profile.css'
import axios from 'axios'
import AuthContext from '../context/AuthContext'
import {Button} from '@mui/material'
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'
function Profile() {

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [edit, setEdit] = useState(false);


    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newDob, setNewDob] = useState('');

    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');

    let {user} = useContext(AuthContext);
    
    async function fetchProfile() {
      setProfile(null);
      setLoading(true);
        const response = await axios.post('http://localhost:5000/user/get-profile/', {},{
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })

        console.log(response);
        setLoading(false);
        setProfile(response?.data?.profile);

        // setting this values here because when you are editing the values through the form if you don't update anything
        // empty values get passed at the request
        setNewUsername(response?.data?.profile?.username);
        setNewEmail(response?.data?.profile?.email);
        setNewLastName(response?.data?.profile?.last_name);
        setNewFirstName(response?.data?.profile?.first_name);
        setNewDob(response?.data?.profile?.dob);
    }


    async function updateProfile(e) {
      setSucc('');
      setErr('');
        e.preventDefault();
        const payload = {
            username: newUsername,
            first_name:newFirstName,
            last_name:newLastName,
            email:newEmail,
            dob:dayjs(newDob)
        }
        console.log(newDob);
        try {
            const response = await axios.patch('http://localhost:5000/user/update-profile/', payload, {
                headers: {
                    'Access-Control-Expose-Headers' : '*',
                    'Access-Control-Allow-Origin': '*', 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
                }
                
            })
            console.log(response);
            setEdit(false);
            setSucc('Profile updated :)')
            fetchProfile();
        } catch(err) {
            setEdit(false);
            setErr("Something went wrong. Please try again later.")

        }

    }


    useEffect( () => {
        fetchProfile();
    }, [])


  const GREEK_ROLES = {
      lib_editor: 'Χειριστής',
      student: 'Μαθητής',
      teacher: 'Καθηγητής',
  } 

  return (
    <div className='user-profile-container'>
        <h1 className='title-with-hr'>Το προφίλ μου</h1>
        {loading && <CircularProgress />}
        {profile && <form className='user-profile-card' onSubmit={(e) => {updateProfile(e)}}>
        {/* <h2>{user?.sub?.role.charAt(0).toUpperCase() + user?.sub?.role.slice(1)}</h2> */}
        <Typography variant='h4' component='h3'>{GREEK_ROLES[user?.sub?.role]}</Typography>
        <TextField
                  id="filled-read-only-input"
                  label="School"
                  defaultValue={profile?.school_name}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                  variant={'filled'}
                />

                <TextField
                  id="filled-read-only-input"
                  label="Username"
                  defaultValue={profile?.username}
                  InputProps={{
                    readOnly: !edit,
                  }}
                  onChange={(e) => {setNewUsername(e.target.value)}}
                  variant={edit === false ? 'filled' : 'outlined'}
                />
        
                <TextField
                  id="filled-read-only-input"
                  label="First Name"
                  defaultValue={profile?.first_name}
                  InputProps={{
                    readOnly: !edit,
                  }}
                  onChange={(e) => {setNewFirstName(e.target.value)}}
                  variant={edit === false ? 'filled' : 'outlined'}
                />
        
        
                <TextField
                  id="filled-read-only-input"
                  label="Last Name"
                  defaultValue={profile?.last_name}
                  InputProps={{
                    readOnly: !edit,
                  }}
                  onChange={(e) => {setNewLastName(e.target.value)}}
                  variant={edit === false ? 'filled' : 'outlined'}
                />

                <TextField
                  id="filled-read-only-input"
                  label="Email"
                  defaultValue={profile?.email}
                  InputProps={{
                    readOnly: !edit,
                  }}
                  onChange={(e) => {setNewEmail(e.target.value)}}
                  variant={edit === false ? 'filled' : 'outlined'}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateField 
                        label="Date of Birth" 
                        readOnly={!edit}
                        defaultValue={dayjs(profile?.dob)}
                        variant={edit === false ? 'filled' : 'outlined'} 
                        onChange={(e) => {setNewDob(e)}}
                    />
                </LocalizationProvider>
            
                  {err && <Alert severity='error'>{err}</Alert>}
                  {succ && <Alert severity='success'>{succ}</Alert>}


            {user?.sub?.role !== 'student' && <Button variant="contained" onClick={() => setEdit(!edit)}>Edit</Button>}
            {user?.sub?.role !== 'student' && <Button variant="contained" color="secondary" type='submit' disabled={!edit}>Ενημερωση Προφιλ</Button>}

                </form>
        }

    </div>
  )
}

export default Profile