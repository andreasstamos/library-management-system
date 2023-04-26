import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth/Auth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import './App.css';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import LibraryEditorPrivateRoute from './utils/LibraryEditorPrivateRoute';
import Dashboard from './pages/lib_editor/Dashboard';
import UsersControl from './pages/lib_editor/UsersControl';


function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
        <Routes>
 
            <Route path='/auth' element={<Auth></Auth>} >
                <Route path='login/' element={<Login />} />
                <Route path='register/' element={<Register />} />
                <Route path='forgot-password/' element={<ForgotPassword />} />
                <Route path='reset-password/:token/' element={<ResetPassword />} />
            </Route>

            <Route path='/lib-editor' element={<LibraryEditorPrivateRoute><Dashboard /></LibraryEditorPrivateRoute>}>
              <Route path='activate-users' element={<UsersControl action={"activate"} />} />
              <Route path='deactivate-users' element={<UsersControl action={"deactivate"}/>} />
            </Route>

        </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
