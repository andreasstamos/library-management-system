import {Navigate, Route} from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import {useContext} from "react";
import { useNavigate } from "react-router-dom";



const AdminPrivateRoute = ({children}) => {
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);
    if (user?.sub?.role !== 'admin') return <Navigate to='/' />
    return children;
}

export default AdminPrivateRoute;
