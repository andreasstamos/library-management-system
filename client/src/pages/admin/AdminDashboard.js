import React from 'react'
import AdminNavbar from '../../Components/AdminNavbar'
import { Outlet } from 'react-router-dom'
import './AdminDashboard.css'


function AdminDashboard() {
  return (
    <>
    <AdminNavbar />
    

    <div className='admin-dashboard'>
        <h1 className='title-with-hr admin-dashboard-title'>Πίνακας ελέγχου διαχειριστή</h1>
        <div className='admin-dashboard-container'>
          <Outlet />
        </div>
    </div>
    </>
  )
}

export default AdminDashboard
