import React, { useEffect, useState } from 'react'
import './AllSchools.css'
import SchoolCard from './SchoolCard'
import axios from 'axios'
import { CircularProgress } from '@mui/material';

function AllSchools() {

    const [schools, setSchools] = useState(null);
    const [loading, setLoading] = useState(true);


    async function fetchSchools() {
        const payload = {
            fetch_fields: ['school_id', 'name', 'address', 'city', 'phone','email']
        }
        const response = await axios.post('http://localhost:5000/school/get-schools/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        setSchools(response?.data?.schools);
        setLoading(false);

    }


    useEffect( () => {
        fetchSchools();
    }, [])

  return (
<>        <h1 className='title-with-hr'>Schools</h1>

<div className='all-schools-container'>
        {loading && <CircularProgress />}
       {schools && schools.map((school, index) => {
        return <SchoolCard 
            key={index}
            name={school?.name} 
            schoolID={school?.school_id} 
            address={school?.address} 
            city={school?.city} 
            email={school?.email}
            fetchSchools={fetchSchools}
        />
       })}

    </div>
    </>
  )
}

export default AllSchools