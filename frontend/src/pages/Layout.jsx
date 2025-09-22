import { Outlet, NavLink, useNavigate } from "react-router"
import { useEffect, useRef, useState } from "react"
import { useAuth, useSetAuthValues, useAuthLoading } from "../contexts/AuthContext"
import LogoutService from "../services/LogoutService"

const Layout = () => {
    return (
        <>
            <nav className="sticky top-0 flex py-[15px] px-[15%]">
                <div className="relative inline mx-[20px]">
                    <NavLink to="/" className="text-[20px] no-underline text-white hover:text-red-600 hover:cursor-pointer">Home</NavLink>
                </div>
                <div className="relative inline mx-[20px]">
                    <NavLink to="/about" className="text-[20px] no-underline text-white hover:text-red-600 hover:cursor-pointer">About</NavLink>
                </div>
                <div className="relative inline mx-[20px] ml-auto">
                    <NavUser />
                </div>
            </nav>
            <div className="px-[15%]">
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
        return <a className="text-[20px] no-underline text-white hover:text-red-600 hover:cursor-pointer">Loading...</a>
    }
    else if (!auth.authorized) {
        return (
            <NavLink to="/login" className="text-[20px] no-underline text-white hover:text-red-600 hover:cursor-pointer">Login</NavLink>
        )
    }
    else {
        return (
            <>
                <div ref={elementRef}>
                    <a className="text-[20px] no-underline text-white hover:text-red-600 hover:cursor-pointer" onClick={toggleMenuVisibility}>{auth.username}</a>
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
        <div className="select-none absolute top-[40px] w-[200px] h-auto bg-blue-800 border-[4px] grid items-center justify-center">
            <NavLink to="/dashboard" className="text-[15px] no-underline text-white m-2 hover:text-red-600 hover:cursor-pointer" onClick={toggleVisibility}>Dashboard</NavLink>
            <a className="text-[15px] no-underline text-white m-2 hover:text-red-600 hover:cursor-pointer" onClick={handleLogout}>Logout</a>
        </div>
    )
}

export default Layout