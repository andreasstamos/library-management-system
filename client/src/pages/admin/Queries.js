import React from 'react'
import { Outlet } from 'react-router-dom'
import QueriesMenu from './QueriesMenu'

function Queries() {
  return (
    <div>
        <h1 className='title-with-hr'>Στατιστικά</h1>
        <QueriesMenu />
        <Outlet />
    </div>
  )
}

export default Queries
