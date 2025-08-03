import { Outlet, NavLink, useNavigate } from "react-router"
import { useEffect, useRef, useState } from "react"
import { useAuth, useSetAuthValues, useAuthLoading } from "../contexts/AuthContext"
import LogoutService from "../services/LogoutService"

const Layout = () => {
    return (
        <>
            <nav className="navbar">
                <div className="nav-item">
                    <NavLink to="/" className="nav-link">Home</NavLink>
                </div>
                <div className="nav-item">
                    <NavLink to="/about" className="nav-link">About</NavLink>
                </div>
                <div className="nav-item nav-login">
                    <NavUser />
                </div>
            </nav>
            <div className="content">
                <Outlet />
            </div>
        </>
    )
}

const NavUser = () => {
    const [menuVisible, setMenuVisible] = useState(false)

    const auth = useAuth()
    const authLoading = useAuthLoading()

    const elementRef = useRef(null)
    
    useEffect(() => {
        document.addEventListener("mousedown", handleOutsideMenuClick)
        return () => {
            document.removeEventListener("mousedown", handleOutsideMenuClick)
        }
    }, [])
    
    const handleOutsideMenuClick = (event) => {
        if (elementRef.current && !elementRef.current.contains(event.target)) {
            setMenuVisible(false)
        }
    }

    const toggleMenuVisibility = () => {
        setMenuVisible(!menuVisible)
    }

    if (authLoading) {
        return <a className="nav-link">Loading...</a>
    }
    else if (!auth.authorized) {
        return (
            <NavLink to="/login" className="nav-link">Login</NavLink>
        )
    }
    else {
        return (
            <>
                <div ref={elementRef}>
                    <a className="nav-link" onClick={toggleMenuVisibility}>{auth.username}</a>
                    {menuVisible && (
                        <NavUserMenu toggleVisibility={toggleMenuVisibility} />
                    )}
                </div>
            </>
        )
    }
}

const NavUserMenu = ({ toggleVisibility }) => {
    const setAuthValues = useSetAuthValues()
    let navigate = useNavigate()

    const handleLogout = (event) => {
        toggleVisibility()
        LogoutService.deleteLogout()
            .then(status => {
                if (status != 204) {
                    console.log(status)
                    throw {
                        status: status,
                        message: "Error occurred when logging out."
                    }
                }
                navigate('/')
            })
            .catch(error => {
                console.log(error)
                navigate('/error', { 
                    state: {
                        statusCode: error.status ?? 500, 
                        message: error.message
                    }
                })
            })
            .finally(() => {
                setTimeout(() => setAuthValues(false, "", ""), 0)
                
            })
    }
    return (
        <div className="nav-menu">
            <NavLink to="/dashboard" className="nav-menu-link" onClick={toggleVisibility}>Dashboard</NavLink>
            <a className="nav-menu-link" onClick={handleLogout}>Logout</a>
        </div>
    )
}

export default Layout