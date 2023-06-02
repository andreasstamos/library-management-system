import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { CircularProgress, TextField, Box } from '@mui/material';
import BorrowsTable from '../../Components/BorrowsTable';
import debounce from "lodash/debounce";

function Borrows() {


  const [borrows, setBorrows] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  async function fetchBorrows() {
    const payload = {
      ...(firstName?.length > 0 && {first_name: firstName}),
      ...(lastName?.length > 0 && {last_name: lastName}),
    }

    const response = await axios.post('http://localhost:5000/lib-api/get-borrows/', payload, {
      headers: {
        'Access-Control-Expose-Headers' : '*',
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
      }
    });
    setBorrows(response?.data?.borrows);

    setLoading(false);
  }

  useEffect(() => {
    const debounced_fetchBorrows = debounce(() => {
      setLoading(true);
      fetchBorrows();
    }, 500); //500ms between search calls to api.
    debounced_fetchBorrows();

    return () => {debounced_fetchBorrows.cancel();}
  }, [firstName, lastName]);


  return (
    <div className='dashboard-component'>
      <h2 className='component-title'>Δανεισμοί</h2>
      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
        <Box sx={{display:'flex', columnGap: '1rem', ml: 'auto'}}>
          <TextField value={firstName} label="Όνομα" onChange={(e) => {setFirstName(e.target.value);}} />
          <TextField value={lastName} label="Επώνυμο" onChange={(e) => {setLastName(e.target.value);}} />
        </Box>
        {loading && <CircularProgress />}
        {borrows && (borrows.length > 0 ? <BorrowsTable 
          data={borrows} fetchBorrows={fetchBorrows}
        /> : <h3>Δεν βρέθηκαν δανεισμοί.</h3>)}
      </Box>


    </div>
  )
}

export default Borrows
