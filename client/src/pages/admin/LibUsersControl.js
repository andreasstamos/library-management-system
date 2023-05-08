import React, { useEffect, useState } from 'react'
import './LibUsersControl.css'
import axios from 'axios';
import LibraryUserCard from './LibraryUserCard';


function LibUsersControl() {

    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchLibraryUsers() {
        const response = await axios.post('http://localhost:5000/admin-api/deactivated-library-users/', {}, {
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
    }, [])

  return (
    <div className='admin-subcontainer'>
        <h1 className='title-with-hr'>Library Users</h1>
        <div className='library-users-container'>
            {users && users.map((user) => {
                return <LibraryUserCard data={user} fetchUsers={fetchLibraryUsers}/>
            })}
            {!loading && users.length == 0 && <h3>No deactivated library user!</h3>}
        </div>
    </div>
  )
}

export default LibUsersControl