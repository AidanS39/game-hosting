require("dotenv").config({ path: '../../.env'})

const { Account, getAccountByUsername } = require("../../lib/accounts")

async function test_getAccount() {
    const account = await getAccountByUsername("testUsername")
    console.log(account)
}

test_getAccount()