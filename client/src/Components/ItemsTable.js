import {useState, useContext, useEffect} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';
import AuthContext from "../context/AuthContext";
import dayjs from 'dayjs';
import 'dayjs/locale/el';
dayjs.locale('el');


function Row({data, fetchItems}) {
  const auth = useContext(AuthContext);

  async function deleteItem() {
    const payload = {
      item_id: data.item_id
    }
    try {
      const response = await axios.post('http://localhost:5000/item/delete/', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }
      });
    } catch (e) {};
    await fetchItems();
    return;
  }

  async function returnItem() {
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
    await fetchItems();
    return;
  }

  return (
    <TableRow
      key={data?.item_id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell component="th" scope="row">
        {data?.item_id}
      </TableCell>
      <TableCell >{!data?.lent ? <CheckCircleIcon color="success"/> :
          (data?.time_valid ? <PendingIcon color="warning" /> : <WarningIcon color="error"/>)}</TableCell>
      <TableCell>
        {data?.lent && <Button onClick={returnItem}>ΕΠΙΣΤΡΟΦΗ</Button>}
        <Button color="error" onClick={deleteItem}>ΔΙΑΓΡΑΦΗ ΑΝΤΙΤΥΠΟΥ</Button>
      </TableCell>
    </TableRow>
  )
}

export default function ItemsTable({isbn}) {
  const auth = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      const payload = {
        isbn: isbn,
      };

      const response = await axios.post('http://127.0.0.1:5000/item/get-by-isbn/', payload, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      setItems(response?.data?.items);
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);


  return (
    <Box sx={{mr: 'auto', display: 'flex', flexDirection: 'column'}}>
      <h2 className='title-with-hr'>Αντίτυπα</h2>
      {!loading && items && items?.length > 0 && <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Αριθμός αντιτύπου</TableCell>
              <TableCell>
                <Box>Κατάσταση</Box>
                <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><PendingIcon color="warning" fontSize="small"/>: δανεισμένο</Box>
                <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><CheckCircleIcon color="success" fontSize="small"/>: στο ράφι</Box>
                <Box sx={{display: 'flex', justifyContent: 'flex-start'}}><WarningIcon color="error" fontSize="small"/>: καθυστερημένη επιστροφή</Box>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {items.map((row) => (
              <Row data={row} fetchItems={fetchItems} key={row?.item_id} />
            ))}

          </TableBody>
        </Table>
      </TableContainer>}
      {!loading && !(items && items?.length > 0) && <h3>Δυστυχώς δεν υπάρχουν αντίτυπα του βιβλίου στην βιβλιοθήκη.</h3>}
    </Box>
  );
}
