const { Account, getAccount } = require("../lib/accounts")

async function test_getAccount() {
    const account = await getAccount(23)
    console.log(account)
}

test_getAccount()