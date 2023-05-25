import React from 'react'
import SchoolMenu from './SchoolMenu'
import { Outlet } from 'react-router-dom'

function SchoolDashboard() {
  return (
    <div>
        <h1 className='title-with-hr'>Διαχείριση σχολείων</h1>
        <SchoolMenu />
        <Outlet />
    </div>
  )
}

export default SchoolDashboard
