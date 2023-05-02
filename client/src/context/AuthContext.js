import { createContext , useState, useEffect} from 'react'
import jwt_decode from "jwt-decode"
import {useNavigate } from 'react-router-dom';


const AuthContext = createContext();


export const AuthProvider = ({children}) => {    
    let [authTokens, setAuthTokens] = useState( () => localStorage.getItem('authTokens') ? localStorage.getItem('authTokens') : null);
    let [user, setUser] = useState( () => localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null);
    let [loading, setLoading] = useState(true);

    let saveTokens = (tokens) => {
        localStorage.setItem('authTokens', tokens);
    }

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }
    
    let contextData = {
	authTokens: authTokens,
        user:user,
        setAuthTokens: setAuthTokens,
        logoutUser: logoutUser,
        saveTokens: saveTokens,
    }

    return (
        <AuthContext.Provider  value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;

