import { Box, Typography } from '@mui/material';
import { random } from 'lodash';
import { useState, useEffect } from 'react';
import {useLocation } from 'react-router-dom';

function CopyrightNotice() {
  let location = useLocation();
  const [rand, setRand] = useState(0);

  useEffect(() => {setRand(random(0,1))}, [location])

  return (<Box sx={{paddingTop: '1rem', display: 'flex', justifyContent: 'center'}}><Typography sx={{color: 'grey.600'}} variant="body2">
    &copy; {new Date().getFullYear()} {rand === 1 ? 'Κωνσταντίνος Πίκουλας - Ανδρέας Στάμος' : 'Ανδρέας Στάμος - Κωνσταντίνος Πίκουλας'}
  </Typography></Box>);
}

export default CopyrightNotice;
