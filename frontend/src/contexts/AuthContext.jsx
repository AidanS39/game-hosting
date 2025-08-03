import React, { useContext, useState } from 'react'

const AuthLoadingContext = React.createContext()
const SetAuthLoadingValueContext = React.createContext()
const AuthContext = React.createContext()
const SetAuthValuesContext = React.createContext()

export const useAuthLoading = () => {
    return useContext(AuthLoadingContext)
}

export const useSetAuthLoadingValue = () => {
    return useContext(SetAuthLoadingValueContext)
}

export const useAuth = () => {
    return useContext(AuthContext)
}

export const useSetAuthValues = () => {
    return useContext(SetAuthValuesContext)
}

export const AuthProvider = ({ children }) => {
    const [authLoading, setAuthLoading] = useState(true)
    const [auth, setAuth] = useState({ 
        authorized: false, 
        username: "", 
        scope: ""
    })

    const setAuthLoadingValue = (isLoading) => {
        setAuthLoading(isLoading)
    }

    const setAuthValues = (authorized, username, scope) => {
        setAuth({
            authorized: authorized, 
            username: username, 
            scope: scope
        })
    }

    return (
        <AuthLoadingContext.Provider value={authLoading}>
            <SetAuthLoadingValueContext.Provider value={setAuthLoadingValue}>
                <AuthContext.Provider value={auth}>
                    <SetAuthValuesContext.Provider value={setAuthValues}>
                        {children}
                    </SetAuthValuesContext.Provider>
                </AuthContext.Provider>
            </SetAuthLoadingValueContext.Provider>
        </AuthLoadingContext.Provider>
    )
}