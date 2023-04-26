import React from 'react'
import './Dropdown.css'


function Dropdown({userSelected, setUserSelected}) {


  return (
    <>
<div class="select" for="user_select">
  <label for="user">Select user type:    </label>
  <select id="user_select" name="user" required="required" value={userSelected} onChange={(e) => setUserSelected(e.target.value)}>
  <option value="" disabled="disabled" >Select option:</option>

  <option value="student">Student</option>
  <option value="teacher">Teacher</option>
  <option value="lib_editor">Library Editor</option>
   
  
  </select>
  <svg>
    <use href="#select-arrow-down"></use>
  </svg>
</div>

<svg class="sprites">
  <symbol id="select-arrow-down" viewbox="0 0 10 6">
    <polyline points="1 1 5 5 9 1"></polyline>
  </symbol>
</svg>
</>
  )
}

export default Dropdown