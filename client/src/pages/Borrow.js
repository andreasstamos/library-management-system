import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import './Borrow.css';
import AuthContext from '../context/AuthContext';
import { Alert, Box, Typography, Button, TextField, Rating, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';


function ItemIdForm({itemid, setItemId, handleNext, handleReturn}) {
	const [inputItemId, setInputItemId] = useState(itemid || "");
	const [item, setItem] = useState(null);
	const [itemLoading, setItemLoading] = useState(false);
	const [error, setError] = useState(null);
	const auth = useContext(AuthContext);

	useEffect(() => {
		setItem(null);
		if (!itemid) return;
		setItemLoading(true);
		const fetchItem = async () => {
			try {
				const payload = {
					item_id: parseInt(itemid)
				};
				const response = await axios.post('http://127.0.0.1:5000/item/get-details/', payload, {headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${auth.authTokens}`,
				}});
				setItemLoading(false);
				if (!response.data.success) {
					setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
				}

				if (response.data.item) {
					setItem(response.data.item);
				}
				else {
					setError("Δυστυχώς το αντίτυπο δεν βρέθηκε.");
				}
			} catch (e) {
				setItemLoading(false);
				setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
			}
		};

		fetchItem();
	}, [itemid])

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', rowGap: '1rem'}}>
			{error && <Alert severity="error" onClose={() => setError(null)} >{error}</Alert>}
			<Box sx={{display: 'flex', columnGap:'1rem'}}>
				<TextField
					label="Κωδικός Αντιτύπου"
					value={inputItemId}
					onChange={e => {setInputItemId(e.target.value)}} />
				<Button variant="contained" onClick={e => {setItemId(inputItemId)}}>ΑΝΑΖΗΤΗΣΗ</Button>
			</Box>
			{itemLoading && <CircularProgress />}
			{item &&
				<Box sx={{display: 'flex', columnGap: '1rem'}}>
					<img className='book-image' src={item?.image_uri} />
					<Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
						<Typography variant="h2">{item?.title}</Typography>
						<Typography variant="h3">{item?.authors.join(', ')}</Typography>
						<Box sx={{display: 'flex', columnGap: '2rem'}}>
							<Box sx={{display:'flex', flexDirection: 'column', rowGap: '1rem'}}>
								<div className='book-detail'>
									<Typography variant="h6">ISBN</Typography>
									<Typography variant="body1">{item?.isbn}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Βαθμολογία Likert</Typography>
									<Rating name="read-only" value={item?.rate} readOnly />
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Περίληψη</Typography>
									<Typography variant="body1">{item?.summary}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">{item?.categories?.length <= 1 ? 'Κατηγορία' : 'Κατηγορίες'}</Typography>
									<Typography variant="body1">{item?.categories.join(', ')}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Λέξεις κλειδιά</Typography>
									<Typography variant="body1">{item?.keywords?.join(', ')}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Γλώσσα</Typography>
									<Typography variant="body1">{item?.language}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Αριθμός σελίδων</Typography>
									<Typography variant="body1">{item?.page_number}</Typography>
								</div>

								<div className='book-detail'>
									<Typography variant="h6">Εκδοτικός Οίκος</Typography>
									<Typography variant="body1">{item?.publisher_name}</Typography>
								</div>
							</Box>
							{item.isBorrowed &&
							<Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
								<Typography variant="h5">Δανειζόμενος χρήστης</Typography>
								<div className='book-detail'>
									<Typography variant="h6">Όνομα</Typography>
									<Typography variant="body1">{item?.first_name}</Typography>
								</div>
								<div className='book-detail'>
									<Typography variant="h6">Επώνυμο</Typography>
									<Typography variant="body1">{item?.last_name}</Typography>
								</div>
								<div className='book-detail'>
									<Typography variant="h6">e-mail</Typography>
									<Typography variant="body1">{item?.email}</Typography>
								</div>
							</Box>
							}	
						</Box>
					</Box>
				</Box>
			}
			{item && !item?.isBorrowed && <Button variant="contained" sx={{ml: 'auto'}} onClick={handleNext}>ΕΠΟΜΕΝΟ</Button>}
			{item && item?.isBorrowed && <Button variant="contained" sx={{ml: 'auto'}} onClick={handleReturn}>ΕΠΙΣΤΡΟΦΗ</Button>}

		</Box>
	)
}

function UserIdForm({userid, setUserId, handleBorrow, handleBack}) {
	const [inputUserId, setInputUserId] = useState(userid || "");
	const [user, setUser] = useState(null);
	const [userLoading, setUserLoading] = useState(false);
	const [error, setError] = useState(null);
	const auth = useContext(AuthContext);

	useEffect(() => {
		setUser(null);
		if (!userid) return;
		setUserLoading(true);
		const fetchUser = async () => {
			try {
				const payload = {
					user_id: parseInt(userid)
				};
				const response = await axios.post('http://127.0.0.1:5000/user/get-details/', payload, {headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${auth.authTokens}`,
				}});
				setUserLoading(false);
				if (!response.data.success) {
					setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
				}

				if (response.data.user) {
					setUser(response.data.user);
				}
				else {
					setError("Δυστυχώς ο χρήστης δεν βρέθηκε.");
				}
			} catch (e) {
				setUserLoading(false);
				setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
			}
		};

		fetchUser();
	}, [userid])

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', rowGap: '1rem'}}>
			{error && <Alert severity="error" onClose={() => setError(null)} >{error}</Alert>}

			<Box sx={{display: 'flex', columnGap:'1rem'}}>
				<TextField
					label="Αριθμός χρήστη"
					value={inputUserId}
					onChange={e => {setInputUserId(e.target.value)}} />
				<Button variant="contained" onClick={e => {setUserId(inputUserId)}}>ΑΝΑΖΗΤΗΣΗ</Button>
				<Button variant="contained" color="secondary" onClick={handleBack}>ΠΙΣΩ</Button>
			</Box>
			{userLoading && <CircularProgress />}
			{user &&
				<Box sx={{display:'flex', flexDirection: 'column', rowGap: '1rem'}}>
					<div className='book-detail'>
						<Typography variant="h6">Όνομα</Typography>
						<Typography variant="body1">{user?.first_name}</Typography>
					</div>
					<div className='book-detail'>
						<Typography variant="h6">Επώνυμο</Typography>
						<Typography variant="body1">{user?.last_name}</Typography>
					</div>
					<div className='book-detail'>
						<Typography variant="h6">Όνομα Χρήστη</Typography>
						<Typography variant="body1">{user?.username}</Typography>
					</div>
					<div className='book-detail'>
						<Typography variant="h6">e-mail</Typography>
						<Typography variant="body1">{user?.email}</Typography>
					</div>
				</Box>
			}
			{user && <Button variant="contained" sx={{ml: 'auto'}} onClick={handleBorrow}>ΔΑΝΕΙΣΜΟΣ</Button>}
		</Box>
	)
}



function BorrowForm() {
	const [step, setStep] = useState(0);
	const [itemid, setItemId] = useState(null);
	const [userid, setUserId] = useState(null);
	
	const [loading, setLoading] = useState(null);
	const [error, setError] = useState(null);
	
	const [borrowed, setBorrowed] = useState(null);
	const [returned, setReturned] = useState(null);

	const auth = useContext(AuthContext);
	
	async function borrowItem() {
		const payload = {
			borrower_id: parseInt(userid),
			item_id: parseInt(itemid)
		}
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/borrow/', payload, {headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth.authTokens}`,
			}});
			setLoading(false);
			if (response.data.success) {
				setBorrowed(true);
			}
			else {
				setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
			}
		} catch (e) {
			setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
			return;
		}
	}

	async function returnItem() {
		const payload = {
			item_id: parseInt(itemid)
		}
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/return/', payload, {headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth.authTokens}`,
			}})
			if (response.data.success) {
				setReturned(true);
			}
			else {
				setError("Something went wrong. Please try again.");
			}
		} catch (e) {
			setError("Κάτι πήγε λάθος. Παρακολούμε προσπαθήστε ξανά.");
			return;
		}
	}

	function handleStartOver() {
		setItemId(null);
		setUserId(null);
		setStep(0);
		setBorrowed(null);
		setReturned(null);
	}

	return (
		<Box sx={{display: 'flex', flexDirection: 'column', rowGap: '1rem'}}>
			<Stepper activeStep={step}>
				<Step completed={step>0}><StepLabel>Αντίτυπο</StepLabel></Step>
				<Step completed={step>1}><StepLabel>Χρήστης</StepLabel></Step>
				<Step completed={step>=2}><StepLabel>Δανεισμός/Επιστροφή</StepLabel></Step>
			</Stepper>

			{step == 0 &&
			<ItemIdForm
				itemid={itemid}
				setItemId={setItemId}
				handleReturn={() => {returnItem(); setStep(2);}}
				handleNext={() => {setStep(1)}}/>}
			{step == 1 &&
				<UserIdForm
					userid={userid}
					setUserId={setUserId}
					handleBack={() => {setStep(0)}}
					handleBorrow={() => {borrowItem(); setStep(2);}}/>
			}
			{step == 2 &&
				<Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', rowGap: '1rem'}}>
					{loading && <CircularProgress />}
					{error && <Alert severity="error">{error}</Alert>}
					{borrowed && <Alert severity="success">Ο δανεισμός καταχωρήθηκε με επιτυχία!</Alert>}
					{returned && <Alert severity="success">Η επιστροφή καταχωρήθηκε με επιτυχία!</Alert>}
					<Button variant="contained" sx={{ml: 'auto'}} onClick={handleStartOver}>ΑΡΧΗ</Button>
				</Box>
			}
		</Box>
	);
}



export default BorrowForm;

