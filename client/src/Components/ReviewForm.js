import React, {useState} from 'react'
import { Rating, TextField, Button } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import axios from 'axios';
import './ReviewForm.css'

function ReviewForm({bookISBN}) {
        // this is the rate that the user submits (if he does so...)
        const [rate, setRate] = useState(null);
        const [reviewBody, setReviewBody] = useState('');
        const [userHasVotedBefore, setUserHasVotedBefore] = useState(false);
        const [err, setErr] = useState('');


        async function handleReview(e) {
            e.preventDefault();
            setErr('');
            if (!rate){
                setErr('You must select hwo many stars you would like to give this book.')
                return;
            } 

            const payload = {
                'rate': rate,
                'isbn': bookISBN,
                'body': reviewBody,
            }
            try {
                const response = await axios.post('http://localhost:5000/student-api/review/', payload, {headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
                }})
                if (response.status === 200) setUserHasVotedBefore(true);
            }
            catch(err) {
                // setErr(err?.response?.data?.error);
                setErr("I think you have reviewed this book before...")
            }
            
        }

        


  return (
    <form className='review-form' onSubmit={(e) => handleReview(e)}>            
    <h3>{!userHasVotedBefore ? 'Rate this book' : 'Your rating'}</h3>
    <p className='form-error'>{err && err}</p>
                    <div className='form-inline'>
                        <Rating
                            name="simple-controlled"
                            value={rate}
                            onChange={(event, newValue) => {
                                setRate(newValue);
                            }}
                            // if user has voted before don't let him rate again.
                            // later on we should check if the user has voted in the backend
                            // if we reload user can vote again.

                            readOnly={userHasVotedBefore}
                        />
                        <Button variant="contained" type='submit' endIcon={<RateReviewIcon />}>
                        Review
                        </Button>
                    </div>
                    <TextField
                        id="outlined-multiline-static"
                        className='review-form-body'
                        label="Review"
                        multiline
                        placeholder='Give your review here...'
                        rows={4}
                        required
                        value={reviewBody}
                        onChange={(e) => {setReviewBody(e.target.value)}}
                        InputProps={{
                            readOnly: userHasVotedBefore,
                          }}
                    />
    </form>  
  )
}

export default ReviewForm