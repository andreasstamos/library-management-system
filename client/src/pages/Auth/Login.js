import React from 'react'
import { Link } from 'react-router-dom'
function Login() {
  return (
    <>
    <h3 className='auth-title'>Login</h3>
    <form className='auth-inputs'>
        <div className='auth-input'>
            <label for='username'>Username:</label>
            <input type='text' name='username' />
        </div>

        <div className='auth-input'>
            <label for='password'>Password:</label>
            <input type='password' name='password' />
        </div>
        <p className='auth-alternate'>Forgot your password? Click <Link to='/auth/register/' >here</Link>.</p>
        <button type='submit'>Login</button>
        <p className='auth-alternate'>Don't have an account? Please register <Link to='/auth/register/' >here</Link>.</p>

    </form>
    </>
  )
}

export default Login