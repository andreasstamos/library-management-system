import {Navigate, Route} from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import {useContext} from "react";
import { useNavigate } from "react-router-dom";



const PrivateRoute = ({children}) => {
    const navigate = useNavigate();
    let {user} = useContext(AuthContext);
    console.log(user);
    if (!user) return <Navigate to='/auth/login/' />
    if (user?.sub?.role === 'admin') return <Navigate to='/admin/' />
    return children;
}


export default PrivateRoute;