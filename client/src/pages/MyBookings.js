import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material';
import MyBookingsTable from '../Components/MyBookingsTable';
import axios from 'axios';

function MyBookings() {

    const [loading, setLoading] = useState(true);
    const [myBookings, setMyBookings] = useState(null);


    async function fetchMyBookings() {
        const response = await axios.post('http://localhost:5000/student-api/my-bookings/', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        setLoading(false);
        setMyBookings(response?.data?.bookings);
    }

    useEffect( () => {
        fetchMyBookings();
    }, [])

  return (
    <div>
        <h1 className='title-with-hr'>Οι κρατήσεις μου</h1>
        <div className='my-borrows-container'>
            {loading && <CircularProgress />}
            {!loading && (myBookings && myBookings.length > 0 ? <MyBookingsTable data={myBookings} fetchBookings={fetchMyBookings}/> :
                <h3>Δεν έχετε εκτελέσει καμία κράτηση.</h3>)} 
        </div>
    </div>
  )
}

export default MyBookings;
