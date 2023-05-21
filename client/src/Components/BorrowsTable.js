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



function Row({data}) {
    



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
        <TableCell align="right">{data.lender}</TableCell>
        <TableCell align="right">{data.borrower}</TableCell>
        <TableCell align="right">{data.borrowed_on}</TableCell>
        <TableCell align="right">{data.expected_return}</TableCell>
      </TableRow>
    )
}

export default function BorrowsTable({data}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell align="right">Item ID</TableCell>
            <TableCell align="right">Lender</TableCell>
            <TableCell align="right">Borrower</TableCell>
            <TableCell align="right">Borrowed On</TableCell>
            <TableCell align="right">Expected Return</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>

          {data.map((row) => (
            <Row data={row}/>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
  );
}