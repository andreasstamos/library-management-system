import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import dayjs from 'dayjs';
import 'dayjs/locale/el';
dayjs.locale('el');


export default function MyBorrowsTable({data}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Τίτλος</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Αντίτυπο</TableCell>
            <TableCell>Εκδότης</TableCell>
            <TableCell>Ημερομηνία δανεισμού</TableCell>
            <TableCell>Ημερομηνία επιστροφής</TableCell>
            <TableCell>Προβλεπόμενη ημερομηνία επιστροφής</TableCell>
            <TableCell>
              <Box>Κατάσταση</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><PendingIcon color="warning" fontSize="small"/>: σε ισχύ</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleIcon color="success" fontSize="small"/>: έχει επιστραφεί</Box>
              <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><WarningIcon color="error" fontSize="small"/>: έχει καθυστερήσει η επιστροφή</Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((book) => (
            <TableRow
              key={book.isbn}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {book.title}
              </TableCell>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>{book.item_id}</TableCell>
              <TableCell>{book.publisher_name}</TableCell>
              <TableCell>{dayjs(book.borrowed_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
              {book.returned ? <TableCell>{dayjs(book.returned_on).format('DD/MM/YYYY HH:mm:ss')}</TableCell> : <TableCell sx={{color: "warning.main"}}>Δεν έχει επιστραφεί</TableCell>}
              {book.returned ? <TableCell>Έχει επιστραφεί</TableCell> : <TableCell sx={{color: "warning.main"}}>{dayjs(book.expected_return).format('DD/MM/YYYY')}</TableCell>}

              <TableCell>
                {book.returned ? <CheckCircleIcon color="success" /> : (book.time_valid ? <PendingIcon color="warning" /> : <WarningIcon color="error" />)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
