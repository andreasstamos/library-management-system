import React, { useEffect, useState } from 'react'
import './UsersControl.css'
import axios from 'axios';
import UserCard from './UserCard';


function UsersControl({action}) {


    const [data, setData] = useState();

    async function getDeactivatedUsers() {
        console.log(localStorage.getItem('authTokens'));
        const response = await axios.post(`http://127.0.0.1:5000/lib-api/get-users-active-status/`,{
            "action": action
        },{
            headers: {
               'Access-Control-Expose-Headers' : '*',
               'Access-Control-Allow-Origin': '*', 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        setData(response?.data?.users);

    }


    useEffect( () => {
            getDeactivatedUsers();
    }, [])


  return (
    <div className='dashboard-component'>
        <h2 className='component-title'>{action == 'deactivate' ? 'Active' : 'Deactivated'} Users</h2>
        <div className='component-details users-control'>
        
            {data && data.map((item) => {return <UserCard data={item} action={action} />})}
            {data && data.length == 0 && <h3>No Users</h3>}
        

        </div>
    </div>
  )
}

export default UsersControl