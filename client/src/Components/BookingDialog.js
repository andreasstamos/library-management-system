import { useState, useEffect, useContext } from 'react';
import { Box, Alert, Dialog, DialogContent, DialogContentText, DialogActions, Button, Typography, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import debounce from "lodash/debounce";

function BookingDialog({open, isbn, onClose}) {
  const [forMe, setForMe] = useState('me');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userid, setUserid] = useState('');
  const [bookingExists, setBookingExists] = useState(null);
  const [bookingExceededMax, setBookingExceededMax] = useState(null);
 
  const auth = useContext(AuthContext);

  const handleBooking = async () => {
    setBookingLoading(true);
    setError(null);
    try {
      const payload = {
        isbn: isbn,
        ...(forMe === "other" && {user_id: parseInt(userid)})
      };

      const response = await axios.post('http://127.0.0.1:5000/booking/insert/', payload, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});
      setBookingLoading(false);
      if (response?.data?.success) {
        onClose();
        fetchBooking();
        return;
      }
      else setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    } catch (e) {
      setBookingLoading(false);
      setError("Κάτι πήγε λάθος. Παρακαλούμε δοκιμάστε ξανά.");
    }
  };

  const fetchUser = async () => {
    setBookingExists(null);
    setBookingExceededMax(null); 
    setUser(null);
    if (!userid) return;
    try {
      const response = await axios.post('http://127.0.0.1:5000/user/get-details/', {user_id: parseInt(userid)}, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});

      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακαλούμε προσπαθήστε ξανά.");
        return;
      }

      setLoading(false);
      if (response?.data?.user) {
        setUser(response?.data?.user);
      }
      else {
        setLoading(false);
        setError("Δυστυχώς ο χρήστης δεν βρέθηκε στο σχολείο σας.");
        return;
      }
    } catch (e) {
      setLoading(false);
      setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
    }
  };

  const fetchBooking = async () => {
    if (forMe === "other" && (!userid || userid?.length === 0 || !user)) return;
    try {
      const payload = {
        isbn: isbn,
        ...(forMe === "other" && {user_id: parseInt(userid)})
      }
      const response = await axios.post('http://127.0.0.1:5000/booking/exists/', payload, {headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.authTokens}`,
      }});
      if (!response?.data?.success) {
        setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
      }
      setBookingExists(response?.data?.exists_booking);
      setBookingExceededMax(response?.data?.exceeded_max);
    } catch(e) {
      setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
    }
  }

  useEffect(() => {
    const debounced_fetchUser = debounce(() => {
      fetchUser();
    }, 200); //200ms between search calls to api.
    debounced_fetchUser();

    return () => {debounced_fetchUser.cancel();}
  }, [userid]);

  useEffect(() => {if (!isbn) return; fetchBooking();}, [forMe, isbn, user]);
  useEffect(() => {setBookingExists(null);setBookingExceededMax(null);}, [forMe]);
 

  return (
    <Dialog open={open}>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', rowGap: '1rem'}}>
        <RadioGroup value={forMe} onChange={(e) => {setForMe(e.target.value);}}>
          <FormControlLabel value="me" control={<Radio />} label="Για εμένα" />
          <FormControlLabel value="other" control={<Radio />} label="Για άλλον/άλλη" />
        </RadioGroup>

        {bookingExists === true && <Alert severity="error"> {forMe === "me" ? 'Έχετε' : 'Ο χρήστης έχει'} ήδη κράτηση για το βιβλίο.</Alert>}
        {bookingExists === false && bookingExceededMax === true &&
          <Alert severity="error"> {forMe === "me" ? 'Έχετε' : 'Ο χρήστης έχει'} εκτελέσει ήδη το μέγιστο αριθμό επιτρεπτών κρατήσεων.</Alert>}
        
        {forMe === "other" &&
        <>
          {!loading && !user && userid?.length > 0 && <Alert severity="warning">Δυστυχώς ο χρήστης δεν βρέθηκε στο σχολείο σας.</Alert>}
          <TextField required label="Αριθμός χρήστη" value={userid} onChange={(e) => {setUserid(e.target.value);}} />
          {user &&
          <>
            <TextField label="Username" InputProps={{readOnly: true}} value={user?.username} />
            <TextField label="Όνομα" InputProps={{readOnly: true}} value={user?.first_name} />
            <TextField label="Επώνυμο" InputProps={{readOnly: true}} value={user?.last_name} />
          </>
          }
        </>}
      </DialogContent>
      <DialogActions sx={{display: 'flex', justifyContent: 'space-around'}}>
        <Button color="secondary" onClick={onClose}>ΑΚΥΡΟ</Button>
        {(forMe === "me" || user) && bookingExists === false && bookingExceededMax === false && <Button onClick={handleBooking}>ΚΡΑΤΗΣΗ</Button>}
      </DialogActions>
    </Dialog>
  );
}

export default BookingDialog;
