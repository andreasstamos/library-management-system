import { CircularProgress, Switch, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



function PublisherControl() {

    const [publishers, setPublishers] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchPublishers() {
        setPublishers(null);
        setLoading(true);
        const response = await axios.post("http://localhost:5000/publishers/get-publishers/", {}, {
            headers: {
               'Access-Control-Expose-Headers' : '*',
               'Access-Control-Allow-Origin': '*', 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        });
        setPublishers(response?.data?.publishers);
        setLoading(false);
    }

    useEffect(() => {
        fetchPublishers();
    }, [])

  return (
    <div className='dashboard-component'>
    <h2 className='component-title title-with-hr'>Εκδοτικοί Οίκοι</h2>
    <AddPublisher getPublishers={fetchPublishers}/>

    <div className='component-details users-control'>
    {loading && <CircularProgress />}
    {publishers && (publishers.length > 0 ? publishers.map(publisher => <PublisherCard data={publisher} getPublishers={fetchPublishers}/>) : <h3>Δεν βρέθηκαν Λέξεις Κλειδιά.</h3>)}
       
    

    </div>
</div>
  )
}

export default PublisherControl




function PublisherCard({data, getPublishers}) {

    const [newPublisherName, setNewPublisherName] = useState('');
    const [edit, setEdit] = useState(false)


    async function updatePublisher() {
        const payload = {
            publisher_name: newPublisherName,
            publisher_id: data.publisher_id
        }
        
        const response = await axios.post('http://localhost:5000/publishers/update-publisher/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
        await getPublishers();
    }

    async function deletePublisher() {
        const payload = {
            publisher_id: data.publisher_id
        }
        const response = await axios.post('http://localhost:5000/publishers/delete-publisher/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getPublishers();
    }
    

    return (
    <Card sx={{ minWidth: 275, mt:2 }} className='user-card'>
        <CardContent>
        <form className='lib-editor-card-info'>
        
            <TextField
                    required
                    id="filled-required"
                    label="Εκδοτικός Οίκος"
                    defaultValue={data.publisher_name}
                    onChange={(e) => setNewPublisherName(e.target.value)}
                    variant={edit ? 'outlined' : 'filled'}
                    disabled={!edit}
                />
            </form>
        
        </CardContent>
        <CardActions>
            <Button size="small" variant="contained" onClick={updatePublisher} disabled={!edit}>Ενημέρωση</Button>
            <Button size="small" variant="contained" color="secondary" onClick={() => setEdit(!edit)}>Επεξεργασία</Button>
            <Button size="small" variant="contained" color="error" onClick={deletePublisher}>Διαγραφή</Button>
        </CardActions>
    </Card>
    )

}


function AddPublisher({getPublishers}) {
    const [publisherName, setPublisherName] = useState('');

    async function addPublisher() {
        const payload = {
            publisher_name: publisherName
        }
        const response = await axios.post('http://localhost:5000/publishers/add-publisher/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getPublishers();
          setPublisherName('');
        }

    return (
        <>
        <TextField 
        variant="outlined"
        size="small"
        label="Εκδοτικός Οίκος"
        sx={{mr:3}}
        value={publisherName}
        onChange={(e) => setPublisherName(e.target.value)}
        />
       <Button variant="contained" endIcon={<AddCircleOutlineIcon />} onClick={addPublisher}>
        Προσθήκη
       </Button>
        </>

        
    )
}