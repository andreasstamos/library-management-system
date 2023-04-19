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
            setErr('Passwords should be matching!!!');
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
            setSucc("Password successfully changed!")
            return;
        }

        setErr("Something went terribly wrong");





    }


  return (
    <>
        <h3 className='auth-title'>Verify its you!</h3>
        <form className='auth-inputs' onSubmit={(e) => resetPassword(e)}>

        <div className='auth-input'>
            <label for='password'>New Password:</label>
            <input type='password' name='password' value={password} onChange={(e) => {setPassword(e.target.value)}}/>
        </div>

        <div className='auth-input'>
            <label for='password-conf'>Confirm new Password:</label>
            <input type='password' name='password-conf' value={passwordConfirm} onChange={(e) => {setPasswordConfirm(e.target.value)}}/>
        </div>


        {err && <p className='form-error message'>{err}</p>}
        {succ && <p className='form-success message'>{succ}</p>}

        <button type='submit'>Change Password</button>
        {/* <p className='auth-alternate'>We will send you a link to change your password. Please check your spam!</p> */}

    </form>

    </>
  )
}

export default ResetPassword