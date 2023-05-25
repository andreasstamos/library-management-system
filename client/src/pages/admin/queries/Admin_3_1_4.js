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

function Admin_3_1_4() {

  const [authors, setAuthors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  const fetchAuthors = async () => {
    try {
      const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_4/', {}, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      setAuthors(response?.data?.authors);
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  useEffect(() => {fetchAuthors();}, []);


  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>  
      <h2 className='title-with-hr'>Συγγραφείς των οποίων κανένα βιβλίο δεν έχει τύχει δανεισμού</h2>

      {authors && (authors?.length > 0 ?
        <Box sx={{mr: 'auto'}}><TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Συγγραφέας</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {authors.map((row) => (
                <TableRow
                  key={row.author_name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.author_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer></Box> : <h3>Δεν υπάρχει συγγραφέας του οποίου βιβλίου να μην έχει τύχει δανεισμού.</h3>)
      }

      <div className='queries-container'>
        {loading && <CircularProgress />}
      </div>
    </Box>
  )
}

export default Admin_3_1_4;
