import { createContext , useState, useEffect} from 'react'
import jwt_decode from "jwt-decode"
import {useNavigate } from 'react-router-dom';


const AuthContext = createContext();


export const AuthProvider = ({children}) => {    
    const [authTokens, setAuthTokens] = useState( () => localStorage.getItem('authTokens') ? localStorage.getItem('authTokens') : null);
    const [user, setUser] = useState( () => localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null);

    const saveTokens = (tokens) => {
        localStorage.setItem('authTokens', tokens);
    }

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    }

    const checkValid = () => {
        if (!(Date.now()/1000 < user?.exp)) logoutUser();
    }

    const contextData = {
        authTokens: authTokens,
        user: user,
        setUser:setUser,
        setAuthTokens: setAuthTokens,
        logoutUser: logoutUser,
        saveTokens: saveTokens,
        checkValid: checkValid,
    }

    return (
        <AuthContext.Provider  value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;

