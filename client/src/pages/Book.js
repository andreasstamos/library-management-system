import React, { useEffect, useState } from 'react'
import { Rating } from '@mui/material'
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import './Book.css'
import axios from 'axios';
import ReviewForm from '../Components/ReviewForm';

function Book() {

    let {bookISBN} = useParams();

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
                

            </div>
            
            
        </div>
        <ReviewForm bookISBN={bookISBN} />

    </div>
  )
}

export default Book