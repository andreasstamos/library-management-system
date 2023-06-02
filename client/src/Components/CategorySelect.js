import React, {useState, useEffect} from 'react'
import axios from 'axios';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { CircularProgress } from '@mui/material';
import {Box} from '@mui/material';
export default function CategorySelect({categorySelected, setCategorySelected}) {


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
          <InputLabel id="demo-simple-select-label">Category</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={categorySelected}
            label="Category"
            onChange={handleChange}
          >
              {options.map((option) => {return <MenuItem key={option.category_id} value={option.category_id}>{option.category_name}</MenuItem>})}
  
          </Select>
        </FormControl>
      </Box>
    );
  }
  
