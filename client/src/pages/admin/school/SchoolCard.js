import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Input, InputLabel, FormControl, } from '@mui/material';
import './SchoolCard.css'
import axios from 'axios';
import { Form } from 'react-router-dom';

export default function SchoolCard({name, schoolID, address, city, email, fetchSchools, headmaster}) {

    const [edit, setEdit] = React.useState(false);

    const [newName, setNewName] = React.useState(name)
    const [newAddress, setNewAddress] = React.useState(address);
    const [newCity, setNewCity] = React.useState(city);
    const [newEmail, setNewEmail] = React.useState(email);
    const [newHeadmaster, setNewHeadmaster] = React.useState(headmaster);

    async function updateSchool() {
        const payload = {
            school_id: schoolID,
            new_school: {
                name: newName,
                address: newAddress,
                city: newCity,
                email: newEmail,
                headmaster: newHeadmaster,
            }
        }
        
        const response = await axios.patch('http://localhost:5000/school/update-school/', payload, {
            headers: {
                'Access-Control-Expose-Headers' : '*',
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        console.log(response);
        setEdit(false);
        fetchSchools();
    }

    async function deleteSchool() {
        const payload = {
            school_id: schoolID
        }
        const response = await axios.post('http://localhost:5000/school/delete-school/', payload,{
            headers: {
            'Access-Control-Expose-Headers' : '*',
            'Access-Control-Allow-Origin': '*', 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
        }
    })
        console.log(response);
        fetchSchools();
    }


  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()} style={{display:'flex',flexDirection:'column'}} id='change-school-form'>
            <FormControl>
            <InputLabel htmlFor="school-name">Όνομα σχολείου</InputLabel>
            <Input placeholder={name} value={edit ? newName : name} readOnly={!edit} onChange={(e) => {setNewName(e.target.value)}} id='school-name'>
            </Input>
            </FormControl>
            <FormControl>
            <InputLabel htmlFor="school-city">Πόλη</InputLabel>

            <Input placeholder={city} value={edit ? newCity : city} readOnly={!edit}  onChange={(e) => {setNewCity(e.target.value)}} id='school-city'>
            </Input>
            </FormControl>


            <FormControl>
            <InputLabel htmlFor="school-address">Διεύθυνση</InputLabel>

            <Input placeholder={address} value={edit ? newAddress : address} readOnly={!edit}  onChange={(e) => {setNewAddress(e.target.value)}} id='school-address'>
            </Input>    
            </FormControl>


            <FormControl>
            <InputLabel htmlFor="school-email">Email</InputLabel>

            <Input placeholder={email} value={edit ? newEmail : email} readOnly={!edit} onChange={(e) => {setNewEmail(e.target.value)}} id='school-email'>
            </Input>
            </FormControl>
    

            <FormControl>
            <InputLabel htmlFor="school-headmaster">Διευθυντής</InputLabel>
            <Input placeholder={headmaster} value={edit ? newHeadmaster : headmaster} readOnly={!edit} onChange={(e) => {setNewHeadmaster(e.target.value)}}>
            </Input>
            </FormControl>


        </form>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => setEdit(!edit)}>ΕΠΕΞΕΡΓΑΣΙΑ</Button>
        <Button disabled={!edit} size='small' onClick={() => updateSchool()}>ΕΝΗΜΕΡΩΣΗ</Button>
        <Button type='submit' color="error" onClick={(e) => {deleteSchool()}}>ΔΙΑΓΡΑΦΗ</Button>
      </CardActions>
    </Card>
  );
}
