import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { useEffect } from 'react'

import Layout from './pages/Layout.jsx'
import Home from './pages/Home.jsx'
import Error from './pages/Error.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AuthRoute from './utils/AuthRoute.jsx'

import AuthService from './services/AuthService.js'
import { useSetAuthValues, useSetAuthLoadingValue } from './contexts/AuthContext.jsx'

const AppRoutes = () => {

    const setAuthValues = useSetAuthValues()
    const setAuthLoadingValue = useSetAuthLoadingValue()

    useEffect(() => {
        AuthService.getValidate()
            .then(response => {
                if (response.status == 200) {
                    const data = response.data
                    setAuthValues(data.authorized, data.username, data.scope)
                }
            })
            .catch(error => {
                if (error.status != 403) {
                    console.log("Error occurred while initially authenticating.")
                }
            })
            .finally(() => {
                setAuthLoadingValue(false)
            })
    }, [])

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route element={<AuthRoute scope="standard" />} >
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                    <Route path="/error" element={<Error />} />
                    <Route path="*" element={<Navigate to="/error" state={{ statusCode: 404, message: "Page not found."}}/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes