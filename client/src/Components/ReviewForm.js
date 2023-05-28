import React, {useEffect, useState} from 'react'
import { Box, Rating, TextField, Button, Typography } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import axios from 'axios';
import './ReviewForm.css'

function ReviewForm({bookISBN}) {
    // this is the rate that the user submits (if he does so...)
    const [rate, setRate] = useState(null);
    const [reviewBody, setReviewBody] = useState('');
    const [userHasVotedBefore, setUserHasVotedBefore] = useState(true);
    const [err, setErr] = useState('');


    async function checkReview() {
        const payload = {
            isbn: bookISBN
        }
        const response = await axios.post('http://localhost:5000/student-api/my-review/', payload, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
        }})
        console.log(response);
        setUserHasVotedBefore(response?.data?.my_review?.exists);
        if (response?.data?.my_review?.exists){ setReviewBody(response?.data?.my_review?.body); setRate(parseInt(response?.data?.my_review?.rate))}
        
    }
    useEffect( () => {
        checkReview();
    }, [])

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
            <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '0.5rem'}}>
            <Typography variant="body1" sx={{color: 'error.main'}}>{err && err}</Typography>

                <Box sx={{display: 'flex'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <Typography variant="body1">{!userHasVotedBefore ? 'Αξιολόγησε το βιβλίο' : 'Η αξιολόγησή μου'}</Typography>
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
                    </Box>
                    <Button sx={{ml: 'auto'}} variant="contained" type='submit' endIcon={<RateReviewIcon />} disabled={userHasVotedBefore}>
                        ΑΞΙΟΛΟΓΗΣΗ
                    </Button>
                </Box>
                <TextField
                    id="outlined-multiline-static"
                    className='review-form-body'
                    label="Κείμενο αξιολόγησης"
                    multiline
                    disabled={userHasVotedBefore}
                    placeholder='Εδώ μπορείς να γράψεις την αξιολόγησή σου.'
                    rows={4}
                    required
                    value={reviewBody}
                    onChange={(e) => {setReviewBody(e.target.value)}}
                    InputProps={{
                        readOnly: userHasVotedBefore,
                    }}
                />
            </Box>
        </form>
    )
}

export default ReviewForm
