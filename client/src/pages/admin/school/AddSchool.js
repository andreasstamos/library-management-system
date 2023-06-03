import React, { useState } from 'react'
import './AddSchool.css'
import { Button, Alert } from '@mui/material'
import axios from 'axios';


function AddSchool() {


    const [schoolName, setSchoolName] = useState('');
    const [schoolAddress, setSchoolAddress] = useState('');
    const [schoolEmail, setSchoolEmail] = useState('');
    const [schoolCity, setSchoolCity] = useState('');
    const [schoolPhone, setSchoolPhone] = useState('');
    const [schoolHeadmaster, setSchoolHeadmaster] = useState('');

    const [succ, setSucc] = useState(null);
    const [err, setErr] = useState(null);


    async function insertSchool(e) {
        setSucc(null);
        setErr(null);
        e.preventDefault();
        const payload = {
            name: schoolName,
            address: schoolAddress,
            email: schoolEmail,
            city: schoolCity,
            phone: schoolPhone,
            headmaster: schoolHeadmaster,
        }
        try{
            const response = await axios.post('http://localhost:5000/school/insert-school/', payload, {
                headers: {
                    'Access-Control-Expose-Headers' : '*',
                    'Access-Control-Allow-Origin': '*', 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
                }
            })
            console.log(response?.data);
            setSucc("Success");
            e.target.reset();
        } catch(err) {
            setErr("Something Went wrong :(")
        }
    }

  return (
    <div className='school-container'>
        <h2 className='title-with-hr admin-subcontainer-title'>Προσθήκη νέου σχολείου</h2>
        <form className='add-school-form' onSubmit={(e) => insertSchool(e)}>
            
            <div className='form-input'>
                <label for='school-name'>Όνομα/επωνυμία</label>
                <input value={schoolName} onChange={(e) => {setSchoolName(e.target.value)}} required type='text' name='school-name' />
            </div>

            <div className='form-input'>
                <label for='school-address'>Διεύθυνση</label>
                <input value={schoolAddress} onChange={(e) => {setSchoolAddress(e.target.value)}} required type='text' name='school-address' />
            </div>

            <div className='form-input'>
                <label for='school-email'>Email</label>
                <input value={schoolEmail} onChange={(e) => {setSchoolEmail(e.target.value)}} required type='email' name='school-email' />
            </div>

            <div className='form-input'>
                <label for='school-city'>Πόλη</label>
                <input value={schoolCity} onChange={(e) => {setSchoolCity(e.target.value)}} required type='text' name='school-city' />
            </div>

            <div className='form-input'>
                <label for='school-phone'>Τηλέφωνο</label>
                <input value={schoolPhone} onChange={(e) => {setSchoolPhone(e.target.value)}} required type='text' name='school-phone' />
            </div>

            <div className='form-input'>
                <label for='school-headmaster'>Διευθυντής</label>
                <input value={schoolHeadmaster} onChange={(e) => {setSchoolHeadmaster(e.target.value)}} required type='text' name='school-headmaster' />
            </div>

            {err && <Alert severity="error">{err}</Alert>}
            {succ && <Alert severity="success">{succ}</Alert>}

            <Button variant="contained" type='submit'>ΕΙΣΑΓΩΓΗ</Button>

        </form>
    </div>
  )
}

export default AddSchool
