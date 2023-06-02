import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth/Auth';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import './App.css';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Logout from './pages/Auth/Logout';
import { AuthProvider } from './context/AuthContext';
import LibraryEditorPrivateRoute from './utils/LibraryEditorPrivateRoute';
import AdminPrivateRoute from './utils/AdminPrivateRoute';
import Dashboard from './pages/lib_editor/Dashboard';
import UsersControl from './pages/lib_editor/UsersControl';
import BorrowForm from './pages/lib_editor/BorrowForm';
import PrivateRoute from './utils/PrivateRoute';
import Landing from './pages/Landing';
import Books from './pages/Books';
import Book from './pages/Book';
import BookAdd from './pages/lib_editor/BookAdd';
import ReviewControl from './pages/lib_editor/ReviewControl';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddSchool from './pages/admin/school/AddSchool';
import LibUsersControl from './pages/admin/library_editors/LibUsersControl';
import NotFound404 from './pages/NotFound404';
import SchoolDashboard from './pages/admin/school/SchoolDashboard';
import AllSchools from './pages/admin/school/AllSchools';
import Profile from './pages/Profile';
import LibraryUsersControlDashboard from './pages/admin/library_editors/LibraryUsersControlDashboard';
import AddLibraryEditor from './pages/admin/library_editors/AddLibraryEditor';
import AdminMenu from './pages/admin/AdminMenu';
import MyBorrows from './pages/MyBorrows';
import Bookings from './pages/lib_editor/Bookings';
import Borrows from './pages/lib_editor/Borrows';
import Queries from './pages/admin/Queries';
import Admin_3_1_1 from './pages/admin/queries/Admin_3_1_1';
import Admin_3_1_2 from './pages/admin/queries/Admin_3_1_2';
import Admin_3_1_3 from './pages/admin/queries/Admin_3_1_3';
import Admin_3_1_4 from './pages/admin/queries/Admin_3_1_4';
import Admin_3_1_5 from './pages/admin/queries/Admin_3_1_5';
import Admin_3_1_6 from './pages/admin/queries/Admin_3_1_6';
import Admin_3_1_7 from './pages/admin/queries/Admin_3_1_7';
import DelayedReturns from './pages/lib_editor/DelayedReturns';
import AverageRatings from './pages/lib_editor/AverageRatings';
import AuthorControl from './pages/lib_editor/AuthorControl';
import CategoryControl from './pages/lib_editor/CategoryControl';
import KeywordControl from './pages/lib_editor/KeywordControl';
import PublisherControl from './pages/lib_editor/PublisherControl';
import Backup from './pages/admin/Backup';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>

            <Route path='/' element={<PrivateRoute><Landing/></PrivateRoute>}>
              <Route index path='' element={<PrivateRoute><Books/></PrivateRoute>} />
              <Route path='/book/:bookISBN' element={<PrivateRoute><Book/></PrivateRoute>} />
              <Route path='/profile/' element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path='/my-borrows/' element={<PrivateRoute><MyBorrows /></PrivateRoute>} />

              <Route path='/404' element={<NotFound404 />} />
            </Route>

            <Route path='/auth' element={<Auth></Auth>} >
              <Route path='login/' element={<Login />} />
              <Route path='register/' element={<Register />} />
              <Route path='forgot-password/' element={<ForgotPassword />} />
              <Route path='reset-password/:token/' element={<ResetPassword />} />
              <Route path='logout/' element={<Logout />} />
            </Route>

            <Route path='/lib-editor' element={<LibraryEditorPrivateRoute><Dashboard /></LibraryEditorPrivateRoute>}>
              <Route path='users-control' element={<UsersControl/>} />
              <Route path='reviews' element={<ReviewControl />} />
              <Route path='bookings/' element={<Bookings />} />
              <Route path='borrows/' element={<Borrows />} />
              <Route path='delayed-returns/' element={<DelayedReturns />} />
              <Route path='average-ratings/' element={<AverageRatings />} />
              <Route path='lend-return/' element={<BorrowForm />} />
              <Route path='book-control/' element={<BookAdd />} />
              <Route path='authors-control' element={<AuthorControl />} />
              <Route path='category-control' element={<CategoryControl />} />
              <Route path='keywords-control/' element={<KeywordControl />} />
              <Route path='publisher-control/' element={<PublisherControl />} />
            </Route>

            <Route path='/admin' element={<AdminPrivateRoute><AdminDashboard /></AdminPrivateRoute>}>
              <Route index element={<AdminMenu />} />
              <Route path='authors/' element={<AuthorControl />} />
              <Route path='categories/' element={<CategoryControl />} />
              <Route path='keywords/' element={<KeywordControl />} />
              <Route path='backup-restore/' element={<Backup />} />


              <Route path='schools/' element={<SchoolDashboard/>}>
                  <Route path='add-school/' element={<AddSchool/>} />
                  <Route path='all-schools/' element={<AllSchools/>} />

              </Route>
             
              <Route path='lib-editors/' element={<LibraryUsersControlDashboard />}>
                  <Route path='all-lib-editors/' element={<LibUsersControl />} />
                  <Route path='add-lib-editor/' element={<AddLibraryEditor />} />
              </Route>
              <Route path='queries/' element={<Queries />} >
                <Route path='3_1_1/' element={<Admin_3_1_1/>} />
                <Route path='3_1_2/' element={<Admin_3_1_2/>} />
                <Route path='3_1_3/' element={<Admin_3_1_3/>} />
                <Route path='3_1_4/' element={<Admin_3_1_4/>} />
                <Route path='3_1_5/' element={<Admin_3_1_5/>} />
                <Route path='3_1_6/' element={<Admin_3_1_6/>} />
                <Route path='3_1_7/' element={<Admin_3_1_7/>} />

              </Route>

              {/* <Route path='activate-library-editors' element={<LibUsersControl />} /> */}
            
            </Route>

            <Route path='*' element={<Navigate to='/404' />}/>

          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
