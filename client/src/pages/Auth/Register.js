import React from 'react'
import { Link } from 'react-router-dom'
function Register() {
  return (
    <>
    <h3 className='auth-title'>Register</h3>

    <form className='auth-inputs'>
        <div className='auth-input'>
            <label for='username'>Username:</label>
            <input type='text' name='username' />
        </div>

        <div className='auth-input'>
            <label for='password'>Password:</label>
            <input type='password' name='password' />
        </div>

        

        <button type='submit'>Register</button>
        <p className='auth-alternate'>Already have an account? Please login <Link to='/auth/login/' >here</Link>.</p>
    </form>
    </>
  )
}

export default Register