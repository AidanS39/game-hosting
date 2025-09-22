require("dotenv").config({ path: '../../.env'})
require('dotenv').config({ path: '../../.env.resources' })

const { Instance, getInstance } = require("../../lib/instances")

async function test_getServers() {
    const instance = await getInstance(1)
    const servers = await instance.getServers()
    console.log(servers)
}

test_getServers()