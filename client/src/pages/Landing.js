import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import MenuAppBar from '../Components/Navbar'
import './Landing.css'


function Landing() {
  return (
    <>
    <MenuAppBar />
    
    <div className='app-container'>
        <Outlet/>
    </div>
    
    </>

    )
}

export default Landing