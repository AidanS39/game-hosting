const { EC2Client, RunInstancesCommand, EC2ServiceException } = require("@aws-sdk/client-ec2")
const { Client } = require("pg")

const { Server } = require("./servers")
const HttpError = require("../util/HttpError")
const isNullOrEmpty = require("../util/IsNullOrEmpty")

const dbInfo = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD.toString(),
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
}

class Instance {
    constructor(id, awsId) {
        this.id = id
        this.awsId = awsId
    }

    async getServers() {
        const client = new Client(dbInfo)
        await client.connect()

        let rows;
        try {
            const query = {
                text: `SELECT servers.id, servers.name, servers.cpu, servers.memory, servers.type, servers.version, servers.volume_id, servers.account_id, servers.instance_id
                    FROM servers
                    JOIN instances
                    ON servers.instance_id = instances.id
                    WHERE servers.instance_id = $1`,
                values: [this.id]
            }
            const response = await client.query(query)
            rows = response.rows
        }
        catch (error) {
            throw new HttpError("Error occurred when retrieving servers from database: " + error, 500)
        }
        await client.end()
        
        return rows
    }
}

async function getInstance(id) {
    const client = new Client(dbInfo)
    await client.connect()

    let row;
    try {
        const query = {
            text: `SELECT instances.id, instances.aws_id
                FROM instances
                WHERE instances.id = $1`,
            values: [id]
        }
        const response = await client.query(query)
        row = response.rows[0]
    }
    catch (error) {
        throw new HttpError("Error occurred when retrieving instance from database: " + error, 500)
    }
    await client.end()
    
    const instance = new Instance(row.id, row.aws_id)

    return instance
}

async function getAvailableInstances() {
    
}

async function createInstance() {
    const ec2Client = new EC2Client()
    const command = new RunInstancesCommand({
        ImageId: "ami-0192d32d5a35af4de",
        InstanceType: "c8g.xlarge",
        MinCount: 1,
        MaxCount: 1,
        SecurityGroupIds: [
            process.env.GameHostingGameServerSecurityGroup
        ],
        SubnetId: process.env.GameHostingPublicSubnet,
        DryRun: false
    })
    const response = await ec2Client.send(command)

    const awsId = response.Instances[0].InstanceId

    const dbClient = new Client(dbInfo)

    let id;

    await dbClient.connect()
    try {
        const query = {
            text: `INSERT INTO instances (aws_id)
                VALUES ($1)
                RETURNING id`,
            values: [awsId]
        }
        const response = await dbClient.query(query)
        id = response.rows[0].id
    }
    catch (error) {
        throw new HttpError("Error occurred when adding instance to database: " + error, 500)
    }
    await dbClient.end()
    
    const newInstance = new Instance(id, awsId)

    return newInstance
}

// // returns the ID of the instance that the server is assigned to
// async function assignServerToInstance(serverId) {

// }

module.exports = {
    Instance: Instance,
    getInstance: getInstance,
    getAvailableInstances: getAvailableInstances,
    createInstance: createInstance
}