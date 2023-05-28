import React, { useEffect } from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import CategorySelect from '../../Components/CategorySelect';
import axios from 'axios';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CircularProgress } from '@mui/material';


function AverageRatings() {

    const [value, setValue] = React.useState(0);
    const [categorySelected, setCategorySelected] = React.useState(null);
    const [firstNameSearch, setFirstNameSearch] = React.useState('');
    const [lastNameSearch, setLastNameSearch] = React.useState('');
    const [loadingCategories, setLoadingCategories] = React.useState(true);
    const [loadingUsers, setLoadingUsers] = React.useState(true);



    const [ratingsPerCategory, setRatingsPerCategory] = React.useState(null);
    const [ratingsPerUser, setRatingsPerUser] = React.useState(null);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };


    async function fetchRatingsPerUser() {
        setRatingsPerUser(null);
        const payload = {}
        if (lastNameSearch) payload['last_name'] = lastNameSearch
        if (firstNameSearch) payload['first_name'] = firstNameSearch

        const response = await axios.post('http://localhost:5000/lib-api/queries/average-rating-per-borrower/', payload, {
          headers: {
            'Access-Control-Expose-Headers' : '*',
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
         }
        })
        setRatingsPerUser(response?.data?.users);
        setLoadingUsers(false)
    }

    async function fetchRatingPerCategory() {
      setRatingsPerCategory(null);
        const payload = {}
        
        if (categorySelected) payload['category_id'] = parseInt(categorySelected);
       
        const response = await axios.post('http://localhost:5000/lib-api/queries/average-rating-per-category/', payload, {
          headers: {
            'Access-Control-Expose-Headers' : '*',
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
         }
        })
        setRatingsPerCategory(response?.data?.reviews);
        setLoadingCategories(false);
    }

    useEffect( () => {
      setLoadingCategories(true)
      fetchRatingPerCategory();
    }, [categorySelected])


    useEffect( () => {
      setLoadingUsers(true)
      fetchRatingsPerUser();
    }, [])

  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>Μέσος Όρος Αξιολογήσεων</h2>
        <div className='component-details'>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Ανα Δανειζομενο" {...a11yProps(0)} />
            <Tab label="Ανα Κατηγορια" {...a11yProps(1)} />
        </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <div className='queries-filter'>
              <TextField 
                  label="Όνομα"
                  id="outlined-size-small"
                  size="small"
                  value={firstNameSearch}
                  onChange={(e) => setFirstNameSearch(e.target.value)}
                  />
              <TextField 
                  label="Επίθετο"
                  id="outlined-size-small"
                  size="small"
                  value={lastNameSearch}
                  onChange={(e) => setLastNameSearch(e.target.value)}
                  />
              <Button variant="contained" endIcon={<SearchIcon />} onClick={fetchRatingsPerUser}>
                Αναζητηση
              </Button>
          </div>
        {loadingUsers && <CircularProgress/>}
        {ratingsPerUser && (ratingsPerUser.length > 0 ?(
            <RatingsPerUserTable data={ratingsPerUser}/>)
            :<h3>Δεν βρέθηκαν αξιολογήσεις.</h3>
            )}
        </TabPanel>
        <TabPanel value={value} index={1}>
        <div className='queries-filter'>
            <CategorySelect categorySelected={categorySelected} setCategorySelected={setCategorySelected} />

        </div>
        {loadingCategories && <CircularProgress />}
            {ratingsPerCategory && (ratingsPerCategory.length > 0 ?(
            <RatingsPerCategoryTable data={ratingsPerCategory}/>)
            :<h3>Δεν βρέθηκαν αξιολογήσεις.</h3>
            )}
        </TabPanel>

        </div>
    </div>
  )
}

export default AverageRatings


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



function RatingsPerUserTable({data}) {
  return (
    <TableContainer component={Paper} sx={{mt:3}}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Average Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.user_id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.user_id}
              </TableCell>
              <TableCell>{row.first_name}</TableCell>
              <TableCell>{row.last_name}</TableCell>
              <TableCell>{row.username}</TableCell>
              <TableCell>{parseInt(row.avg)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}



function RatingsPerCategoryTable({data}) {
  return (
    <TableContainer component={Paper} sx={{mt:3}}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Category ID</TableCell>
            <TableCell>Category Name</TableCell>
            <TableCell>Average Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.category_id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.category_id}
              </TableCell>
              <TableCell>{row.category_name}</TableCell>
              <TableCell>{parseInt(row.avg)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}