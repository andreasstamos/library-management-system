import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Button } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/el';
dayjs.locale('el');



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
      <TableCell align="right" component="th" scope="row">
        {data.booking_id}
      </TableCell>
      <TableCell align="right">
        <div>{`${data.first_name} ${data.last_name}`}</div>
        <div>{`${data.username}, AM: ${data.user_id}`}</div>
      </TableCell>
      <TableCell align="right">{data.title}</TableCell>
      <TableCell align="right">{data.isbn}</TableCell>
      <TableCell align="right">{dayjs(data.booked_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
      <TableCell align="center">{data.lent ? <CheckCircleIcon color="success"/> :
          (data.time_valid ? <PendingIcon color="warning" /> : <CancelIcon color="error"/>)}</TableCell>
      <TableCell align="center"><Button color="error" onClick={deleteBooking}>ΔΙΑΓΡΑΦΗ</Button></TableCell>
    </TableRow>
  )
}

export default function BookingsTable({data, fetchBookings}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Αριθμός κράτησης</TableCell>
            <TableCell align="right">Χρήστης</TableCell>
            <TableCell align="right">Τίτλος</TableCell>
            <TableCell align="right">ISBN</TableCell>
            <TableCell align="right">Ημερομηνία κράτησης</TableCell>
            <TableCell align="center">
              <Box>Κατάσταση</Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}><PendingIcon color="warning" fontSize="small"/>: σε ισχύ</Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}><CheckCircleIcon color="success" fontSize="small"/>: ο δανεισμός ολοκληρώθηκε</Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}><CancelIcon color="error" fontSize="small"/>: έληξε χωρίς δανεισμό</Box>
              </TableCell>
            <TableCell align="center"></TableCell>
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
