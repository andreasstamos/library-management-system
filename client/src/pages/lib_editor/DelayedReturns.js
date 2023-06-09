import { TextField, Button, CircularProgress } from '@mui/material'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import 'dayjs/locale/el';
dayjs.locale('el');



function DelayedReturns() {

    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    const [datesDelayed, setDatesDelayed] = useState(null);
    const [firstNameSearch, setFirstNameSearch] = useState(null);
    const [lastNameSearch, setLastNameSearch] = useState(null);


    async function getDelayedReturns() {
        setLoading(true);
        setUsers(null);
        const payload = {
        }

        if (datesDelayed) payload['dates_late'] = parseInt(datesDelayed);
        if (firstNameSearch) payload['first_name'] = firstNameSearch;
        if (lastNameSearch) payload['last_name'] = lastNameSearch;



        const response = await axios.post('http://localhost:5000/lib-api/queries/3_2_2/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        console.log(response?.data?.users);
        setUsers(response?.data?.users);
        setLoading(false);
    }

    useEffect( () => {
        getDelayedReturns();
    }, [])


  return (
    <div className='dashboard-component'>
    <h2 className='component-title'>Καθυστερημένες επιστροφές</h2>
    <div className='component-details'>
    <div className='queries-filter'>
           <TextField 
            type="number"
            label="Αργοπορία (μέρες)"
            value={datesDelayed}
            onChange={(e) => setDatesDelayed(e.target.value)}
            size="small"
           />
        
           <TextField
            label="Όνομα"
            id="outlined-size-small"
            size="small"
            value={firstNameSearch}
            onChange={(e) => setFirstNameSearch(e.target.value)}
           />
           <TextField
            label="Επίθετο"
            id="outlined-size-small"
            size="small"
            value={lastNameSearch}
            onChange={(e) => setLastNameSearch(e.target.value)}
           />

            <Button variant="outlined" startIcon={<SearchIcon />} onClick={getDelayedReturns}>
            Αναζητηση
            </Button>
        </div>
      
      {!loading && users && (users.length > 0 ? <DelayedUsersTable 
        data={users}
      /> : <h3>Δεν βρέθηκαν χρήστες με καθυστερημένες επιστροφές που να ικανοποιούν τα κριτήρια αναζήτησης.</h3>)}
      {loading && <CircularProgress/>}
    </div>
    

</div>
  )
}

export default DelayedReturns


function DelayedUsersTable({data}) {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Δανειζόμενος χρήστης</TableCell>
              <TableCell>Προβλεπόμενη ημερομηνία επιστορφής (του πιο καθυστερημένου αντιτύπου)</TableCell>
              <TableCell>Ημέρες καθυστέρησης (του πιο καθυστερημένου αντιτύπου)</TableCell>
              <TableCell>Συνολικός αριθμός καθυστερημένων αντιτύπων</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.user_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                    <div>{row.full_name}</div>
                    <div>{`${row.username}, AM: ${row.user_id}`}</div>
                </TableCell>
                <TableCell>{dayjs(data.expected_return).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{row.date_difference}</TableCell>
                <TableCell>{row.cnt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
