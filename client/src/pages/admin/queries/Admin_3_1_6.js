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

function Admin_3_1_6() {

  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  const fetchCategories = async () => {
    try {
      const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_6/', {}, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      setCategories(response?.data?.category_pairs);
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  useEffect(() => {fetchCategories();}, []);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>  
      <h2 className='title-with-hr'>TOP-3 ζεύγη κατηγοριών σε δανεισμούς</h2>

      {categories && (categories?.length > 0 ?
        <Box sx={{mr: 'auto'}}><TableContainer component={Paper}>
          <Table size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Θέση</TableCell>
                <TableCell>Ζεύγος κατηγοριών</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((index, row) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {index+1}
                  </TableCell>
                  <TableCell>{row.categories.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer></Box> : <h3>Δεν βρέθηκαν δανεισμοί βιβλίων που να διαθέτουν τουλάχιστον δύο κατηγορίες.</h3>)
      }

      <div className='queries-container'>
        {loading && <CircularProgress />}
      </div>
    </Box>
  )
}

export default Admin_3_1_6;
