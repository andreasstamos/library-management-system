import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
function ForgotPassword() {


    const [email, setEmail] = useState('');
    const [err, setErr] = useState('')
    const [succ, setSucc] = useState('');




    async function handleEmailSend (e) {
        setErr("")
        setSucc("");
        // post email to the server here...
        e.preventDefault();

        const response = await axios.post('http://127.0.0.1:5000/auth/forgot-password/', { email: email }, {headers: {
            'Content-Type': 'application/json'
          }})
          console.log(response);
          e.target.reset();
          if (response.status === 200){
            setSucc("Password reset link sent to your email!");
            return;
          }

          setErr("Something went wrong :( ");
        }





  return (
    <>
        <h3 className='auth-title'>Ξεχάσατε τον κωδικό σας;</h3>
    <form className='auth-inputs' onSubmit={(e) => handleEmailSend(e)}>
        <div className='auth-input'>
            <label for='email'>Email:</label>
            <input type='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>

        {err && <p className='form-error message'>{err}</p>}
        {succ && <p className='form-success message'>{succ}</p>}

        <button type='submit'>Στείλτε μου το link</button>
        <p className='auth-alternate'>Θα σας στείλουμε ενα link προκειμένου να αλλάξετε τον κωδικό σας. Παρακαλούμε ελέγξτε τα σπαμ!</p>
    </form>

    </>
  )
}

export default ForgotPassword