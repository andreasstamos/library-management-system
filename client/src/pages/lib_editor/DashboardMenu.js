import * as React from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Cloud from '@mui/icons-material/Cloud';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Link, NavLink } from 'react-router-dom';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import './DashboardMenu.css'

export default function DashboardMenu() {
  return (
    <Paper sx={{ width: 250, maxWidth: '100%' }} id='dashboard-menu'>
      <MenuList>
        <MenuItem>
          <ListItemIcon>
            <CheckCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/activate-users/'>Activate Users</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <NotInterestedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/deactivate-users/'>Deactivate Users</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <RateReviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/activate-reviews/'>Reviews</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <BookmarkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/bookings/'>Bookings</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/borrows/'>Borrows</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <WatchLaterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/delayed-returns/'>Delayed Returns</NavLink></ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Cloud fontSize="small" />
          </ListItemIcon>
          <ListItemText>Web Clipboard</ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}