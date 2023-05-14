import React, { useEffect, useState } from 'react'
import './LibUsersControl.css'
import axios from 'axios';
import LibraryUserCard from './LibraryUserCard';
import { CircularProgress, FormControlLabel, FormGroup, Switch } from '@mui/material';

function LibUsersControl() {

    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // used by Switch to fecth active or non-active library editors.
    const [activeUsers, setActiveUsers] = useState(true);


    async function fetchLibraryUsers() {
        setLoading(true)
        setUsers(null);
        const payload = {
            active: activeUsers
        }
        const response = await axios.post(`http://localhost:5000/admin-api/get-library-editors/`, payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        setUsers(response?.data?.users);
        setLoading(false);
    }


    useEffect( () => {
        fetchLibraryUsers();
    }, [activeUsers])

  return (
    <div className='admin-subcontainer'>
        <div className='dashboard-inline'>
            <h1 className='title-with-hr'>Library Editors</h1>
            <div className='active-filter'>
                <FormControlLabel
                control={
                    <Switch name='lib-editors'
                    checked={activeUsers}
                    onChange={() => {setActiveUsers(!activeUsers)}}
                    inputProps={{ 'aria-label': 'controlled' }} />
          }
          label="Active Users"
        />
                {/* <Switch
                    name='lib-editors'
                    checked={activeUsers}
                    onChange={() => {setActiveUsers(!activeUsers)}}
                    inputProps={{ 'aria-label': 'controlled' }}
                /> */}
            </div>
        </div>


        <div className='library-users-container'>
            {loading && <CircularProgress/>}
            {users && users.map((user) => {
                return <LibraryUserCard data={user} fetchUsers={fetchLibraryUsers}/>
            })}
            {!loading && users.length == 0 && <h3>Δεν βρέθηκαν χειριστές βιβλιοθήκης με αυτά τα κριτήρια.</h3>}
        </div>
    </div>
  )
}

export default LibUsersControl