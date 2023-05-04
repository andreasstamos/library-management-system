import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './Dashboard.css'
import MenuAppBar from '../../Components/Navbar'
import DashboardMenu from './DashboardMenu'

function Dashboard() {
  return (
    <>
    <MenuAppBar />
    <div className='dashboard'>
        <h1 className='dashboard-title title-with-hr'>Library Editor Dashboard</h1>
        {/* <div className='dashboard-routes'>
            <NavLink to='/lib-editor/activate-users/'>Non-Active Users</NavLink>
            <NavLink to='/lib-editor/deactivate-users/'>Active Users</NavLink>
        </div> */}
        <DashboardMenu />
        <Outlet />
    </div>
    </>
    )
}

export default Dashboard