import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios';
import Dropdown from '../../Components/Dropdown';
import UserDropdown from '../../Components/UserDropdown'
function Register() {

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolID, setSchoolID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState('');
  const [succ, setSucc] = useState('');
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schools, setSchools] = useState(null);
  const [userSelected, setUserSelected] = useState('');
  const [dob, setDob] = useState('');

  function checkMatchingPassword() {
    if (password !== confirmPassword) return false;
    return true;
  }

  // NEEDS MORE VALIDATION!!!!!

  async function handleRegister(e) {
    setErr('');
    setSucc('');

    e.preventDefault();
    if (!checkMatchingPassword()) {
      setErr("Passwords must be matching!!!");
      return;
    }

    console.log(username);
    console.log(firstName);
    console.log(lastName);
    console.log(email);
    console.log(password);
    console.log(confirmPassword);
    console.log(schoolID);

    const payload = {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      confirm_password: confirmPassword,
      school_id: parseInt(schoolID),
      user_type: userSelected,
      dob:dob,
    }
    const response = await axios.post('http://127.0.0.1:5000/auth/register-student/', payload, {headers: {
      'Content-Type': 'application/json'
    }})
    
    e.target.reset();

    if (response.status === 201) {
      setSucc("All Done! Your account will have to be activated.")
      return;
    }

    setErr("Something went horribly wrong :(");
  }


  async function fetchSchools() {
    const payload = {
      fetch_fields:['name', 'school_id']
    }
    const response = await axios.post('http://127.0.0.1:5000/school/get-schools/', payload, {headers: {
      'Content-Type': 'application/json'
    }});
    console.log(response);
    setLoadingSchools(false);
    setSchools(response?.data?.schools);
  }

  useEffect( () => {
    fetchSchools();
  }, [])


  return (

    
    <>
    <h3 className='auth-title'>Εγγραφή</h3>


    <form className='auth-inputs' onSubmit={(e) => handleRegister(e)}>
        <div className='auth-input'>
            <label for='username'>Username:</label>
            <input type='text' name='username' required value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className='auth-input'>
            <label for='first_name'>Όνομα:</label>
            <input type='text' name='first_name' required value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
        </div>
        <div className='auth-input'>
            <label for='last_name'>Επίθετο:</label>
            <input type='text' name='last_name' required value={lastName} onChange={(e) => setLastName(e.target.value)}/>
        </div>

        {!loadingSchools && 
              <Dropdown schools={schools} schoolSelected={schoolID} setSchoolSelected={setSchoolID} />
        }


        <div className='auth-input'>
            <label for='email'>Email:</label>
            <input type='email' name='email' required value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>

        <div className='auth-input'>
          <label htmlFor="birthdate">Ημερομηνία Γέννησης:</label>
          <input type="date" id="birthdate" required name="birthdate" value={dob} onChange={(e) => {setDob(e.target.value)}} />
      </div>

        <UserDropdown setUserSelected={setUserSelected} userSelected={userSelected}/>

        <div className='auth-input'>
            <label for='password'>Κωδικός:</label>
            <input type='password' name='password' required value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div className='auth-input'>
            <label for='password-conf'>Επιβεβαίωση Κωδικού:</label>
            <input type='password' name='password-conf' required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
        </div>
        {err && <p className='form-error message'>{err}</p>}
        {succ && <p className='form-success message'>{succ}</p>}

        <button type='submit'>Εγγραφή</button>
        <p className='auth-alternate'>Έχετε ήδη λογαριασμό? Παρακαλώ συνδεθείτε <Link to='/auth/login/' >εδώ</Link>.</p>
    </form>
    </>
  )
}

export default Register