import { useState, useContext, useRef } from 'react';
import { Box, Button, Backdrop, CircularProgress, Divider, Typography, Alert } from '@mui/material';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

import { saveAs } from 'file-saver';

function Backup() {
  const [loading, setLoading] = useState(false);
  const uploadFileRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [file, setFile] = useState(null);

  const auth = useContext(AuthContext);

  const fetchBackup = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/admin-api/backup/', {}, {responseType: 'blob', headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (!response?.data) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
        return;
      }
      saveAs(response?.data, "backup.sql");
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  const restoreBackup = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://localhost:5000/admin-api/restore/', formData, {headers: {
        "Content-Type": "multipart/form-data",
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      setLoading(false);
      if (response?.data?.success) {
        setSuccess("Η βάση δεδομένων ανακτήθηκε με επιτυχία από το αντίγραφο ασφαλείας. Παρακαλούμε αποσυνδεθείτε και ξανασυνδεθείτε.");
        return;
      }
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
      return;
    }
  };

  return (
    <>
      <h2 className='title-with-hr'>Δημιουργία αντιγράφου ασφαλείας/Ανάκτηση</h2>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress/>
      </Backdrop>


      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '0.75rem'}}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button sx={{mr: 'auto'}} variant="contained" onClick={fetchBackup}>ΔΗΜΙΟΥΡΓΙΑ ΑΝΤΙΓΡΑΦΟΥ ΑΣΦΑΛΕΙΑΣ</Button>
        <Divider />
        <Box sx={{display: 'flex', columnGap: '1rem', alignItems: 'baseline'}}>
          <Button variant="outlined" onClick={() => {uploadFileRef.current.click()}}>ΕΠΙΛΕΞΤΕ ΑΡΧΕΙΟ ΑΝΤΙΓΡΑΦΟΥ ΑΣΦΑΛΕΙΑΣ</Button>
          <input type="file" ref={uploadFileRef} hidden onChange={(e) => {if (e.target.files.length === 1) setFile(e.target.files[0])}} />
          {file && <Typography variant="body1">{file?.name}</Typography>}
          {file && <Button variant="contained" color="error" onClick={restoreBackup}>ΑΝΑΚΤΗΣΗ</Button>}
        </Box>
      </Box>
    </>
  )
}

export default Backup;
