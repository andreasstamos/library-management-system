import {Navigate, Route} from 'react-router-dom';
import  AuthContext  from '../context/AuthContext';
import {useContext} from "react";
import { useNavigate } from "react-router-dom";



const PrivateRoute = ({children}) => {
    const navigate = useNavigate();
    const {user, checkValid} = useContext(AuthContext);

    checkValid();
    
    if (!user) return <Navigate to='/auth/login/' />
    if (user?.sub?.role === 'admin') return <Navigate to='/admin/' />
    // if (user?.sub?.role === 'lib_editor') return <Navigate to='/lib-editor/' />
    return children;
}


export default PrivateRoute;
