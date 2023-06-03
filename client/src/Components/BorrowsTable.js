import {useContext} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
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
      <TableCell >{data.isbn}</TableCell>
      <TableCell >{data.item_id}</TableCell>
      <TableCell >
        <div>{`${data.lender_first_name} ${data.lender_last_name}`}</div>
        <div>{`${data.lender_username}, AM: ${data.lender_id}`}</div>
      </TableCell>
      <TableCell>
        <div>{`${data.borrower_first_name} ${data.borrower_last_name}`}</div>
        <div>{`${data.borrower_username}, AM: ${data.borrower_id}`}</div>
      </TableCell>
      <TableCell>{dayjs(data.borrowed_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
      {data.returned_on ? <TableCell >{dayjs(data.returned_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell> :
      <TableCell sx={{color: 'warning.main'}}>Δεν έχει επιστραφεί ακόμα</TableCell>}
      <TableCell >{dayjs(data.expected_return).format('DD/MM/YYYY')}</TableCell>
      <TableCell>
        {data.returned_on ? <CheckCircleIcon color="success" /> : (data.time_valid ? <PendingIcon color="warning" /> : <WarningIcon color="error" />)}
      </TableCell>
      <TableCell>
        {data.returned_on === null && <Button color="secondary" onClick={returnBorrow}>ΕΠΙΣΤΡΟΦΗ</Button>}
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
            <TableCell >Αριθμός αντιτύπου</TableCell>
            <TableCell >Χειριστής που εκτέλεσε τον δανεισμό</TableCell>
            <TableCell >Δανειζόμενος χρήστης</TableCell>
            <TableCell >Ημερομηνία έναρξης δανεισμού</TableCell>
            <TableCell >Ημερομηνία επιστροφής</TableCell>
            <TableCell >Προβλεπόμενη ημερομηνία επιστροφής</TableCell>
            <TableCell>
              <Box>Κατάσταση</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><PendingIcon color="warning" fontSize="small"/>: σε ισχύ</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleIcon color="success" fontSize="small"/>: έχει επιστραφεί</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><WarningIcon color="error" fontSize="small"/>: έχει καθυστερήσει η επιστροφή</Box>
            </TableCell>

            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {data.map((row) => (
            <Row key={row?.borrow_id} data={row} fetchBorrows={fetchBorrows}/>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}
