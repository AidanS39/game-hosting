import { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth, useSetAuthValues, useAuthLoading } from '../contexts/AuthContext'

const AuthRoute = ({ scope }) => {

    const auth = useAuth()
    const authLoading = useAuthLoading()
    
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

    if (authLoading) {
        return <></>
    }
    return (auth.authorized && inScope) ? <Outlet /> : <Navigate to='/login' />
}

export default AuthRoute