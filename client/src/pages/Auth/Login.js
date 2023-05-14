import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode"
function Login() {


  const {setUser, logoutUser, saveTokens, setAuthTokens} = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [succ, setSucc] = useState('');
  const navigate = useNavigate();



  async function handleLogin(e) {
    setSucc('');
    setErr('');
    e.preventDefault();
    const payload = {
      username: username,
      password: password,
    }
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/auth/login-student/',payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      e.target.reset();

      console.log(err);
      console.log(succ)
      logoutUser();
      saveTokens(response?.data?.access_token);
      setUser(jwt_decode(response?.data?.access_token))
      setAuthTokens(response?.data?.access_token);

      if (response.status === 200) {
        setSucc("Logged In!");
        navigate("/",{replace:true});
      } 
  } catch(err) {
    // console.log(err);
    setErr(err?.response?.data?.error);
  }

    
    



  }


  return (
    <>
    <h3 className='auth-title'>Login</h3>
    <form className='auth-inputs' onSubmit={(e) => handleLogin(e)}>
        <div className='auth-input'>
            <label for='username'>Username:</label>
            <input type='text' name='username' value={username} onChange={(e) => {setUsername(e.target.value)}} />
        </div>

        <div className='auth-input'>
            <label for='password'>Password:</label>
            <input type='password' name='password' value={password} onChange={(e) => {setPassword(e.target.value)}} />
        </div>


        {err && <p className='form-error message'>{err}</p>}
        {succ && <p className='form-success message'>{succ}</p>}

        <p className='auth-alternate'>Forgot your password? Click <Link to='/auth/forgot-password/' >here</Link>.</p>
        <button type='submit'>Login</button>
        <p className='auth-alternate'>Don't have an account? Please register <Link to='/auth/register/' >here</Link>.</p>

    </form>
    </>
  )
}

export default Login