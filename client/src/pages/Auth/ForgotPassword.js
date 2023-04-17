import React, { useState } from 'react'
import { Link } from 'react-router-dom'
function ForgotPassword() {


    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');

    async function handleEmailSend (e) {
        // post email to the server here...
        e.preventDefault();
        e.target.reset();        setEmailSent(true);
    }

    async function changePassword(e) {

    }


    if (emailSent)
    return (
        <>
        <h3 className='auth-title'>Verify its you!</h3>
        <form className='auth-inputs' onSubmit={(e) => changePassword(e)}>
        <div className='auth-input'>
            <label for='temp-code'>Temporary Code:</label>
            <input type='text' name='temp-code' />
        </div>

        <div className='auth-input'>
            <label for='password'>New Password:</label>
            <input type='password' name='password' />
        </div>

        <div className='auth-input'>
            <label for='password-conf'>Confirm new Password:</label>
            <input type='password' name='password-conf' />
        </div>


        
        <button type='submit'>Send Link</button>
        <p className='auth-alternate'>We will send you a link to change your password. Please check your spam!</p>

    </form>

    </>
    )


  if (!emailSent)  
  return (
    <>
        <h3 className='auth-title'>Forgot your password?</h3>
    <form className='auth-inputs' onSubmit={(e) => handleEmailSend(e)}>
        <div className='auth-input'>
            <label for='email'>Email:</label>
            <input type='email' name='email' />
        </div>

        
        <button type='submit'>Send Link</button>
        <p className='auth-alternate'>We will send you a link to change your password. Please check your spam!</p>

    </form>

    </>
  )
}

export default ForgotPassword