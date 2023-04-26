import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './Dashboard.css'


function Dashboard() {
  return (
    <div className='dashboard'>
        <h1 className='dashboard-title'>Library Editor Dashboard</h1>
        <div className='dashboard-routes'>
            <NavLink to='/lib-editor/activate-users/'>Non-Active Users</NavLink>
            <NavLink to='/lib-editor/deactivate-users/'>Active Users</NavLink>
        </div>
        <Outlet />
    </div>
    )
}

export default Dashboard