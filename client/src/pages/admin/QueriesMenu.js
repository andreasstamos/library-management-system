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
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CategoryIcon from '@mui/icons-material/Category';
import { NavLink } from 'react-router-dom';

export default function QueriesMenu() {
  return (
    <Paper sx={{ width: 320, maxWidth: '100%' }} id='dashboard-menu'>
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <ContentPasteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to="/admin/queries/3_1_1/">3.1.1</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <CategoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to="/admin/queries/3_1_2/">3.1.2</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText>3.1.3</ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}