require("dotenv").config({ path: '../.env'})

const { EC2Client, CreateVolumeCommand, EC2ServiceException } = require("@aws-sdk/client-ec2")
const { Client } = require("pg")

const { Server } = require("./servers")
const HttpError = require("../util/HttpError")

const dbInfo = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD.toString(),
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
}

class Account {
    constructor(id, username) {
        this.id = id
        this.username = username
        this.servers = []
    }

    // creates a server
    // 1. create ebs volume
    // 2. add server entry to db
    async createServer(name, cpu, memory, type, version) {

        // 1. create ebs volume
        const volumeId = await createEBSVolume()
        console.log(volumeId)
        
        // 2. add server entry to db
        const client = new Client(dbInfo)
        
        let id;

        await client.connect()
        try {
            const query = {
                text: `INSERT INTO servers (name, cpu, memory, type, version, volume_id, account_id) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7)
                       RETURNING id`,
                values: [name, cpu, memory, type, version, volumeId, this.id]
            }
            const response = await client.query(query)
            id = response.rows[0].id
        }
        catch (error) {
            console.log("Error occurred when inserting server into database: " + error)
        }
        await client.end()

        const newServer = new Server(id, name, cpu, memory, type, version, volumeId, this.id)
        this.servers.push(newServer)

        return newServer
    }
}

async function createAccount(username) {
    const client = new Client(dbInfo)
    await client.connect()

    let id;
    try {
        const query = {
            text: `INSERT INTO accounts (username) 
                   VALUES ($1) 
                   RETURNING id`,
            values: [username]
        }
        const response = await client.query(query)
        id = response.rows[0].id
    }
    catch (error) {
        throw new HttpError("Error occurred when inserting account into database: " + error, 500)
    }
    await client.end()

    const newAccount = new Account(id, username)

    return newAccount
}

async function createEBSVolume() {
    const client = new EC2Client()
    const command = new CreateVolumeCommand(
        {
            AvailabilityZone: "us-east-1a",
            VolumeType: "gp3",
            Size: 20,
            DryRun: true
        }
    )

    try {
        const response = await client.send(command)
        if (response.state == "error") {
            throw new EC2ServiceException()
        }
        else {
            return response.volumeId
        }
    }
    catch (error) {
        if (error instanceof EC2ServiceException) {
            //throw new HttpError("EC2ServiceException Error occurred while creating EBS volume: " + error.message, 500)
            console.log("EC2ServiceException Error occurred while creating EBS volume: " + error.message)
            return -1
        }
        else {
            throw new HttpError("Error occurred while creating EBS volume: " + error.message, 500)
        }
    }
}

async function getAccount(id) {
    const client = new Client(dbInfo)
    await client.connect()

    let row;
    try {
        const query = {
            text: `SELECT id, username
                   FROM accounts
                   WHERE id = $1`,
            values: [id]
        }
        const response = await client.query(query)
        row = response.rows[0]
    }
    catch (error) {
        throw new HttpError("Error occurred when inserting account into database: " + error, 500)
    }
    await client.end()
    
    return row
}

module.exports = {
    Account: Account,
    createAccount: createAccount,
    getAccount: getAccount
}