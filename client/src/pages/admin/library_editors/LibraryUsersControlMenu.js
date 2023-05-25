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
import { NavLink } from 'react-router-dom';

export default function LibraryUsersControlDashboard() {
  return (
    <Box sx={{display: 'flex', columnGap: '1rem'}}>
      <Paper sx={{mr: 'auto'}} className='dashboard-menu'>
        <MenuList>
          <NavLink to='/admin/lib-editors/all-lib-editors/'>
            <MenuItem>
              <ListItemIcon>
                <FormatListNumberedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Εμφάνιση χειριστών βιβλιοθηκών</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/admin/lib-editors/add-lib-editor/'>
            <MenuItem>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Προσθήκη νέου χειριστή βιβλιοθήκης</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>
    </Box>
  );
}
