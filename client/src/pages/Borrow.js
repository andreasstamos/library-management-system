import React, {useState, useContext} from 'react';
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

function ItemIdForm({state, setState}) {
	const handleItemIdChange = e => setState({...state, item_id: e.target.value});
	const handleNext = e => setState({...state, step: 2});
	const auth = useContext(AuthContext);
	
	async function handleFind(e) {
		const payload = {
			item_id: parseInt(state.item_id)
		};
		setState((state) => ({...state, item: null, itemLoading: true, showError: false, last_error_message: null}));
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/get-details/', payload, {headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth.authTokens}`,
			}});
			if (!response.data.success) throw 0;
			if (response.data.item) {
				setState((state) => ({...state, item: {...response.data.item, itemLoading: false, item_id: state.item_id}}));
			}
			else setState((state) => ({...state, itemLoading: false, showError: true, last_error_message: "No item found"}));
			return;
		} catch (e) {
			setState((state) => ({...state, itemLoading: false, showError: true, last_error_message: "Something went wrong. Please try again."}));
			return;
		}
	}

	return (
		<div className="form-container">
			<div className="input-container">
				<input type="text" value={state.item_id} onChange={handleItemIdChange} placeholder="Enter Item ID"/>
				<button className="find-button" onClick={handleFind}>Find</button>
			</div>
			{state.item &&
			<>
				<div className="details-container">
					<DetailsProperty name="ISBN" 		value={state.item.isbn} />
					<DetailsProperty name="Title" 		value={state.item.title} />
					<DetailsProperty name="Author" 		value={state.item.authors.join(", ")} />
					<DetailsProperty name="Publisher" 	value={state.item.publisher_name} />
					<DetailsProperty name="Categories" 	value={state.item.categories.join(", ")} />
					<DetailsProperty name="Keywords" 	value={state.item.keywords.join(", ")} />
				</div>
				<button className="next-button" onClick={handleNext}>Next</button>
			</>
			}
		</div>
	)
}

function UserIdForm({state, setState}) {
	const handleUserIdChange = e => setState({...state, user_id: e.target.value});
	const handleBack = e => setState({...state, step: 1});

	async function handleFind(e) {
		const payload = {
			user_id: parseInt(state.user_id)
		};
		const response = await axios.post('http://127.0.0.1:5000/user/get-details/', payload, {headers: {
			'Content-Type': 'application/json',
		}});

		if (response.status !== 200) {
			console.log("API request failed with status code: ", response.status)
			return;
		}
		if (response.data.user) {
			setState({...state, user: {...response.data.user, user_id: state.user_id}});
		}
		return;
	}

	async function handleBorrow(e) {
		if (!state.user || !state.item) return;
		const payload = {
			borrower_id: parseInt(state.user.user_id),
			item_id: parseInt(state.item.item_id)
		}
		try {
			const response = await axios.post('http://127.0.0.1:5000/item/borrow/', payload, {headers: {
				'Content-Type': 'application/json',
			}, validateStatus: (status) => status === 200})
			if (response.data.success) {
				setState({...state, showCompleted: true, step: 1, user: null, item: null, user_id: null, item_id: null});
			}

		} catch (e) {
			if (e.status === 401) {
				setState({...state, showError: true, last_error_message: "Access denied. Try signing in again."});
				return;
			}
			setState({...state, showError: true, last_error_message: "Something went wrong. Please try again."});
			return;
		}
		/*if (response.status !== 200) {
			console.log("API request failed with status code: ", response.status)
			return;
		}*/
	}

	return (
		<div className="form-container">
			<div className="input-container">
				<input type="text" value={state.user_id} onChange={handleUserIdChange} placeholder="Enter User ID"/>
				<button className="find-button" onClick={handleFind}>Find</button>
				<button className="back-button" onClick={handleBack}>Back</button>
			</div>
			{state.user &&
			<>
				<div className="details-container">
					<DetailsProperty name="Username"	value={state.user.username} />
					<DetailsProperty name="First name"	value={state.user.first_name} />
					<DetailsProperty name="Last name"	value={state.user.last_name} />
					<DetailsProperty name="E-mail"		value={state.user.email} />
				</div>
				<button className="borrow-button" onClick={handleBorrow}>Borrow</button>
			</>
			}
		</div>
	)
}

function CompletedToast({state, setState}) {
	const handleClose = e => setState({...state, showCompleted: false});
	if (!state.showCompleted) return null;
	return (
		<div className="toast-container toast-completed">
			<p className="toast-message">Borrowing completed!</p>
			<button className="toast-button" onClick={handleClose}>Close</button>
		</div>
	)
}


function ErrorToast({state, setState}) {
	const handleClose = e => setState({...state, showError: false});
	if (!state.showError) return null;
	return (
		<div className="toast-error toast-container toast-error">
			<p className="toast-message">{state.last_error_message}</p>
			<button className="toast-button" onClick={handleClose}>Close</button>
		</div>
	)
}




function BorrowStep({state, setState}) {
	switch (state.step) {
		case 1:
			return (<ItemIdForm state={state} setState={setState} />);
			break;
		case 2:
			return (<UserIdForm state={state} setState={setState} />);
			break;
	}
}

function BorrowForm() {
	const [state, setState] = useState({
		item_id: "",
		user_id: "",
		step: 1
	})

	return (
		<div className="page-container">
			<CompletedToast state={state} setState={setState} />
			<ErrorToast state={state} setState={setState} />
			<BorrowStep state={state} setState={setState} />
		</div>
	)
}



export default BorrowForm;

