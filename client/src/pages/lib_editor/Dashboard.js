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
        <h1 className='dashboard-title title-with-hr'>Πίνακας ελέγχου χειριστή βιβλιοθήκης</h1>
        <div className='dashboard-componentt'>
            <DashboardMenu />
            <Outlet />
        </div>
    </div>
    </>
    )
}

export default Dashboard
