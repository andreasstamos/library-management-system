import axios from 'axios';
import React, { useEffect, useState } from 'react'
import BookingsTable from '../../Components/BookingsTable';
import { CircularProgress, TextField, Box } from '@mui/material';

import debounce from "lodash/debounce";

function Bookings() {

  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');


  async function fetchBookings() {
    const payload = {
      ...(firstName?.length > 0 && {first_name: firstName}),
      ...(lastName?.length > 0 && {last_name: lastName}),
    }
  
    const response = await axios.post('http://localhost:5000/booking/get-bookings/', payload, {
      headers: {
        'Access-Control-Expose-Headers' : '*',
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
      }
    });
    setBookings(response?.data?.bookings);

    setLoading(false);
  }

  useEffect(() => {
    const debounced_fetchBookings = debounce(() => {
      setLoading(true);
      fetchBookings();
    }, 500); //500ms between search calls to api.
    debounced_fetchBookings();

    return () => {debounced_fetchBookings.cancel();}
  }, [firstName, lastName]);


  return (
    <div className='dashboard-component'>
      <h2 className='component-title'>Κρατήσεις</h2>
      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
        <Box sx={{display:'flex', columnGap: '1rem', ml: 'auto'}}>
          <TextField value={firstName} label="Όνομα" onChange={(e) => {setFirstName(e.target.value);}} />
          <TextField value={lastName} label="Επώνυμο" onChange={(e) => {setLastName(e.target.value);}} />
        </Box>
        {loading && <CircularProgress />}
        {bookings && (bookings.length > 0 ? <BookingsTable 
          data={bookings} fetchBookings={fetchBookings}
        /> : <h3>Δεν βρέθηκαν κρατήσεις.</h3>)}
      </Box>
    </div>
  )
}

export default Bookings
