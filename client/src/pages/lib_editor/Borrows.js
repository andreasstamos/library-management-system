import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material';
import BorrowsTable from '../../Components/BorrowsTable';

function Borrows() {


  const [borrows, setBorrows] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchBorrows() {
    const response = await axios.post('http://localhost:5000/lib-api/get-borrows/', {}, {
      headers: {
         'Access-Control-Expose-Headers' : '*',
         'Access-Control-Allow-Origin': '*', 
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
      }
  });
  setBorrows(response?.data?.borrows);

  console.log(response?.data?.borrows);
  setLoading(false);
  }

  useEffect(() => {
    fetchBorrows();
  }, [])

  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>Borrows</h2>
        <div className='component-details'>
          {loading && <CircularProgress />}
          {borrows && (borrows.length > 0 ? <BorrowsTable 
          data={borrows}
          /> : <h3>No Borrows</h3>)}
        </div>
        
    
</div>
  )
}

export default Borrows