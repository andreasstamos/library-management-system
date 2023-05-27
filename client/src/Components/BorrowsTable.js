import {useContext} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import axios from 'axios';

import AuthContext from "../context/AuthContext";
import dayjs from 'dayjs';
import 'dayjs/locale/el';
dayjs.locale('el');


function Row({data,fetchBorrows}) {
  const auth = useContext(AuthContext);

  async function deleteBorrow() {
    const payload = {
      borrow_id: data.borrow_id
    }
    try {
      const response = await axios.post('http://localhost:5000/item/delete-borrow/', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }
      });
    } catch (e) {};
    await fetchBorrows();
    return;
  }

  async function returnBorrow() {
    const payload = {
      item_id: data.item_id
    }
    try {
      const response = await axios.post('http://localhost:5000/item/return/', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }
      });
    } catch (e) {};
    await fetchBorrows();
    return;
  }

  return (
    <TableRow
      key={data.title}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {data.title}
      </TableCell>
      <TableCell align="right">{data.isbn}</TableCell>
      <TableCell align="right">{data.item_id}</TableCell>
      <TableCell align="right">
        <div>{`${data.lender_first_name} ${data.lender_last_name}`}</div>
        <div>{`${data.lender_username}, AM: ${data.lender_id}`}</div>
      </TableCell>
      <TableCell align="right">
        <div>{`${data.borrower_first_name} ${data.borrower_last_name}`}</div>
        <div>{`${data.borrower_username}, AM: ${data.borrower_id}`}</div>
      </TableCell>
      <TableCell align="right">{dayjs(data.borrowed_on).format('HH:mm:ss DD/MM/YYYY')}</TableCell>
      {data.returned_on ? <TableCell align="right">{dayjs(data.returned_on).format('HH:mm:ss DD/MM/YYYY')}</TableCell> :
      <TableCell sx={{color: 'warning.main'}}align="right">Δεν έχει επιστραφεί ακόμα</TableCell>}
      <TableCell align="right">{dayjs(data.expected_return).format('DD/MM/YYYY')}</TableCell>
      <TableCell align="center">
        {data.returned_on === null && <Button onClick={returnBorrow}>ΕΠΙΣΤΡΟΦΗ</Button>}
        <Button color="error" onClick={deleteBorrow}>ΔΙΑΓΡΑΦΗ</Button>
      </TableCell>
    </TableRow>
  )
}

export default function BorrowsTable({data, fetchBorrows}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Τίτλος</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell align="right">Αριθμός αντιτύπου</TableCell>
            <TableCell align="right">Χειριστής που εκτέλεσε τον δανεισμό</TableCell>
            <TableCell align="right">Δανειζόμενος χρήστης</TableCell>
            <TableCell align="right">Ημερομηνία έναρξης δανεισμού</TableCell>
            <TableCell align="right">Ημερομηνία επιστροφής</TableCell>
            <TableCell align="right">Προβλεπόμενη ημερομηνία επιστροφής</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {data.map((row) => (
            <Row data={row} fetchBorrows={fetchBorrows}/>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
