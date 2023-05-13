import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import { Alert, CircularProgress, Rating } from '@mui/material';


function createData(username, rating, body) {
  return {
    username,
    rating,
    body,
  };
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.username}
        </TableCell>
        <TableCell align="right">
            <Rating name="read-only" value={parseInt(row.rating)} readOnly />
        </TableCell>

      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Review
              </Typography>
              
                    <Typography>{row.body}</Typography>

            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Row.propTypes = {
//   row: PropTypes.shape({
//     calories: PropTypes.number.isRequired,
//     carbs: PropTypes.number.isRequired,
//     fat: PropTypes.number.isRequired,
//     history: PropTypes.arrayOf(
//       PropTypes.shape({
//         amount: PropTypes.number.isRequired,
//         customerId: PropTypes.string.isRequired,
//         date: PropTypes.string.isRequired,
//       }),
//     ).isRequired,
//     name: PropTypes.string.isRequired,
//     price: PropTypes.number.isRequired,
//     protein: PropTypes.number.isRequired,
//   }).isRequired,
// };

export default function Reviews({bookISBN}) {

    const [reviews, setReviews] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [err, setErr] = React.useState(false);


    async function fetchReviews() {
        setErr(false);
        const payload = {
            isbn:bookISBN,
        }
        try {
            const response = await axios.post('http://localhost:5000/book/get-book-raitings/', payload, {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }})

            console.log(response?.data?.reviews);
            let reviewRows = []
            response?.data?.reviews.forEach((review) => {
                reviewRows.push(createData(review?.username, review?.rate, review?.body))
            })
            setReviews(reviewRows);
        } catch (err) {
            setErr(true);
        }
        setLoading(false);

    }

    React.useEffect( () => {
        fetchReviews();
    }, [])


  return (
    <>
    <h2 className='title-with-hr'>Reviews</h2>
    {loading && <CircularProgress/>}
    {err && <Alert severity='error'>Something went wrong :(</Alert>}
    { reviews && 
    <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
            <TableHead>
            <TableRow>
                <TableCell />
                <TableCell>Username</TableCell>
                <TableCell align="right">Rating</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {reviews.map((row) => (
                <Row key={row.username} row={row} />
            ))}
            </TableBody>
        </Table>
        </TableContainer>}
        
    </>
  );
}