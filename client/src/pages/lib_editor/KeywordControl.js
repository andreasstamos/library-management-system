import { CircularProgress, Switch, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



function KeywordControl() {

    const [keywords, setKeywords] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchKeywords() {
        setKeywords(null);
        setLoading(true)
        const response = await axios.post("http://localhost:5000/keywords/get-keywords/", {}, {
            headers: {
               'Access-Control-Expose-Headers' : '*',
               'Access-Control-Allow-Origin': '*', 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        setKeywords(response?.data?.keywords);
        setLoading(false);
    }

    useEffect(() => {
        fetchKeywords();
    }, [])

  return (
    <div className='dashboard-component'>
    <h2 className='component-title title-with-hr'>Λέξεις Κλειδιά</h2>
    <AddKeyword getKeywords={fetchKeywords}/>

    <div className='component-details users-control'>
    {loading && <CircularProgress />}
    {keywords && (keywords.length > 0 ? keywords.map(keyword => <KeywordCard key={keyword?.keyword_id}
        data={keyword} getKeywords={fetchKeywords}/>) : <h3>Δεν βρέθηκαν Λέξεις Κλειδιά.</h3>)}
       
    

    </div>
</div>
  )
}

export default KeywordControl




function KeywordCard({data, getKeywords}) {

    const [newKeywordName, setNewKeywordName] = useState('');
    const [edit, setEdit] = useState(false)


    async function updateKeyword() {
        const payload = {
            keyword_name: newKeywordName,
            keyword_id: data.keyword_id
        }
        
        const response = await axios.post('http://localhost:5000/keywords/update-keyword/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
        await getKeywords();
    }

    async function deleteKeyword() {
        const payload = {
            keyword_id: data.keyword_id
        }
        const response = await axios.post('http://localhost:5000/keywords/delete-keyword/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getKeywords();
    }
    

    return (
    <Card sx={{ minWidth: 275, mt:2 }} className='user-card'>
        <CardContent>
        <form className='lib-editor-card-info'>
        
            <TextField
                    required
                    id="filled-required"
                    label="Λέξη Κλειδί"
                    defaultValue={data.keyword_name}
                    onChange={(e) => setNewKeywordName(e.target.value)}
                    variant={edit ? 'outlined' : 'filled'}
                    disabled={!edit}
                />
            </form>
        
        </CardContent>
        <CardActions>
            <Button size="small" variant="contained" onClick={updateKeyword} disabled={!edit}>Ενημερωση</Button>
            <Button size="small" variant="contained" color="secondary" onClick={() => setEdit(!edit)}>Επεξεργασια</Button>
            <Button size="small" variant="contained" color="error" onClick={deleteKeyword}>Διαγραφη</Button>
        </CardActions>
    </Card>
    )

}


function AddKeyword({getKeywords}) {
    const [keywordName, setKeywordName] = useState('');

    async function addKeyword() {
        const payload = {
            keyword_name: keywordName
        }
        const response = await axios.post('http://localhost:5000/keywords/add-keyword/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getKeywords();
          setKeywordName('');
        }

    return (
        <>
        <TextField 
        variant="outlined"
        size="small"
        label="Λέξη Κλειδί"
        sx={{mr:3}}
        value={keywordName}
        onChange={(e) => setKeywordName(e.target.value)}
        />
       <Button variant="contained" endIcon={<AddCircleOutlineIcon />} onClick={addKeyword}>
        Προσθηκη
       </Button>
        </>

        
    )
}
