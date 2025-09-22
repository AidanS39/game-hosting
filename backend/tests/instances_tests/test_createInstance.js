require("dotenv").config({ path: '../../.env'})
require('dotenv').config({ path: '../../.env.resources' })

const { Instance, createInstance } = require("../../lib/instances")

async function test_createInstance() {
    const instance = await createInstance()
    console.log(instance)
}

test_createInstance()