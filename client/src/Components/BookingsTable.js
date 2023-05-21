import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button } from '@mui/material';
import axios from 'axios';



function Row({data, fetchBookings}) {
    


    async function deleteBooking() {
        const payload = {
          booking_id: data.booking_id
        }
        const response = await axios.post('http://localhost:5000/booking/delete-booking/', payload, {
          headers: {
             'Access-Control-Expose-Headers' : '*',
             'Access-Control-Allow-Origin': '*', 
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
          }
      });
        console.log(response);
        await fetchBookings();
        return;
    }

    return (
        <TableRow
        key={data.booking_id}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {data.booking_id}
        </TableCell>
        <TableCell align="right">{data.user_id}</TableCell>
        <TableCell align="right">{data.title}</TableCell>
        <TableCell align="right">{data.isbn}</TableCell>
        <TableCell align="right">{data.booked_on}</TableCell>
        <TableCell align="right">{data.lent ? <CheckCircleIcon style={{ color: "#337755" }}/> : <CancelIcon style={{ color: "#FF9494" }}/>}</TableCell>
        <TableCell align="right"><Button onClick={deleteBooking}>Delete Booking</Button></TableCell>
      </TableRow>
    )
}

export default function BookingsTable({data, fetchBookings}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Borrow ID</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell align="right">Title</TableCell>
            <TableCell align="right">ISBN</TableCell>
            <TableCell align="right">Date of Booking</TableCell>
            <TableCell align="right">Lent</TableCell>
            <TableCell align="right">Delete Booking</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {data.map((row) => (
            <Row data={row} fetchBookings={fetchBookings}/>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}