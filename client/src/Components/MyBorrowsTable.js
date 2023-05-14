import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function MyBorrowsTable({data}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell align="right">ISBN</TableCell>
            <TableCell align="right">Item ID</TableCell>
            <TableCell align="right">Publisher</TableCell>
            <TableCell align="right">Borrowed</TableCell>
            <TableCell align="right">Returned</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((book) => (
            <TableRow
              key={book.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {book.title}
              </TableCell>
              <TableCell align="right">{book.isbn}</TableCell>
              <TableCell align="right">{book.item_id}</TableCell>
              <TableCell align="right">{book.publisher_name}</TableCell>
              <TableCell align="right">{book.borrowed_on}</TableCell>
              <TableCell align="right">{book.returned}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}