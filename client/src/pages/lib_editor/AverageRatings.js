import React, { useEffect } from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import CategorySelect from '../../Components/CategorySelect';
import axios from 'axios';


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
    const [loading, setLoading] = React.useState(true);


    const [ratingsPerCategory, setRatingsPerCategory] = React.useState(null);


    const handleChange = (event, newValue) => {
      setValue(newValue);
    };


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
        setLoading(false);
    }

    useEffect( () => {
      setLoading(true)
      fetchRatingPerCategory();
    }, [categorySelected])

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
        Ανά Δανειζόμενο
        </TabPanel>
        <TabPanel value={value} index={1}>
        <div className='queries-filter'>
            <CategorySelect categorySelected={categorySelected} setCategorySelected={setCategorySelected} />

        </div>
        {loading && <CircularProgress />}
            {ratingsPerCategory && (ratingsPerCategory.length > 0 ?(
            <RatingsPerCategoryTable data={ratingsPerCategory}/>)
            :<h3>Δεν βρέθηκαν αξιολογήσεις για αυτήν την κατηγορία</h3>
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