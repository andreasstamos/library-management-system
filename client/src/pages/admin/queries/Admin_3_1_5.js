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

function Admin_3_1_5() {

  const [editors, setEditors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  const fetchEditors = async () => {
    try {
      const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_5/', {}, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      setEditors(response?.data?.editors);
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  useEffect(() => {fetchEditors();}, []);


  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>  
      <h2 className='title-with-hr'>Χειριστές βιβλίων ανά πλήθος δανεισμών (>20)</h2>

      {editors && (editors?.length > 0 ?
        <Box sx={{mr: 'auto'}}><TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Αριθμός δανεισμών</TableCell>
                <TableCell>Ονοματεπώνυμα χειριστών</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editors.map((row) => (
                <TableRow
                  key={row.cnt}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.cnt}
                  </TableCell>
                  <TableCell>{row.editors.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer></Box> : <h3>Δεν βρέθηκαν χειριστές που να έχουν εκτελέσει άνω των 20 δανεισμών.</h3>)
      }

      <div className='queries-container'>
        {loading && <CircularProgress />}
      </div>
    </Box>
  )
}

export default Admin_3_1_5;
