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
            <h2 className='title-with-hr'>Χειριστές βιβλιοθηκών</h2>
            <div className='active-filter'>
                <FormControlLabel
                    control={
                    <Switch name='lib-editors'
                        checked={activeUsers}
                        onChange={() => {setActiveUsers(!activeUsers)}}
                        inputProps={{ 'aria-label': 'controlled' }} />
                    }
                    label={activeUsers ? "Προβολή ενεργών χρηστών": "Προβολή ανενεργών χρηστών"}
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
            {!loading && users.length == 0 && <h3>Δεν βρέθηκαν {activeUsers ? "ενεργοί" : "ανενεργοί"} χειριστές βιβλιοθήκης.</h3>}
        </div>
    </div>
  )
}

export default LibUsersControl
