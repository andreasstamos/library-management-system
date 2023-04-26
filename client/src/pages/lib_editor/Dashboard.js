import React from 'react'
import { Outlet } from 'react-router-dom'
import './Dashboard.css'


function Dashboard() {
  return (
    <div className='dashboard'>
        <div>Library Editor Dashboard</div>
        <Outlet />
    </div>
    )
}

export default Dashboard