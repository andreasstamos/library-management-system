import React from 'react'
import { Outlet } from 'react-router-dom'
import LibraryUsersControlMenu from './LibraryUsersControlMenu'


function LibraryUsersControlDashboard() {
  return (
    <div>
        <LibraryUsersControlMenu />
        <Outlet />
    </div>
  )
}

export default LibraryUsersControlDashboard