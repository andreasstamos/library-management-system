import React from 'react'
import './UserCard.css'
import axios from 'axios'
import {useContext} from "react";
import AuthContext from '../../context/AuthContext';
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';

export default function UserCard({data, action, getDeactivatedUsers}) {
  let {user} = useContext(AuthContext);
  async function handleSubmit(user_id) {
      const payload = {
          'action': action,
          'user_id': user_id,
    }
    console.log(user?.sub?.school_id);
      const response = await axios.post('http://127.0.0.1:5000/lib-api/change-active-user/', payload, {headers: {
        'Access-Control-Expose-Headers' : '*',
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
     }})
     await getDeactivatedUsers();
  }


  return (
    // <div className='user-row'>
    //     <h4 className='user-element'>Username: {data.username}</h4>
    //     <h4 className='user-element'>First Name: {data.first_name}</h4>
    //     <h4 className='user-element'>Last Name: {data.last_name}</h4>
    //     <h4 className='user-element'>E-mail: {data.email}</h4>
    //     <h4 className='user-element'>Role: {data?.role}</h4>
    //     <h4 className='user-element'>Active: {data.active ? "True" : 'False'}</h4>
    //     <button type='button' onClick={(e) => {handleSubmit(data.user_id)}}>{action == 'activate' ? 'Activate': 'Deactivate'} User</button>
    // </div>
    <Card sx={{ minWidth: 275 }} className='user-card'>
<CardContent>
<Typography variant="h5" component="div">
    Username: {data.username}
  </Typography>
  <Typography variant="body2">
    First Name: {data.first_name}
  </Typography>
  <Typography variant="body2">
    Last Name: {data.last_name}
  </Typography>
  <Typography variant="body2">
    Email: {data.email}
  </Typography>
  <Typography variant="body2">
    Active: {data.active ? 'True' : 'False'}
  </Typography>
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
  <Button size="small" variant="contained" onClick={(e) => {handleSubmit(data.user_id)}}>{action == 'activate' ? 'Activate': 'Deactivate'} User</Button>

</CardActions>
</Card>
  )
}
