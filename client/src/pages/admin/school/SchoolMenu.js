import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AddIcon from '@mui/icons-material/Add';
import Cloud from '@mui/icons-material/Cloud';
import { NavLink } from 'react-router-dom';

export default function SchoolMenu() {
  return (
    <Box sx={{display: 'flex', columnGap: '1rem'}}>
      <Paper sx={{ mr: 'auto' }} className='dashboard-menu'>
        <MenuList>
          <NavLink to='/admin/schools/all-schools'>
            <MenuItem>
              <ListItemIcon>
                <FormatListNumberedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Εμφάνιση σχολείων</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/admin/schools/add-school/'>
            <MenuItem>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Προσθήκη νέου σχολείου</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>
    </Box>
  );
}
