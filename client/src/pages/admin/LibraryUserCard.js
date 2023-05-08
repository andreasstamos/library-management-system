import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import axios from 'axios';

export default function LibraryUserCard({data, fetchUsers}) {


    async function handleSubmit(e) {
        e.preventDefault();
        const payload = {
            user_id: data.user_id,
        }
        const response = await axios.post('http://localhost:5000/admin-api/activate-library-users/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        console.log(response?.data);
        await fetchUsers();
    }


    return (
    <Card sx={{ minWidth: 275 }}>
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
        School: {data.school_name}
    </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" type='button' onClick={(e) => handleSubmit(e)}>Activate</Button>
      </CardActions>
    </Card>
  );
}