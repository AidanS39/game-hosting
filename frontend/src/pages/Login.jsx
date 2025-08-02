import { useState } from "react"
import { useNavigate } from "react-router"
import LoginService from "../services/LoginService"
import { useAuth, useSetAuthValues } from "../contexts/AuthContext"


const Login = () => {
    const [statusMessage, setStatusMessage] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    
    const auth = useAuth()
    const setAuthValues = useSetAuthValues()

    let navigate = useNavigate()

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handleSubmitLogin = (event) => {
        event.preventDefault()
        LoginService.postLogin({
            username,
            password
        })
        .then(response => {
            setAuthValues(true, response.username, response.scope)
            navigate("/dashboard")
        })
        .catch(error => {
            if (error.status === 401) {
                setStatusMessage("Invalid username or password.")
            }
            else {
                console.log(error)
                setStatusMessage("Failed to Log in. Please try again later.")
            }
        })
    }

    return (
        <div>
            <h1>Login</h1>
            <div>
                <p>{statusMessage}</p>
                <form onSubmit={handleSubmitLogin}>
                    <div className="login-container">
                        <input type="text" name="username" id="username" value={username} placeholder="username" onChange={handleUsernameChange} />
                        <input type="password" name="password" id="password" value={password} placeholder="password" onChange={handlePasswordChange} />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login