const CreateAccountForm = ({ username, password, handleUsernameChange, handlePasswordChange, handleSubmitCreate, handleBackToLogin }) => {
    return (
        <div>
            <form onSubmit={handleSubmitCreate}>
                <div className="login-container">
                    <input type="text" name="username" id="username" value={username} placeholder="username" onChange={handleUsernameChange} />
                    <input type="password" name="password" id="password" value={password} placeholder="password" onChange={handlePasswordChange} />
                </div>
                <button type="submit">Create Account</button>
            </form>
            <button onClick={handleBackToLogin}>Back to Login</button>
        </div>
    )
}

export default CreateAccountForm