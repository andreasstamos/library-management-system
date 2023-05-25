import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import SchoolIcon from '@mui/icons-material/School';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import Cloud from '@mui/icons-material/Cloud';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { NavLink } from 'react-router-dom';

export default function AdminMenu() {
  return (
    <Box sx={{display: 'flex', columnGap: '1rem'}}>
      <Paper sx={{mr: 'auto'}} className='dashboard-menu'>
        <MenuList>
          <NavLink to='/admin/schools/'>
            <MenuItem>
              <ListItemIcon>
                <SchoolIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση σχολείων</ListItemText>
            </MenuItem>
          </NavLink>

          <NavLink to='/admin/lib-editors/'>
            <MenuItem>
              <ListItemIcon>
                <ManageAccountsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση χειριστών βιβλιοθηκών</ListItemText>
            </MenuItem>
          </NavLink>

          <NavLink to='/admin/queries/'>
            <MenuItem>
              <ListItemIcon>
                <QueryStatsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Στατιστικά</ListItemText>
            </MenuItem>
          </NavLink>

        </MenuList>
      </Paper>
    </Box>
  );
}
