const { Account } = require("../lib/accounts")

const account = new Account(20, "testName")
const server = account.createServer("testName", 2048, 8196, "PAPER", "LATEST")
console.log(server)