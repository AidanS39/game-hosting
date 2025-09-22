require("dotenv").config({ path: '../../.env'})
require('dotenv').config({ path: '../../.env.resources' })

const { Instance, getInstance } = require("../../lib/instances")

async function test_getInstance() {
    const instance = await getInstance(1)
    console.log(instance)
}

test_getInstance()