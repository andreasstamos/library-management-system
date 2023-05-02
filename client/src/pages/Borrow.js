import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import './Borrow.css';
import AuthContext from '../context/AuthContext';

function DetailsProperty({name, value}) {
	return (
		<div className="details-property">
			<p className="details-name">{name}</p>
			<p className="details-value">{value}</p>
		</div>);
}

function ItemIdForm({itemid, setItemId, setError, handleNext, handleReturn}) {
	const [inputItemId, setInputItemId] = useState(itemid || "");
	const [item, setItem] = useState(null);
	const [itemLoading, setItemLoading] = useState(false);
	const auth = useContext(AuthContext);
	
	useEffect(() => {
		setError(null);
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
					setError("Something went wrong. Please try again.");
				}

				if (response.data.item) {
					setItem(response.data.item);
				}
				else {
					setError("No item found.");
				}
			} catch (e) {
				setItemLoading(false);
				setError("Something went wrong. Please try again.");
			}
		};

		fetchItem();
	}, [itemid])

	return (
		<div className="form-container">

			<div className="input-container">
				<p className="details-name">Item ID</p>
				<input type="text" value={inputItemId} onChange={e => {setInputItemId(e.target.value)}} placeholder="Enter Item ID"/>
				<button className="find-button" onClick={e => {setItemId(inputItemId)}}>Find</button>
				{itemLoading && <img className="loading-animation" src="./loading.gif"/>}
			</div>
			{item &&
			<>
				<div className="two-column-container">
					<div className="details-container">
						<h2>Item</h2>
						<DetailsProperty name="ISBN" 		value={item.isbn} />
						<DetailsProperty name="Title" 		value={item.title} />
						<DetailsProperty name="Author" 		value={item.authors.join(", ")} />
						<DetailsProperty name="Publisher" 	value={item.publisher_name} />
						<DetailsProperty name="Categories" 	value={item.categories.join(", ")} />
						<DetailsProperty name="Keywords" 	value={item.keywords.join(", ")} />
					</div>
					{item.isBorrowed && <div className="details-container">
						<h2>Borrower</h2>
						<DetailsProperty name="First Name" 	value={item.first_name} />
						<DetailsProperty name="Last Name" 	value={item.last_name} />
						<DetailsProperty name="Email" 		value={item.email} />
					</div>
					}
				</div>
				{!item.isBorrowed && <button className="next-button" onClick={handleNext}>Next</button>}
				{item.isBorrowed && <button className="borrow-button" onClick={handleReturn}>Return</button>}
			</>
			}
		</div>
	)
}

function UserIdForm({userid, setUserId, setError, handleBorrow, handleBack}) {
	const [inputUserId, setInputUserId] = useState(userid || "");
	const [user, setUser] = useState(null);
	const [userLoading, setUserLoading] = useState(false);
	const auth = useContext(AuthContext);

	useEffect(() => {
		setError(null);
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
					setError("Something went wrong. Please try again.");
				}

				if (response.data.user) {
					setUser(response.data.user);
				}
				else {
					setError("No user found.");
				}
			} catch (e) {
				setUserLoading(false);
				setError("Something went wrong. Please try again.");
			}
		};

		fetchUser();
	}, [userid])

	return (
		<div className="form-container">
			<div className="input-container">
				<p className="details-name">User ID</p>
				<input type="text" value={inputUserId} onChange={e => {setInputUserId(e.target.value)}} placeholder="Enter User ID"/>
				<button className="find-button" onClick={e => {setUserId(inputUserId)}}>Find</button>
				<button className="back-button" onClick={handleBack}>Back</button>
				{userLoading && <img className="loading-animation" src="./loading.gif"/>}
			</div>
			{user &&
			<>
				<div className="details-container">
					<DetailsProperty name="Username"	value={user.username} />
					<DetailsProperty name="First name"	value={user.first_name} />
					<DetailsProperty name="Last name"	value={user.last_name} />
					<DetailsProperty name="E-mail"		value={user.email} />
				</div>
				<button className="borrow-button" onClick={handleBorrow}>Borrow</button>
			</>
			}
		</div>
	)
}

function Toast({type, message, handleClose}) {
	var classname = "";
	switch (type) {
		case 'success':
			classname = 'toast-success';
			break;
		case 'error':
			classname = 'toast-error';
			break;
	}
	return (
		<div className={"toast-container" + " " + classname}>
			<p className="toast-message">{message}</p>
			<button className="toast-button" onClick={handleClose}>Close</button>
		</div>
	)
}

function BorrowForm() {
	const [step, setStep] = useState(1);
	const [itemid, setItemId] = useState(null);
	const [userid, setUserId] = useState(null);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const auth = useContext(AuthContext);

	async function borrowItem() {
		setError(null);

		const payload = {
			borrower_id: parseInt(userid),
			item_id: parseInt(itemid)
		}
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/borrow/', payload, {headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth.authTokens}`,
			}})
			if (response.status === 401) {
				setError("Access denied. Try signing in again.");
			}
			else if (response.data.success) {
				setSuccess("Lending completed!");
				setItemId(null);
				setUserId(null);
				setStep(1);
			}
			else {
				setError("Something went wrong. Please try again.");
			}
		} catch (e) {
			setError("Something went wrong. Please try again.");
			return;
		}
	}

	async function returnItem() {
		setError(null);

		const payload = {
			item_id: parseInt(itemid)
		}
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/return/', payload, {headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth.authTokens}`,
			}})
			if (response.status === 401) {
				setError("Access denied. Try signing in again.");
			}
			else if (response.data.success) {
				setSuccess("Return completed!");
				setItemId(null);
				setUserId(null);
				setStep(1);
			}
			else {
				setError("Something went wrong. Please try again.");
			}
		} catch (e) {
			setError("Something went wrong. Please try again.");
			return;
		}
	}



	return (
		<div className="page-container">
			{success &&
			<Toast type="success" message={success} handleClose={() => setSuccess(null)} />}
			{error &&
				<Toast type="error" message={error} handleClose={() => setError(null)} />}
			{step == 1 &&
				<ItemIdForm
					itemid={itemid}
					setItemId={setItemId}
					setError={setError}
					handleReturn={returnItem}
					handleNext={() => {setStep(2)}}/>}
			{step == 2 &&
				<UserIdForm
					userid={userid}
					setUserId={setUserId}
					setError={setError}
					handleBack={() => {setStep(1)}}
					handleBorrow={borrowItem}/>
			}
		</div>
	)
}



export default BorrowForm;

