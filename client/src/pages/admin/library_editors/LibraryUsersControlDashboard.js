import React from 'react'
import { Outlet } from 'react-router-dom'
import LibraryUsersControlMenu from './LibraryUsersControlMenu'


function LibraryUsersControlDashboard() {
  return (
    <div>
        <h1 className='title-with-hr'>Διαχείριση χειριστών βιβλιοθηκών</h1>
        <LibraryUsersControlMenu />
        <Outlet />
    </div>
  )
}

export default LibraryUsersControlDashboard
