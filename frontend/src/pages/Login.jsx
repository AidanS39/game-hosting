import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import LoginService from "../services/LoginService"
import { useAuth, useSetAuthValues, useAuthLoading, useSetAuthLoadingValue } from "../contexts/AuthContext"
import LoginForm from "../components/LoginForm"
import CreateAccountForm from "../components/CreateAccountForm"
import CreateAccountService from "../services/CreateAccountService"


const Login = () => {
    const [statusMessage, setStatusMessage] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isCreate, setIsCreate] = useState(false)
    
    const auth = useAuth()
    const setAuthValues = useSetAuthValues()
    const authLoading = useAuthLoading()
    const setAuthLoadingValue = useSetAuthLoadingValue()

    let navigate = useNavigate()

    useEffect(() => {
        if (!authLoading && auth.authorized) { // if user is logged in, redirect to home. user needs to log out before authenticating again
            navigate("/")
        }
    }, [authLoading])

    const displayStatusMessage = (message) => {
        setStatusMessage(message)
        setTimeout(() => {
            setStatusMessage("")
        }, 5000)
    }

    // event handlers
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
            if (error.status === 401 || error.status === 400) {
                displayStatusMessage("Incorrect username or password.")
            }
            else {
                console.log(error)
                displayStatusMessage("Failed to Log in. Please try again later.")
            }
        })
    }

    const handleSubmitCreate = (event) => {
        event.preventDefault()

        CreateAccountService.postCreateAccount({
            username,
            password
        })
        .then(response => {
            setIsCreate(false)
            displayStatusMessage("Account created successfully.")
        })
        .catch(error => {
            if (error.status == 400) {
                displayStatusMessage("Missing username or password.")
            }
            else if (error.status == 422) {
                displayStatusMessage("An account with that username already exists.")
            }
            else {
                console.log(error)
                displayStatusMessage("Failed to create account. Please try again later.")
            }
        })
    }

    const handleCreateAccount = (event) => {
        event.preventDefault()
        setIsCreate(true)
    }

    const handleBackToLogin = (event) => {
        event.preventDefault
        setIsCreate(false)
    }

    return (
        <div>
            <h1>{isCreate ? "Create an Account" : "Login"}</h1>
            <div>
                <p>{statusMessage}</p>
                {isCreate ? 
                <CreateAccountForm
                    username={username} 
                    password={password} 
                    handleUsernameChange={handleUsernameChange} 
                    handlePasswordChange={handlePasswordChange}
                    handleSubmitCreate={handleSubmitCreate}
                    handleBackToLogin={handleBackToLogin} /> :
                <LoginForm 
                    username={username} 
                    password={password} 
                    handleUsernameChange={handleUsernameChange} 
                    handlePasswordChange={handlePasswordChange}
                    handleSubmitLogin={handleSubmitLogin}
                    handleCreateAccount={handleCreateAccount} 
                />}
            </div>
        </div>
    )
}

export default Login