import {Navigate, Route} from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import {useContext} from "react";
import jwtDecode from 'jwt-decode';
import { useNavigate } from "react-router-dom";



const LibraryEditorPrivateRoute = ({children}) => {
    const navigate = useNavigate();
    let {user} = useContext(AuthContext);
    if (!user) return < Navigate to='/auth/login/' />
    if (user?.sub?.role !== 'lib_editor') return <Navigate to='/books/' />
    return children;
}

export default LibraryEditorPrivateRoute;