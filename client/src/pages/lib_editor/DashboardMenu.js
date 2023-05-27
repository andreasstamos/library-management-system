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
import GradeIcon from '@mui/icons-material/Grade';
import './DashboardMenu.css'

export default function DashboardMenu() {
  return (
    <Paper sx={{ width: 300, maxWidth: '100%' }} className='dashboard-menu'>
      <MenuList>

        <MenuItem>
          <ListItemIcon>
            <NotInterestedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/users-control/'>Έλεγχος Χρηστών</NavLink></ListItemText>
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
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <WatchLaterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/delayed-returns/'>Αργοπορημένοι Δανεισμοί</NavLink></ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <GradeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText><NavLink to='/lib-editor/average-ratings/'>Μέσος Όρος Αξιολογήσεων</NavLink></ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
}
