import React, { useContext, useState } from 'react'

const AuthContext = React.createContext()
const SetAuthValuesContext = React.createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const useSetAuthValues = () => {
    return useContext(SetAuthValuesContext)
}

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ 
        authorized: false, 
        username: "", 
        scope: ""
    })

    const setAuthValues = (authorized, username, scope) => {
        setAuth({
            authorized: authorized, 
            username: username, 
            scope: scope
        })
    }

    return (
        <AuthContext.Provider value={auth}>
            <SetAuthValuesContext.Provider value={setAuthValues}>
                {children}
            </SetAuthValuesContext.Provider>
        </AuthContext.Provider>
    )
}