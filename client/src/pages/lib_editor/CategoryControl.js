import { CircularProgress, Switch, TextField, Button, Card, CardContent, CardActions } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



function CategoryControl() {

    const [categories, setCategories] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchCategories() {
        setCategories(null);
        setLoading(true)
        const response = await axios.post("http://localhost:5000/category/get-categories/", {}, {
            headers: {
               'Access-Control-Expose-Headers' : '*',
               'Access-Control-Allow-Origin': '*', 
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
            }
        })
        setCategories(response?.data?.categories);
        setLoading(false);
    }

    useEffect(() => {
        fetchCategories();
    }, [])

  return (
    <div className='dashboard-component'>
    <h2 className='component-title title-with-hr'>Κατηγορίες</h2>
    <AddCategory getCategories={fetchCategories}/>

    <div className='component-details users-control'>
    {loading && <CircularProgress />}
    {categories && (categories.length > 0 ? categories.map(category => <CategoryCard key={category?.category_id} data={category}
        getCategories={fetchCategories}/>) : <h3>Δεν βρέθηκαν Κατηγορίες</h3>)}
       
    

    </div>
</div>
  )
}

export default CategoryControl




function CategoryCard({data, getCategories}) {

    const [newCategoryName, setNewCategoryName] = useState('');
    const [edit, setEdit] = useState(false)


    async function updateCategory() {
        const payload = {
            category_name: newCategoryName,
            category_id: data.category_id
        }
        
        const response = await axios.post('http://localhost:5000/category/update-category/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
        await getCategories();
    }

    async function deleteCategory() {
        const payload = {
            category_id: data.category_id
        }
        const response = await axios.post('http://localhost:5000/category/delete-category/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getCategories();
    }
    

    return (
    <Card sx={{ minWidth: 275, mt:2 }} className='user-card'>
        <CardContent>
        <form className='lib-editor-card-info'>
        
            <TextField
                    required
                    id="filled-required"
                    label="Όνομα κατηγορίας"
                    defaultValue={data.category_name}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    variant={edit ? 'outlined' : 'filled'}
                    disabled={!edit}
                />
            </form>
        
        </CardContent>
        <CardActions>
            <Button size="small" variant="contained" onClick={updateCategory} disabled={!edit}>Ενημερωση</Button>
            <Button size="small" variant="contained" color="secondary" onClick={() => setEdit(!edit)}>Επεξεργασια</Button>
            <Button size="small" variant="contained" color="error" onClick={deleteCategory}>Διαγραφη</Button>
        </CardActions>
    </Card>
    )

}


function AddCategory({getCategories}) {
    const [categoryName, setCategoryName] = useState('');

    async function addCategory() {
        const payload = {
            category_name: categoryName
        }
        const response = await axios.post('http://localhost:5000/category/add-category/', payload, {
            headers: {
              'Access-Control-Expose-Headers' : '*',
              'Access-Control-Allow-Origin': '*', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authTokens')}`,
           }
          })
          await getCategories();
          setCategoryName('');
        }

    return (
        <>
        <TextField 
        variant="outlined"
        size="small"
        label="Κατηγορία"
        sx={{mr:3}}
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        />
       <Button variant="contained" endIcon={<AddCircleOutlineIcon />} onClick={addCategory}>
        Προσθηκη
       </Button>
        </>

        
    )
}
