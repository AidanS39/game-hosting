require("dotenv").config({ path: '../../.env'})

const { Account, createAccount, createServer } = require("../../lib/accounts")

async function test_createServer() {
    const account = await createAccount("testName")
    const server = await account.createServer("testName", 2048, 8196, "PAPER", "LATEST")
    console.log("server: ")
    console.log(server)
}

test_createServer()