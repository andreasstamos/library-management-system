import * as React from 'react';
import Box from '@mui/material/Box';
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
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Cloud from '@mui/icons-material/Cloud';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Link, NavLink } from 'react-router-dom';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import GradeIcon from '@mui/icons-material/Grade';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AbcIcon from '@mui/icons-material/Abc';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import './DashboardMenu.css'

export default function DashboardMenu() {
  return (
    <Box sx={{display: 'flex', columnGap: '1rem'}}>
      <Paper className='dashboard-menu'>
        <MenuList>
          <NavLink to='/lib-editor/lend-return/'>
            <MenuItem>
              <ListItemIcon>
                <CreditScoreIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Δανεισμός/Επιστροφή</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/borrows/'>
            <MenuItem>
              <ListItemIcon>
                <LibraryBooksIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση δανεισμών</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/delayed-returns/'>
            <MenuItem>
              <ListItemIcon>
                <WatchLaterIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Καθυστερημένες επιστροφές</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/bookings/'>
            <MenuItem>
              <ListItemIcon>
                <BookmarkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση κρατήσεων</ListItemText>
            </MenuItem>
          </NavLink> 
        </MenuList>
      </Paper>

      <Paper className='dashboard-menu'>
        <MenuList>
          <NavLink to='/lib-editor/book-control/'>
            <MenuItem>
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση βιβλίων (προσθήκη/επεξεργασία)</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/reviews/'>
            <MenuItem>
              <ListItemIcon>
                <RateReviewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση αξιολογήσεων</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/category-control/'>
            <MenuItem>
              <ListItemIcon>
                <CategoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση κατηγοριών</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/keywords-control/'>
            <MenuItem>
              <ListItemIcon>
                <AbcIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση Λέξεων Κλειδιών</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>

      <Paper className='dashboard-menu'>
        <MenuList>
          <NavLink to='/lib-editor/users-control/'>
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση χρηστών</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/authors-control/'>
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση συγγραφέων</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/publisher-control/'>
            <MenuItem>
              <ListItemIcon>
                <CollectionsBookmarkIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Διαχείριση Εκδοτικών Οίκων</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to='/lib-editor/average-ratings/'>
            <MenuItem>
              <ListItemIcon>
                <QueryStatsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Μέσος όρος αξιολογήσεων ανά δανειζόμενο/κατηγορία</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>

    </Box>
  );
}
