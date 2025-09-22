require("dotenv").config({ path: '../../.env'})

const { Account, getServersByUsername } = require("../../lib/accounts")

async function test_getServersByUsername() {
    const servers = await getServersByUsername("testName")
    console.log(servers)
}

test_getServersByUsername()