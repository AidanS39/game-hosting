require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda")
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const HttpError = require('./HttpError')

const saltRounds = 10

let refreshTokens = []

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(cookieParser())

const authenticateToken = async (request, response, next) => {
    try {
        jwt.verify(request.cookies.accessToken, process.env.JWT_ACCESS_KEY, (accessTokenError, decodedAccessToken) => {
            if (accessTokenError && accessTokenError.name == 'JsonWebTokenError') {
                refreshTokens = refreshTokens.filter(token => token !== request.cookies.refreshToken)

                response.clearCookie('accessToken')
                response.clearCookie('refreshToken')
                throw new HttpError(accessTokenError.message, 403)
            }
            else if (accessTokenError && accessTokenError.name != 'TokenExpiredError') {
                refreshTokens = refreshTokens.filter(token => token !== request.cookies.refreshToken)

                response.clearCookie('accessToken')
                response.clearCookie('refreshToken')
                throw new HttpError(accessTokenError.message, 500)
            }
            else if (accessTokenError && accessTokenError.name == 'TokenExpiredError') {
                if (!refreshTokens.includes(request.cookies.refreshToken)) {
                    response.clearCookie('accessToken')
                    response.clearCookie('refreshToken')
                    throw new HttpError(accessTokenError.message, 403)
                }
                // refresh the access token
                jwt.verify(request.cookies.refreshToken, process.env.JWT_REFRESH_KEY, async (refreshTokenError, decodedRefreshToken) => {
                    if (refreshTokenError) {
                        throw new HttpError(refreshTokenError.message, 403)
                    }

                    const newAccessToken = await jwt.sign({ 
                        username: decodedRefreshToken.username,
                        scope: decodedRefreshToken.scope
                     }, process.env.JWT_ACCESS_KEY, { expiresIn: '30s'})

                    request.username = decodedRefreshToken.username
                    request.scope = decodedRefreshToken.scope
                    
                    response.cookie('accessToken', newAccessToken, {
                        maxAge: 30000,
                        httpOnly: true,
                        secure: true,
                        sameSite: true
                    })

                    next()
                })
            }
            else {
                request.username = decodedAccessToken.username
                request.scope = decodedAccessToken.scope

                next()
            }
        })
    }
    catch (error) {
        next(error)
    }
}

app.post('/api/login', async (request, response, next) => {
    const username = request.body.username
    const password = request.body.password

    if (username == null || password == null) {
        return response.status(401).end()
    }

    const client = new LambdaClient()
    const input = {
        FunctionName: "LoginToGameHostingWebsite",
        InvocationType: "RequestResponse",
        Payload: JSON.stringify({
            username: username
        })
    }

    const command = new InvokeCommand(input)

    try {
        const loginResponse = await client.send(command)

        const responsePayload = JSON.parse(Buffer.from(loginResponse.Payload).toString())
        
        if (responsePayload.statusCode != 200 || responsePayload.password == undefined) {
            throw new HttpError("Incorrect username.", 400)
        }

        const passwordCorrect = await bcrypt.compare(password, responsePayload.password)
        if (!passwordCorrect) {
            throw new HttpError("Incorrect password.", 401)
        }

        const accessToken = await jwt.sign({ 
            username: username,
            scope: responsePayload.scope
         }, process.env.JWT_ACCESS_KEY, { expiresIn: '30s' })

        const refreshToken = await jwt.sign({ 
            username: username,
            scope: responsePayload.scope
         }, process.env.JWT_REFRESH_KEY, { expiresIn: '1h' })
        
        if (!refreshTokens.includes(refreshToken)) {
            refreshTokens.push(refreshToken)
        }
        
        response.cookie('accessToken', accessToken, {
            maxAge: 30000,
            httpOnly: true,
            secure: true,
            sameSite: true
        })

        response.cookie('refreshToken', refreshToken, {
            maxAge: 3600000,
            httpOnly: true,
            secure: true,
            sameSite: true
        })

        return response.status(200).end()
    }
    catch (error) {
        next(error)
    }
})

app.delete('/api/logout', (request, response, next) => {
    refreshTokens = refreshTokens.filter(token => token !== request.cookies.refreshToken)

    response.clearCookie('accessToken')
    response.clearCookie('refreshToken')
    response.status(204).end()
})

app.post('/api/createLogin', (request, response, next) => {
    const username = request.body.username
    const password = request.body.password

    if (username == null || password == null) {
        return response.status(401).end()
    }

    bcrypt.hash(password, saltRounds)
        .then(hashedPassword => {
            console.log(hashedPassword)
            const client = new LambdaClient()
                const input = {
                    FunctionName: "CreateLoginForGameHostingWebsite",
                    InvocationType: "RequestResponse",
                    Payload: JSON.stringify({
                        username: username,
                        password: hashedPassword
                    })
                }

                const command = new InvokeCommand(input)
                client.send(command)
                    .then(loginResponse => {
                        const parsedResponse = JSON.parse(Buffer.from(loginResponse.Payload).toString())
                        const statusCode = parsedResponse.statusCode
                        return response.status(statusCode).end()
                    })
                    .catch(error => {
                        console.log(error)
                        return response.status(401).end()
                    })
        })
        .catch(error => {
            console.log(error)
            return response.status(401).end()
        })
})

app.get('/api/dashboard', authenticateToken, (request, response, next) => {
    console.log("username: " + request.username)
    console.log("scope: " + request.scope)
    response.status(200).end()
})

// error handling
app.use((error, request, response, next) => {
    if (error instanceof HttpError) {
        console.log(error.message)
        return response.status(error.statusCode).end()
    }
    console.log('unknown error handled')
    console.log(error)
    return response.status(500).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

