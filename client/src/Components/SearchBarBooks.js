import { useState, useEffect, useContext } from "react";
import { Autocomplete, TextField } from "@mui/material";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import debounce from "lodash/debounce";

export default function SearchBarBooks({value, handleChangeValue}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const payload = {
          title: inputValue,
          fetch_fields: ["isbn", "title"]
        };

        const response = await axios.post('http://127.0.0.1:5000/book/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.books) {
          setOptions(response.data.books);
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchBooks = debounce(() => {
      setLoading(true);
      fetchBooks();
    }, 200); //200ms between search calls to api.
    debounced_fetchBooks();

    return () => {debounced_fetchBooks.cancel();}
  }, [inputValue]);

  return (
    <Autocomplete
      freeSolo
      sx={{ width: 250 }}
      value={value}
      inputValue={inputValue}
      onInputChange={(event, value) => {setInputValue(value);}}
      onChange={(event, value) => {handleChangeValue(value);}}
      getOptionLabel={(option) => option?.title ?? option}
      isOptionEqualToValue={(book, value) => book?.title === value?.title}
      loading={loading}
      loadingText="Φόρτωση..."
      options={options}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} label="Αναζήτηση" />}
    />
  );
}
