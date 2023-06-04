import * as React from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormatListNumberedRtlIcon from '@mui/icons-material/FormatListNumberedRtl';
import CategoryIcon from '@mui/icons-material/Category';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import StarIcon from '@mui/icons-material/Star';
import NumbersIcon from '@mui/icons-material/Numbers';
import Filter5Icon from '@mui/icons-material/Filter5';
import { NavLink } from 'react-router-dom';

export default function QueriesMenu() {
  return (
    <Box sx={{display: 'flex', columnGap: '1rem'}}>
      <Paper className="dashboard-menu">
        <MenuList>
          <NavLink to="/admin/queries/3_1_1/">
            <MenuItem>
              <ListItemIcon>
                <FormatListNumberedRtlIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Συνολικός αριθμός δανεισμών ανά σχολείο</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to="/admin/queries/3_1_2/">
            <MenuItem>
              <ListItemIcon>
                <CategoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Στατιστικά ανά κατηγορία</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to="/admin/queries/3_1_3/">
            <MenuItem>
              <ListItemIcon>
                <RecentActorsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Νέοι εκπαιδευτικοί με τους περισσότερους δανεισμούς</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>
      <Paper className="dashboard-menu">
        <MenuList>
          <NavLink to="/admin/queries/3_1_4/">
            <MenuItem>
              <ListItemIcon>
                <SentimentVeryDissatisfiedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Συγγραφείς των οποίων κανένα βιβλίο δεν έχει τύχει δανεισμού</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to="/admin/queries/3_1_5/">
            <MenuItem>
              <ListItemIcon>
                <NumbersIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Χειριστές βιβλίων ανά πλήθος δανεισμών (>20)</ListItemText>
            </MenuItem>
          </NavLink>
          <NavLink to="/admin/queries/3_1_6/">
            <MenuItem>
              <ListItemIcon>
                <StarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>TOP-3 ζεύγη κατηγοριών σε δανεισμούς</ListItemText>
            </MenuItem>
          </NavLink>
           <NavLink to="/admin/queries/3_1_7/">
            <MenuItem>
              <ListItemIcon>
                <Filter5Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Συγγραφείς με τουλάχιστον 5 βιβλία λιγότερα από τον συγγραφέα με τα περισσότερα βιβλία</ListItemText>
            </MenuItem>
          </NavLink>
        </MenuList>
      </Paper>
   </Box>
  );
}
