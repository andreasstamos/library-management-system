import React from 'react'
import './UserCard.css'
import axios from 'axios'
import {useContext} from "react";
import AuthContext from '../../context/AuthContext';


export default function UserCard({data, action, getDeactivatedUsers}) {
  let {user} = useContext(AuthContext);
  async function handleSubmit(user_id) {
      const payload = {
          'action': action,
          'user_id': user_id,
    }
    console.log(user?.sub?.school_id);
      const response = await axios.post('http://127.0.0.1:5000/lib-api/change-active-user/', payload, {headers: {
        'Access-Control-Expose-Headers' : '*',
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
     }})
     await getDeactivatedUsers();
  }


  return (
    <div className='user-row'>
        <h4 className='user-element'>Username: {data.username}</h4>
        <h4 className='user-element'>First Name: {data.first_name}</h4>
        <h4 className='user-element'>Last Name: {data.last_name}</h4>
        <h4 className='user-element'>E-mail: {data.email}</h4>
        <h4 className='user-element'>Role: {data?.role}</h4>
        <h4 className='user-element'>Active: {data.active ? "True" : 'False'}</h4>
        <button type='button' onClick={(e) => {handleSubmit(data.user_id)}}>{action == 'activate' ? 'Activate': 'Deactivate'} User</button>
    </div>
  )
}
