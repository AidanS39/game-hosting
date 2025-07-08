import { Outlet, NavLink } from "react-router"

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
                    <NavLink to="/login" className="nav-link">Login</NavLink>
                </div>
            </nav>
            <div className="content">
                <Outlet />
            </div>
        </>
    )
}

export default Layout