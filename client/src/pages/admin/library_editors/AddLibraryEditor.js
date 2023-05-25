import React, { useEffect, useState } from 'react'
import './AddLibraryEditor.css'
import { Alert } from '@mui/material'
import Button from '@mui/material/Button'
import Dropdown from '../../../Components/Dropdown'
import axios from 'axios'
function AddLibraryEditor() {


        const [loadingSchools, setLoadingSchools] = useState(true);
        const [schools, setSchools] = useState(null);


        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [firstName, setFirstName] = useState('');
        const [lastName, setLastName] = useState('');
        const [email, setEmail] = useState('');
        const [schoolID, setSchoolID] = useState('');
        const [dob, setDob] = useState('');
        const [err, setErr] = useState('');
        const [succ, setSucc] = useState('');




        async function insertLibraryEditor(e) { 
            e.preventDefault();
            setSucc('');
            setErr('');
            if (password !== confirmPassword) {
                setErr('Passwords should be matching.');
                return;
            }

            const payload = {
                username: username,
                first_name: firstName,
                last_name: lastName,
                email: email,
                school_id: parseInt(schoolID),
                dob: dob,
                password: password,
                confirm_password: confirmPassword,
            }
            try {
                const response = await axios.post('http://127.0.0.1:5000/admin-api/insert-library-user/', payload, {
                    headers: {
                        'Access-Control-Expose-Headers' : '*',
                        'Access-Control-Allow-Origin': '*', 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
                }
                })
                setSucc('Library editor created.');

            } catch(err) {
                setErr("Something went wrong. Please try again later.");

            }
            
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
    <div className='school-container'>
        <h2 className='title-with-hr admin-subcontainer-title'>Προσθήκη νέου χειριστή βιβλιοθήκης</h2>
        <form className='add-school-form insert-library-editor-form' onSubmit={(e) => insertLibraryEditor(e) }>
            
            <div className='form-input'>
                <label for='username'>Όνομα χρήστη</label>
                <input required type='text' name='username' value={username} onChange={(e) => setUsername(e.target.value)}/>
            </div>

            <div className='form-input'>
                <label for='first-name'>Όνομα</label>
                <input  required type='text' name='first-name' value={firstName} onChange={(e) =>setFirstName(e.target.value)}/>
            </div>

            <div className='form-input'>
                <label for='last-name'>Επώνυμο</label>
                <input required type='text' name='last-name' value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>

            <div className='form-input'>
                <label for='email'>Email</label>
                <input required type='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>


            {!loadingSchools && 
              <Dropdown schools={schools} schoolSelected={schoolID} setSchoolSelected={setSchoolID} />
            }

            <div className='form-input'>
                <label for='dob'>Ημερομηνία γέννησης</label>
                <input required type='date' name='dob' value={dob} onChange={(e) => setDob(e.target.value)}/>
            </div>

            <div className='form-input'>
                <label for='password'>Κωδικός πρόσβασης</label>
                <input required type='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <div className='form-input'>
                <label for='confirmPassword'>Επιβεβαίωση κωδικού πρόσβασης</label>
                <input required type='password' name='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
            </div>

            {err && <Alert severity="error">{err}</Alert>}
            {succ && <Alert severity="success">{succ}</Alert>}

            <Button variant="contained" type='submit'>ΕΙΣΑΓΩΓΗ</Button>

        </form>
    </div>
  )
}

export default AddLibraryEditor
