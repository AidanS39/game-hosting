import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth, useSetAuthValues } from '../contexts/AuthContext'
import AuthService from '../services/AuthService'

const AuthRoute = ({ scope }) => {

    const auth = useAuth()
    
    const roles = auth.scope.split(" ")
    let inScope = false
    if (scope == null) { // if no scope specified, allow all roles
        inScope = true
    }
    else {
        scope.split(" ").forEach(role => {
            if (roles.includes(role)) {
                inScope = true
            }
        })
    }
    
    return (auth.authorized && inScope) ? <Outlet /> : <Navigate to='/login' />
}

export default AuthRoute