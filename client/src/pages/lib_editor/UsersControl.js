import React, { useEffect, useState } from 'react'
import './UsersControl.css'
import axios from 'axios';
import UserCard from './UserCard';
import { Switch } from '@mui/material';

function UsersControl() {


    const [data, setData] = useState();
    const [activeUsers, setActiveUsers] = useState(false);


    async function getUsers() {
        setData(null);
        const payload = {
            active:activeUsers
        }
        const response = await axios.post('http://localhost:5000/lib-api/get-users/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
             }
        })
        setData(response?.data?.users)
        console.log(response);
    }

    useEffect( () => {
            getUsers();
    }, [activeUsers])


  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>Users</h2>
        <div className='component-details users-control'>
        <div className='queries-filter'>
            <Switch label="Active" checked={activeUsers} onChange={(e) => setActiveUsers(!activeUsers)} />
        </div>
            {data && data.map((item) => {return <UserCard data={item} getUsers={getUsers} />})}
            {data && data.length == 0 && <h3>No Users</h3>}
        

        </div>
    </div>
  )
}

export default UsersControl