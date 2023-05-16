import { useState, useEffect, useContext } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import AuthContext from "../context/AuthContext";
import axios from "axios";
import debounce from "lodash/debounce";

function FilterBar({label, inputValue, value, options, loading, handleChangeValue, handleChangeInputValue, edit, singlevalue, readOnly}) {
  if (readOnly && singlevalue) handleChangeInputValue(value);
  return (
    <Autocomplete
      readOnly={readOnly}
      freeSolo={edit}
      value={value}
      defaultValue={value}
      inputValue={readOnly ? (singlevalue ? value : '') : inputValue}
      onChange={(event, value) => {handleChangeValue(value);}}
      onInputChange={(event, value) => {handleChangeInputValue(value);}}
      options={options}
      multiple={!singlevalue}
      disableCloseOnSelect={!singlevalue}
      limitTags={3}
      renderOption={singlevalue ? undefined : ((props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon = {<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon = {<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option}
        </li>
      ))}

      loading={loading}
      loadingText="Φόρτωση..."
      options={options}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} label={label} />}
 
      sx={{ width: 250 }}
    />
  );
}

function FilterBarCategory({value, handleChangeValue, edit, singlevalue, readOnly}) {
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
          setOptions(response.data.categories.map((category) => category.category_name));
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
      readOnly={readOnly}
      singlevalue={singlevalue}
      edit={edit}
      label="Κατηγορίες"
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

function FilterBarPublisher({value, handleChangeValue, edit, singlevalue, readOnly}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const payload = {
        };

        const response = await axios.post('http://127.0.0.1:5000/book/publisher/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.publishers) {
          setOptions(response.data.publishers.map((publisher) => publisher.publisher_name));
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchPublishers = debounce(() => {
      setLoading(true);
      fetchPublishers();
    }, 200); //200ms between search calls to api.
    debounced_fetchPublishers();

    return () => {debounced_fetchPublishers.cancel();}
  }, [inputValue]);

  return (
    <FilterBar
      readOnly={readOnly}
      singlevalue={singlevalue}
      edit={edit} 
      label="Εκδοτικοί Οίκοι"
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

function FilterBarKeyword({value, handleChangeValue, edit, singlevalue, readOnly}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const payload = {
          "limit": 10,
          "keyword": inputValue,
        };

        const response = await axios.post('http://127.0.0.1:5000/book/keyword/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.keywords) {
          setOptions(response.data.keywords.map((keyword) => keyword.keyword_name));
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchKeywords = debounce(() => {
      setLoading(true);
      fetchKeywords();
    }, 200); //200ms between search calls to api.
    debounced_fetchKeywords();

    return () => {debounced_fetchKeywords.cancel();}
  }, [inputValue]);

  return (
    <FilterBar
      readOnly={readOnly}
      singlevalue={singlevalue}
      edit={edit}
      label="Λέξεις κλειδιά"
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

function FilterBarAuthor({value, handleChangeValue, edit, singlevalue, readOnly}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const payload = {
          "limit": 10,
          "author": inputValue,
        };

        const response = await axios.post('http://127.0.0.1:5000/book/author/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.authors) {
          setOptions(response.data.authors.map((author) => author.author_name));
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchAuthors = debounce(() => {
      setLoading(true);
      fetchAuthors();
    }, 200); //200ms between search calls to api.
    debounced_fetchAuthors();

    return () => {debounced_fetchAuthors.cancel();}
  }, [inputValue]);

  return (
    <FilterBar
      readOnly={readOnly}
      singlevalue={singlevalue}
      edit={edit}
      label="Συγγραφείς"
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

function FilterBarLanguage({value, handleChangeValue, edit, singlevalue, readOnly}) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const payload = {
          "limit": 10,
          "language": inputValue,
        };

        const response = await axios.post('http://127.0.0.1:5000/book/language/get/', payload, {headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.authTokens}`,
        }});
        setLoading(false);
        if (!response.data.success) {
          setError("Something went wrong. Please try again.");
        }
        if (response.data.languages) {
          setOptions(response.data.languages.map((language) => language.language));
        }
      } catch (e) {
        setLoading(false);
        setError("Something went wrong. Please try again.");
      }
    };

    const debounced_fetchLanguages = debounce(() => {
      setLoading(true);
      fetchLanguages();
    }, 200); //200ms between search calls to api.
    debounced_fetchLanguages();

    return () => {debounced_fetchLanguages.cancel();}
  }, [inputValue]);

  return (
    <FilterBar
      readOnly={readOnly}
      singlevalue={singlevalue}
      edit={edit}
      label="Γλώσσες"
      inputValue={inputValue}
      value={value}
      options={options}
      loading={loading}
      handleChangeValue={handleChangeValue}
      handleChangeInputValue={(value) => {setInputValue(value);}}
    />
  );
}

export { FilterBarCategory, FilterBarPublisher, FilterBarKeyword, FilterBarAuthor, FilterBarLanguage };
