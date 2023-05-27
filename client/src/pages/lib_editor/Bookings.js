import axios from 'axios';
import React, { useEffect, useState } from 'react'
import BookingsTable from '../../Components/BookingsTable';
import { CircularProgress } from '@mui/material';

function Bookings() {


  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    setBookings(null);
    setLoading(true);
    const response = await axios.post('http://localhost:5000/booking/get-bookings/', {}, {
      headers: {
         'Access-Control-Expose-Headers' : '*',
         'Access-Control-Allow-Origin': '*', 
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
      }
  });
  setBookings(response?.data?.bookings);

  console.log(response?.data?.bookings);
  setLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, [])

  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>Bookings</h2>
        <div className='component-details'>
          {loading && <CircularProgress />}
          {bookings && (bookings.length > 0 ? <BookingsTable 
          data={bookings} fetchBookings={fetchBookings}
          /> : <h3>No Bookings</h3>)}
        </div>
  </div>
  )
}

export default Bookings