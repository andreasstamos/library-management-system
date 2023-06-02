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
      <TableCell  component="th" scope="row">
        {data.booking_id}
      </TableCell>
      <TableCell >
        <div>{`${data.first_name} ${data.last_name}`}</div>
        <div>{`${data.username}, AM: ${data.user_id}`}</div>
      </TableCell>
      <TableCell >{data.title}</TableCell>
      <TableCell >{data.isbn}</TableCell>
      <TableCell >{dayjs(data.booked_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
      <TableCell >{data.lent ? <CheckCircleIcon color="success"/> :
          (data.time_valid ? <PendingIcon color="warning" /> : <CancelIcon color="error"/>)}</TableCell>
      <TableCell ><Button color="error" onClick={deleteBooking}>ΔΙΑΓΡΑΦΗ</Button></TableCell>
    </TableRow>
  )
}

export default function BookingsTable({data, fetchBookings}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell >Αριθμός κράτησης</TableCell>
            <TableCell >Χρήστης</TableCell>
            <TableCell >Τίτλος</TableCell>
            <TableCell >ISBN</TableCell>
            <TableCell>Ημερομηνία κράτησης</TableCell>
            <TableCell >
              <Box>Κατάσταση</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><PendingIcon color="warning" fontSize="small"/>: σε ισχύ</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleIcon color="success" fontSize="small"/>: ο δανεισμός ολοκληρώθηκε</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><CancelIcon color="error" fontSize="small"/>: έληξε χωρίς δανεισμό</Box>
              </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {data.map((row) => (
            <Row key={row?.booking_id} data={row} fetchBookings={fetchBookings}/>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
