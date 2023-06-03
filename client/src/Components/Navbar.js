import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';


export default function ButtonAppBar() {
  const navigate = useNavigate();



  let {user, logoutUser} = useContext(AuthContext);

  function logoutHandle() {
    logoutUser();
    navigate('/auth/login/', {replace:true})
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            MySchoolLib
          </Typography>
          
          <Button color="inherit" component={Link} to="/" className='navLink'>ΒΙΒΛΙΑ</Button>
          <Button color="inherit" component={Link} to="/profile/" className='navLink'>ΠΡΟΦΙΛ</Button>
          <Button color="inherit" component={Link} to="/my-borrows/" className='navLink'>ΟΙ ΔΑΝΕΙΣΜΟΙ ΜΟΥ</Button>
          <Button color="inherit" component={Link} to="/my-bookings/" className='navLink'>ΟΙ ΚΡΑΤΗΣΕΙΣ ΜΟΥ</Button>

          {user?.sub?.role === 'lib_editor' && <Button color="inherit" component={Link} to="/lib-editor/" className='navLink'>ΠΙΝΑΚΑΣ ΕΛΕΓΧΟΥ</Button>}
          <Button color="inherit" className='navLink' onClick={logoutHandle}>Αποσυνδεση</Button>


        </Toolbar>
      </AppBar>
    </Box>
  );
}
