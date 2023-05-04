import React, { useEffect, useState } from 'react'
import './ReviewActivate.css'
import ReviewCard from './ReviewCard'
import axios from 'axios';



function ReviewActivate() {


    const [reviews, setReviews] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchReviews() {
        const response = await axios.post('http://localhost:5000/lib-api/get-reviews/', {}, {
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
    }, [])

  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>Reviews</h2>
        <div className='component-details review-control'>
            {!loading && reviews.map((review) => {
                return <ReviewCard 
                title={review?.title} 
                isbn={review?.isbn} 
                username={review?.username} 
                body={review?.body} 
                authors={review?.authors}
                reviewID={review?.review_id}
                fetchReviews={fetchReviews}
                />
            })}
           {!loading && reviews.length == 0 && <h3>No reviews</h3>}
        

        </div>
    </div>
  )
}

export default ReviewActivate