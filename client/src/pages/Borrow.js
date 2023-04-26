import React, {useState} from 'react';
import axios from 'axios';
import './Borrow.css';

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

	async function handleFind(e) {
		const payload = {
			item_id: parseInt(state.item_id)
		};
		const response = await axios.post('http://127.0.0.1:5000/item/get-details/', payload, {headers: {
			'Content-Type': 'application/json',
		}});

		console.log(response);
		if (response.status !== 200) {
			console.log("API request failed with status code: ", response.status)
			return;
		}
		if (response.data.item) {
			setState({...state, item: {...response.data.item, item_id: state.item_id}});
		}
		return;
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
	//const handleBorrow = e => setState({...state, showCompleted: true, step: 1, item: null, user: null});
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
		const response = await axios.post('http://127.0.0.1:5000/item/borrow/', payload, {headers: {
			'Content-Type': 'application/json',
		}});
		
		if (response.status !== 200) {
			console.log("API request failed with status code: ", response.status)
			return;
		}
		if (response.data.success) {
			setState({...state, showCompleted: true, step: 1, user: null, item: null, user_id: null, item_id: null});
		}
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
		<div class="toast-container">
			<p class="toast-message">Borrowing completed!</p>
			<button class="toast-button" onClick={handleClose}>Close</button>
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
		step: 1
	})

	return (
		<div className="page-container">
			<CompletedToast state={state} setState={setState} />
			<BorrowStep state={state} setState={setState} />
		</div>
	)
}



export default BorrowForm;

