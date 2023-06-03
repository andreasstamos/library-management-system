import React from 'react'
import './Dropdown.css'


function Dropdown({schools, schoolSelected, setSchoolSelected}) {

  return (
    <>
<div class="select" for="school_select">
  <label for="school">Select your school:    </label>
  <select id="school_select" name="school" required="required" value={schoolSelected} onChange={(e) => setSchoolSelected(e.target.value)}>
  <option value="" disabled="disabled">Select option:</option>

    {schools.map((school) => {
        return <option key={school?.school_id} value={school?.school_id}>{school?.name}</option>
    })}
   
  
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
