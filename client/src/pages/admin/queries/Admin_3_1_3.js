import { useState, useContext } from 'react'
import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import axios from 'axios';

import {Box} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import AuthContext from '../../../context/AuthContext';

function Admin_3_1_3() {

  const [teachers, setTeachers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  const fetchTeachers = async () => {
    try {
      const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_3/', {}, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      setTeachers(response?.data?.teachers);
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  useEffect(() => {fetchTeachers();}, []);


  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <h2 className='title-with-hr'>Nέοι εκπαιδευτικοί (ηλικία &lt; 40 ετών) με τους περισσότερους δανεισμούς</h2>

      {teachers && (teachers?.length > 0 ?
        <Box sx={{mr: 'auto'}}><TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Αριθμός χρήστη</TableCell>
                <TableCell>Όνομα</TableCell>
                <TableCell>Επώνυμο</TableCell>
                <TableCell>Αριθμός δανεισμών</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((row) => (
                <TableRow
                  key={row.user_id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.user_id}
                  </TableCell>
                  <TableCell>{row.first_name}</TableCell>
                  <TableCell>{row.last_name}</TableCell>
                  <TableCell>{row.cnt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer></Box> : <h3>Κανένας νέος εκπαιδευτικός (ηλικία &lt; 40 ετών) δεν έχει δανειστεί βιβλίο.</h3>)
      }

      <div className='queries-container'>
        {loading && <CircularProgress />}
      </div>
    </Box>
  )
}

export default Admin_3_1_3;
