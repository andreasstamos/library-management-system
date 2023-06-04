import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios';

function ResetPassword() {

    const { token } = useParams();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [err, setErr] = useState('');
    const [succ, setSucc] = useState('');



    async function resetPassword(e) {
        setSucc('');
        setErr('');
        e.preventDefault();
        if (password != passwordConfirm) {
            setErr('Οι κωδικοί πρέπει να είναι ίδιοι!!!');
            return;
        }

        const payload = {
            token:token,
            password:password,
            confirm_password: passwordConfirm,
        }

        const response = await axios.post('http://127.0.0.1:5000/auth/reset-password/', payload, {headers:{
            'Content-Type': 'application/json',
        }})
        
        e.target.reset();

        if (response.status == 200) {
            setSucc("Ο κωδικός σας άλλαξε επιτυχώς!")
            return;
        }

        setErr("Κάτι πήγε λάθος");





    }


  return (
    <>
        <h3 className='auth-title'>Αλλαγή Κωδικού</h3>
        <form className='auth-inputs' onSubmit={(e) => resetPassword(e)}>

        <div className='auth-input'>
            <label for='password'>Νέος Κωδικός:</label>
            <input type='password' name='password' value={password} onChange={(e) => {setPassword(e.target.value)}}/>
        </div>

        <div className='auth-input'>
            <label for='password-conf'>Επιβεβαίωση νέου κωδικού:</label>
            <input type='password' name='password-conf' value={passwordConfirm} onChange={(e) => {setPasswordConfirm(e.target.value)}}/>
        </div>


        {err && <p className='form-error message'>{err}</p>}
        {succ && <p className='form-success message'>{succ}</p>}

        <button type='submit'>Αλλαγή Κωδικού</button>
        {/* <p className='auth-alternate'>We will send you a link to change your password. Please check your spam!</p> */}

    </form>

    </>
  )
}

export default ResetPassword