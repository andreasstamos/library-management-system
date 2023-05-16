import React, { useEffect, useState } from 'react'
import './MyBorrows.css'
import { CircularProgress } from '@mui/material';
import MyBorrowsTable from '../Components/MyBorrowsTable';
import axios from 'axios';

function MyBorrows() {

    const [loading, setLoading] = useState(true);
    const [myBorrows, setMyBorrows] = useState(null);


    async function fetchMyBorrows() {
        const response = await axios.post('http://localhost:5000/student-api/my-borrows/', {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        console.log(response);
        setLoading(false);
        setMyBorrows(response?.data?.borrows);
    }

    useEffect( () => {
        fetchMyBorrows();
    }, [])

  return (
    <div>
        <h1 className='title-with-hr'>Οι δανεισμοί μου</h1>
        <div className='my-borrows-container'>
            {loading && <CircularProgress />}
            {!loading && (myBorrows.length > 0 ? <MyBorrowsTable data={myBorrows}/> : <h3>Δεν έχετε δανειστεί βιβλίο.</h3>)}
            
        </div>
    </div>
  )
}

export default MyBorrows