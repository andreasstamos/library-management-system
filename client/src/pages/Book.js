import React, { useEffect, useState } from 'react'
import { Rating } from '@mui/material'
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import './Book.css'
import axios from 'axios';

function Book() {

    let {bookISBN} = useParams();
    // this is the rate that the user submits (if he does so...)
    const [rate, setRate] = useState(null);
    const [userHasVotedBefore, SetUserHasVotedBefore] = useState(false);


    async function handleReview() {
        const payload = {
            'rate': rate,
            'isbn': bookISBN,
        }
        const response = await axios.post('http://localhost:5000/student-api/review/', payload, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
        }})
        if (response.status === 200) SetUserHasVotedBefore(true);
    }

    useEffect( () => {
        // if this is the first time loading and user has not submitted anything...
        if (!rate) return;

        handleReview();
    }, [rate])

  return (
    <div className='book-page-container'>
        <div className='book-container'>
        <img className='book-image'
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/12_Rules_for_Life_Front_Cover_%282018_first_edition%29.jpg/640px-12_Rules_for_Life_Front_Cover_%282018_first_edition%29.jpg" />
            <div className='book-details'>
                <h1 className='book-title title-with-hr'>12 Rules for Life</h1>
                <h3 className='book-author'>Jordan Peterson</h3>
                
                <div className='book-detail'>
                    <h4>Rating</h4>
                    <Rating name="read-only" value={5} readOnly />
                </div>

                <div className='book-detail'>
                    <h4>Pages</h4>
                    <p>255</p>
                </div>


                <div className='book-detail'>
                    <h4>Publisher</h4>
                    <p>Σαββάλας</p>
                </div>

                <div className='book-detail'>
                    <h4>Διαθεσιμότητα</h4>
                    <p className='affirmative'>Άμεσα Διαθέσιμο</p>
                </div>

                <Button variant="contained">Κρατηση</Button>
                
                <div className='book-detail'>
                    <h4>{!userHasVotedBefore ? 'Rate this book' : 'Your rating'}</h4>
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
                </div>

            </div>
            
            
        </div>

    </div>
  )
}

export default Book