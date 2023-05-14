import * as React from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import { NavLink } from 'react-router-dom';

export default function AdminMenu() {
  return (
    <Paper sx={{ width: 320, maxWidth: '100%' }} id='dashboard-menu'>
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/admin/schools/all-schools/'>Schools</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/admin/lib-editors/all-lib-editors/'>Library Editors</NavLink></ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}