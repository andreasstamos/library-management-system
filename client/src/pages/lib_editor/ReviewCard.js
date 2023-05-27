import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './ReviewCard.css'
import axios from 'axios';


export default function ReviewCard({reviewID, title, authors, username, isbn, body, fetchReviews, active}) {

    function formatISBN(isbn) {
        let formattedISBN = '';
        
        // Remove any non-digit characters from the input string
        isbn = isbn.replace(/\D/g, '');
        
        // Insert hyphens at the appropriate positions
        if (isbn.length === 10) {
          formattedISBN = `${isbn.slice(0, 1)}-${isbn.slice(1, 4)}-${isbn.slice(4, 9)}-${isbn.slice(9)}`;
        } else if (isbn.length === 13) {
          formattedISBN = `${isbn.slice(0, 3)}-${isbn.slice(3, 5)}-${isbn.slice(5, 10)}-${isbn.slice(10, 12)}-${isbn.slice(12)}`;
        }
        
        return formattedISBN;
      }


      async function deleteReview() {
        const payload = {
          review_id: reviewID,
        }
        const response = await axios.post('http://localhost:5000/lib-api/delete-review/', payload, {
          headers: {
            'Access-Control-Expose-Headers' : '*',
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
         }
        })
        console.log(response);
        fetchReviews();
      }

      async function activateReview() {
            const payload = {
                review_id: reviewID,
                active: !active,
            }
            const response = await axios.post('http://localhost:5000/lib-api/change-review-status/', payload, {headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             } })
             console.log(response);
             fetchReviews();
      }


  return (
    <Card sx={{ maxWidth: 350 }} id='review-card'>
      <CardContent>
      <Typography variant="h5" component="div">
      {title}
        </Typography>
        <div className='inline'>
            <Typography variant="body2" className='authors'>
                {authors.join(', ')}
            </Typography>
            <Typography variant="body2" className='isbn'>
                {formatISBN(isbn)}
            </Typography>
        </div>
        <Typography variant="body2" className='username'>
            Username: {username}
        </Typography>
        <Typography variant="body2" className='body'>
            {body}
        </Typography>
        
        
      </CardContent>
      <CardActions>
        {active && <Button size="small" onClick={activateReview}>ΑΠΕΝΕΡΓΟΠΟΙΗΣΗ</Button>}
        {!active && <Button size="small" onClick={activateReview}>ΕΝΕΡΓΟΠΟΙΗΣΗ</Button>}
        <Button color="error" onClick={deleteReview}>ΔΙΑΓΡΑΦΗ</Button>
      </CardActions>
    </Card>
  );
}
