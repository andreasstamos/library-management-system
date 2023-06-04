import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Tab, Tabs   } from '@mui/material';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import axios from 'axios';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


function Admin_3_1_2() {
    


    const [categorySelected, setCategorySelected] = useState(null);
    const [tab, setTab] = useState(0);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleChange = (event, newValue) => {
        setTab(newValue);
      };

    async function fetchData() {
        setData(null);
        const payload = {
            category: categorySelected
        }
        const response = await axios.post('http://localhost:5000/admin-api/queries/3_1_2/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })

        console.log(response?.data?.results?.authors);
        setData(response?.data?.results);
        setLoading(false);
    }

    useEffect( () => {
        if(!categorySelected) return;
        setLoading(true);
        fetchData();
    }, [categorySelected])

  return (
    <>
    <h2 className='title-with-hr'>Στατιστικά ανά κατηγορία</h2>
    <div className='queries-filter'>
            <CategorySelect categorySelected={categorySelected} setCategorySelected={setCategorySelected} />
    </div>

    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="ΣΥΓΓΡΑΦΕΙΣ" {...a11yProps(0)} />
          <Tab label="ΕΚΠΑΙΔΕΥΤΙΚΟΙ ΠΟΥ ΕΧΟΥΝ ΔΑΝΕΙΣΤΕΙ ΤΟ ΤΕΛΕΥΤΑΙΟ ΕΤΟΣ" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <h3 className='title-with-hr'>Συγγραφείς</h3>
        {loading && <CircularProgress />}
       {data?.authors && data?.authors.length > 0 && <UserTable data={data?.authors} />}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <h3 className='title-with-hr'>Εκπαιδευτικοί που εχουν δανειστεί βιβλίο της κατηγορίας το τελευταίο έτος</h3>
        {loading && <CircularProgress />}
       {data?.teachers && data?.teachers.length > 0 && <UserTable data={data?.teachers} />}

      </TabPanel>
    </Box>

    </>
  )
}

export default Admin_3_1_2

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
  



function CategorySelect({categorySelected, setCategorySelected}) {


  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(null);
  
  const handleChange = (event) => {
    setCategorySelected(event.target.value);
  };


  async function fetchCategories() {
    try {
        const payload = {
        };

        const response = await axios.post('http://127.0.0.1:5000/book/category/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
        }});
        setLoading(false);

        if (response.data.categories) {
          setOptions(response.data.categories);
        }
      } catch (e) {
        setLoading(false);
      }
  }

  useEffect( () => {
    fetchCategories();
  }, [])
  if(loading) return <CircularProgress />
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Κατηγορία</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={categorySelected}
          label="Κατηγορία"
          onChange={handleChange}
        >
            {options.map((option) => {return <MenuItem key={option.category_id} value={option.category_id}>{option.category_name}</MenuItem>})}

        </Select>
      </FormControl>
    </Box>
  );
}

// Both authors and teaches use this table.
// If we need to display different info about those two we need seperate tables...
function UserTable({data}) {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
                <TableCell>Αναγνωριστικό</TableCell>
              <TableCell>Όνομα</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell>{row.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
