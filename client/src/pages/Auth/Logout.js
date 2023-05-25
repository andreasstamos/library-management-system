import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';

function Logout() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    auth?.logoutUser();
    navigate('/');
    return null;
}

export default Logout;

