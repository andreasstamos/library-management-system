import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Rating } from '@mui/material';
import './BookCard.css'
import { Link } from 'react-router-dom';

export default function BookCard({title, imageURI, summary, isbn, rating}) {


  return (
    <Card sx={{display: 'flex', flexDirection: 'column', maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 500 }}
        image={imageURI}
        title={title}
        alt={title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className='book-card-summary'>
          {summary}
        </Typography>
        <Rating name="read-only" value={rating} readOnly className='book-card-rating'/>

      </CardContent>
      <CardActions sx={{mt: 'auto'}}>
        <Button size="small" to={`/book/${isbn}`} component={Link}>ΔΕΣ ΠΕΡΙΣΣΟΤΕΡΑ</Button>
      </CardActions>
    </Card>
  );
}
