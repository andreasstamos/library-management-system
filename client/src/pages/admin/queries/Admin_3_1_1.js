import React, { useState } from 'react'
import Dropdown from '../../../Components/Dropdown'
import { CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect } from 'react';
import axios from 'axios';


import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';


function Admin_3_1_1() {

    const [borrows, setBorrows] = useState(null);
    const [schools, setSchools] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [schoolSelected, setSchoolSelected] = useState('');
    const [timeFilter, setTimeFilter] = useState('');
    
    const [loadingSchools, setLoadingSchools] = useState(true);


    async function fetchBorrows() {
        console.log(timeFilter);
        setBorrows(null);
        setLoading(true);
        const payload = {
            school_id: parseInt(schoolSelected)
        }

        if (timeFilter) payload['timefilter'] = timeFilter

        const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_1/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        console.log(response?.data?.borrows);
        setBorrows(response?.data?.borrows);
        setLoading(false);
    }

    async function fetchSchools() {
        const payload = {
          fetch_fields:['name', 'school_id']
        }
        const response = await axios.post('http://127.0.0.1:5000/school/get-schools/', payload, {headers: {
          'Content-Type': 'application/json'
        }});
        console.log(response);
        setLoadingSchools(false);
        setSchools(response?.data?.schools);
      }
    
      useEffect( () => {
        fetchSchools();
      }, [])

      useEffect( () => {
        if (!schoolSelected) return;
        setLoading(true);
        fetchBorrows();
      }, [schoolSelected])

  return (
    <>
        <h2 className='title-with-hr'>Παρουσίαση λίστας με συνολικό αριθμό δανεισμών ανά σχολείο</h2>
        <div className='queries-filter'>
            {schools && <Dropdown schoolSelected={schoolSelected} setSchoolSelected={setSchoolSelected} schools={schools} />}
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label={'"month" and "year"'} views={['month', 'year']} value={dayjs(timeFilter)} onChange={(e) => setTimeFilter(e)} />
            </LocalizationProvider> */}
            <input type="month" id="bdaymonth" name="bdaymonth" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} />

            <Button variant="contained" disabled={!schoolSelected && true} onClick={fetchBorrows}>Search</Button>
        </div>

            {borrows && (borrows.length > 0 ?
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Borrows ID</TableCell>
                        <TableCell>Book</TableCell>
                        <TableCell>Borrower</TableCell>
                        <TableCell>Lender</TableCell>
                        <TableCell>Borrowed On</TableCell>
                        <TableCell>Expected Return</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrows.map((row) => (
                        <TableRow
                          key={row.name}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.borrow_id}
                          </TableCell>
                          <TableCell>{row.title}</TableCell>
                          <TableCell>{row.borrower_full_name}</TableCell>
                          <TableCell>{row.lender_full_name}</TableCell>
                          <TableCell>{row.borrowed_on}</TableCell>
                          <TableCell>{row.expected_return}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer> : <h3>No Borrows</h3>)
        }

        <div className='queries-container'>
        {loading && schoolSelected && <CircularProgress />}
        </div>
    </>
  )
}

export default Admin_3_1_1