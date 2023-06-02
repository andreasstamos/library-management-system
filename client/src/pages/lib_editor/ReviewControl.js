import React, { useEffect, useState } from 'react'
import './ReviewControl.css'
import ReviewCard from './ReviewCard'
import axios from 'axios';
import { CircularProgress, Switch } from '@mui/material';
import {FormControlLabel} from '@mui/material/';


function ReviewControl() {


    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);


    // do we want to search for active reviews...?
    const [activeReview, setActiveReviews] = useState(false);

    async function fetchReviews() {
        setLoading(true);
        setReviews(null);
        const payload = {
            active: activeReview,
        }
        const response = await axios.post('http://localhost:5000/lib-api/get-reviews/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        console.log(response?.data?.reviews);
        setReviews(response?.data?.reviews);
        setLoading(false);
    }


    useEffect( () => {
        fetchReviews();
    }, [activeReview])

  return (
    <div className='dashboard-component'>
        <div className='dashboard-inline'>
            <h2 className='component-title'>Διαχείριση αξιολόγησεων</h2>
            <div className='active-filter'>
                    <FormControlLabel
                    control={
                        <Switch name='lib-editors'
                        checked={activeReview}
                        onChange={() => {setActiveReviews(!activeReview)}}
                        inputProps={{ 'aria-label': 'controlled' }} />
            }
                        label={activeReview ? "Εγκεκριμένες" : "Αναμένουν έγκριση"}
            />
                </div>
        </div>
        <div className='component-details review-control'>
            {loading && <CircularProgress />}
            {!loading && reviews.map((review) => {
                return <ReviewCard
                key={review?.review_id}
                title={review?.title} 
                isbn={review?.isbn} 
                username={review?.username} 
                body={review?.body} 
                authors={review?.authors}
                reviewID={review?.review_id}
                fetchReviews={fetchReviews}
                active={review?.active}
                />
            })}
            {!loading && reviews.length == 0 && <h3>
                {activeReview ? "Δεν υπάρχουν εγκεκριμένες αξιολογήσεις." : "Δεν υπάρχουν αξιολογήσεις που να αναμένουν έγκριση."} 
            </h3>}
        

        </div>
    </div>
  )
}

export default ReviewControl
