import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';



export default function ButtonAppBar() {

  let {user} = useContext(AuthContext);

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
          
          <Button color="inherit" component={Link} to="/" className='navLink'>Books</Button>
          <Button color="inherit" component={Link} to="/profile/" className='navLink'>ΠΡΟΦΙΛ</Button>
          <Button color="inherit" component={Link} to="/my-borrows/" className='navLink'>Οι δανεισμοι μου</Button>

          {user?.sub?.role === 'lib_editor' && <Button color="inherit" component={Link} to="/lib-editor/" className='navLink'>Dashboard</Button>}

        </Toolbar>
      </AppBar>
    </Box>
  );
}