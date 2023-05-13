import React from 'react'
import SchoolMenu from './SchoolMenu'
import { Outlet } from 'react-router-dom'

function SchoolDashboard() {
  return (
    <div>
        <SchoolMenu />
        <Outlet />
    </div>
  )
}

export default SchoolDashboard