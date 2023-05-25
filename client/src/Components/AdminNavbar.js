import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';


export default function AdminNavbar() {
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Πίνακας ελέγχου διαχειριστή
          </Typography>
          <Button color="inherit" component={Link} to="" className='navLink'>ΑΡΧΙΚΗ</Button>
          <Button color="inherit" component={Link} to="schools/" className='navLink'>ΣΧΟΛΕΙΑ</Button>
          <Button color="inherit" component={Link} to="lib-editors/" className='navLink'>ΧΕΙΡΙΣΤΕΣ ΒΙΒΛΙΟΘΗΚΩΝ</Button>
          <Button color="inherit" component={Link} to="queries/" className='navLink'>ΣΤΑΤΙΣΤΙΚΑ</Button>

        </Toolbar>
      </AppBar>
    </Box>
  );
}
