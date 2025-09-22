require('dotenv').config()
require('dotenv').config({ path: '.env.resources' })
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda")
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const { Account, createAccount, getAccount } = require('./lib/accounts')
const HttpError = require('./util/HttpError')
const isNullOrEmpty = require('./util/IsNullOrEmpty')
const path = require('node:path')

const saltRounds = 10

let refreshTokens = []

const app = express()

app.use(cors())
app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json())
app.use(cookieParser())

const authenticateToken = async (request, response, next) => {
    try {
        jwt.verify(request.cookies.accessToken, process.env.JWT_ACCESS_KEY, (accessTokenError, decodedAccessToken) => {
            if (accessTokenError) {
                if (accessTokenError.name != 'TokenExpiredError' && accessTokenError.name != 'JsonWebTokenError') {
                    refreshTokens = refreshTokens.filter(token => token !== request.cookies.refreshToken)

                    response.clearCookie('accessToken')
                    response.clearCookie('refreshToken')
                    throw new HttpError(accessTokenError.message, 500)
                }
                else { // access token is invalid or missing, try to refresh access token 
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

    if (isNullOrEmpty(username) || isNullOrEmpty(password)) {
        return response.status(400).end()
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

        return response.status(200).json({
            authorized: true,
            username: username,
            scope: responsePayload.scope
        })
    }
    catch (error) {
        next(error)
    }
})

app.get('/api/validate', authenticateToken, (request, response, next) => {
    return response.status(200).json({
        authorized: true,
        username: request.username,
        scope: request.scope
    })
})

app.delete('/api/logout', (request, response, next) => {
    refreshTokens = refreshTokens.filter(token => token !== request.cookies.refreshToken)

    response.clearCookie('accessToken')
    response.clearCookie('refreshToken')
    response.status(204).end()
})

app.post('/api/createLogin', async (request, response, next) => {
    const username = request.body.username
    const password = request.body.password

    try {
        if (isNullOrEmpty(username) || isNullOrEmpty(password)) {
            throw new HttpError("Missing username or password.", 400)
        }

        newAccount = await createAccount(username)
        const id = newAccount.id
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const client = new LambdaClient()
        const command = new InvokeCommand({
            FunctionName: "CreateLoginForGameHostingWebsite",
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
                username: username,
                password: hashedPassword,
                id: id
            })
        })
        const loginResponse = await client.send(command)
        const parsedResponse = JSON.parse(Buffer.from(loginResponse.Payload).toString())
        console.log(parsedResponse)

        if (parsedResponse.statusCode != 200) {
            throw new HttpError(parsedResponse.error, parsedResponse.statusCode)
        }
        return response.status(200).end()
    }
    catch (error) {
        next(error)
    }
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
    console.log(error)
    return response.status(500).end()
})

// catch all
app.use((request, response, next) => {
    response.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

