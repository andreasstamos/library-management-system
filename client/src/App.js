import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth/Auth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import './App.css';
import ForgotPassword from './pages/Auth/ForgotPassword';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
 
            <Route path='/auth' element={<Auth></Auth>} >
                <Route path='login/' element={<Login />} />
                <Route path='register/' element={<Register />} />
                <Route path='forgot-password/' element={<ForgotPassword />} />

            </Route>

        </Routes>
      </Router>
    </div>
  );
}

export default App;
