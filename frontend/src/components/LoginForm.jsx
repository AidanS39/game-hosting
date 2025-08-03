const LoginForm = ({ username, password, handleUsernameChange, handlePasswordChange, handleSubmitLogin, handleCreateAccount }) => {
    return (
        <div>
            <form onSubmit={handleSubmitLogin}>
                <div className="login-container">
                    <input type="text" name="username" id="username" value={username} placeholder="username" onChange={handleUsernameChange} />
                    <input type="password" name="password" id="password" value={password} placeholder="password" onChange={handlePasswordChange} />
                </div>
                <button type="submit">Login</button>
            </form>
            <p>New to GameHoster? <button onClick={handleCreateAccount}>Create Account</button></p>
        </div>
    )
}

export default LoginForm
