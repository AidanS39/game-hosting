require("dotenv").config({ path: '../../.env'})

const { Account, getAccount } = require("../../lib/accounts")

async function test_getServers() {
    const account = await getAccount(38)
    const servers = await account.getServers()
    console.log(servers)
}

test_getServers()