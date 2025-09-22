require("dotenv").config({ path: '../../.env'})

const { Account, createAccount } = require("../../lib/accounts")

const account = createAccount("testName")