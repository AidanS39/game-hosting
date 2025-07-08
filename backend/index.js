require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.post('/api/login', (request, response) => {
    const username = request.body.username
    const password = request.body.password
    if (username === "Aidan" && password === "Stoner") {
        response.status(200).end()
    }
    else {
        response.status(401).end()
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

