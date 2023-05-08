import React, { useState } from 'react'
import './AddSchool.css'
import { Button } from '@mui/material'
import axios from 'axios';


function AddSchool() {


    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [schoolEmail, setSchoolEmail] = useState('');
    const [schoolCity, setSchoolCity] = useState('');
    const [schoolPhone, setSchoolPhone] = useState('');


    async function insertSchool(e) {
        e.preventDefault();
        console.log(schoolName);
        const payload = {
            name: schoolName,
            address: schoolAddress,
            email: schoolEmail,
            city: schoolCity,
            phone: schoolPhone,
        }
        const response = await axios.post('http://localhost:5000/school/insert-school/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        console.log(response?.data);
    }

  return (
    <div className='school-container'>
        <h1 className='title-with-hr admin-subcontainer-title'>Add School</h1>
        <form className='add-school-form' onSubmit={(e) => insertSchool(e)}>
            
            <div className='form-input'>
                <label for='school-name'>Name:</label>
                <input value={schoolName} onChange={(e) => {setSchoolName(e.target.value)}} required type='text' name='school-name' />
            </div>

            <div className='form-input'>
                <label for='school-address'>Address:</label>
                <input value={schoolAddress} onChange={(e) => {setSchoolAddress(e.target.value)}} required type='text' name='school-address' />
            </div>

            <div className='form-input'>
                <label for='school-email'>Email:</label>
                <input value={schoolEmail} onChange={(e) => {setSchoolEmail(e.target.value)}} required type='email' name='school-email' />
            </div>

            <div className='form-input'>
                <label for='school-city'>City:</label>
                <input value={schoolCity} onChange={(e) => {setSchoolCity(e.target.value)}} required type='text' name='school-city' />
            </div>

            <div className='form-input'>
                <label for='school-phone'>Phone:</label>
                <input value={schoolPhone} onChange={(e) => {setSchoolPhone(e.target.value)}} required type='text' name='school-phone' />
            </div>

            <Button variant="contained" type='submit'>Insert School</Button>

        </form>
    </div>
  )
}

export default AddSchool