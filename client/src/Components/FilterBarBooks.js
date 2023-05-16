import { useState, useEffect, useContext } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import AuthContext from "../context/AuthContext";
import axios from "axios";
import debounce from "lodash/debounce";

function FilterBar({inputValue, value, options, loading, handleChangeValue, handleChangeInputValue}) {
  return (
    <Autocomplete
      value={value}
      inputValue={inputValue}
      onChange={(event, value) => {handleChangeValue(value);}}
      onInputChange={(event, value) => {handleChangeInputValue(value);}}
      options={options}
      multiple
      disableCloseOnSelect
      limitTags    
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon = {<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon = {<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.category_name}
        </li>
      )}

      getOptionLabel={(option) => option?.category_name ?? option}
      isOptionEqualToValue={(category, value) => category?.category_name === value?.category_name}
      loading={loading}
      loadingText="Φόρτωση..."
      options={options}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} label="Κατηγορίες" />}
 
      sx={{ width: 250 }}
    />
  );
}

function FilterBarCategory({value, handleChangeValue}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const payload = {
        };

        const response = await axios.post('http://127.0.0.1:5000/book/category/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.categories) {
          setOptions(response.data.categories);
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchCategories = debounce(() => {
      setLoading(true);
      fetchCategories();
    }, 200); //200ms between search calls to api.
    debounced_fetchCategories();

    return () => {debounced_fetchCategories.cancel();}
  }, [inputValue]);

  return (
    <FilterBar
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

export { FilterBarCategory };
