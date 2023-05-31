import {Navigate, Route} from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import {useContext} from "react";
import { useNavigate } from "react-router-dom";



const AdminPrivateRoute = ({children}) => {
    const navigate = useNavigate();
    const {user, checkValid} = useContext(AuthContext);

    checkValid();

    if (user?.sub?.role !== 'admin') return <Navigate to='/' />
    return children;
}

export default AdminPrivateRoute;
