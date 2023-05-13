import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import BorrowForm from './pages/Borrow';
import PrivateRoute from './utils/PrivateRoute';
import Landing from './pages/Landing';
import Books from './pages/Books';
import Book from './pages/Book';
import ReviewActivate from './pages/lib_editor/ReviewActivate';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddSchool from './pages/admin/school/AddSchool';
import LibUsersControl from './pages/admin/LibUsersControl';
import NotFound404 from './pages/NotFound404';
import SchoolDashboard from './pages/admin/school/SchoolDashboard';
import AllSchools from './pages/admin/school/AllSchools';
import Profile from './pages/Profile';


function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>

            <Route path='/' element={<PrivateRoute><Landing/></PrivateRoute>}>
              <Route path='/books' element={<PrivateRoute><Books/></PrivateRoute>} />
              <Route path='/book/:bookISBN' element={<PrivateRoute><Book/></PrivateRoute>} />
              <Route path='/lend-return/' element={<PrivateRoute><BorrowForm/></PrivateRoute>} />
              <Route path='/profile/' element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path='/404' element={<NotFound404 />} />

            </Route>

            <Route path='/auth' element={<Auth></Auth>} >
              <Route path='login/' element={<Login />} />
              <Route path='register/' element={<Register />} />
              <Route path='forgot-password/' element={<ForgotPassword />} />
              <Route path='reset-password/:token/' element={<ResetPassword />} />
            </Route>

            <Route path='/lib-editor' element={<LibraryEditorPrivateRoute><Dashboard /></LibraryEditorPrivateRoute>}>
              <Route path='activate-users' element={<UsersControl action={"activate"} />} />
              <Route path='deactivate-users' element={<UsersControl action={"deactivate"}/>} />
              <Route path='activate-reviews' element={<ReviewActivate />} />
            </Route>

            <Route path='/admin' element={<AdminDashboard />}>
              <Route path='schools/' element={<SchoolDashboard/>}>
                  <Route path='add-school/' element={<AddSchool/>} />
                  <Route path='all-schools/' element={<AllSchools/>} />

              </Route>
              <Route path='activate-library-editors' element={<LibUsersControl />} />
            </Route>

            <Route path='*' element={<Navigate to='/404' />}/>

          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
