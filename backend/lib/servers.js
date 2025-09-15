const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs")

class Server {
    constructor(id, name, cpu, memory, type, version, volumeId, accountId) {
        this.id = id
        this.name = name
        this.cpu = cpu
        this.memory = memory
        this.type = type
        this.version = version
        this.volumeId = volumeId
        this.accountId = accountId
    }

    // starts server
    // 1. Find EC2 instance that container will run on
    // 2. Attach server's EBS volume to EC2 instance at correct directory
    // 3. Start container on EC2 instance
    async run() {
        const client = new ECSClient()
        const command = new RunTaskCommand({
            taskDefinition: process.env.ECS_TASK_DEFINITION,
            cluster: process.env.ECS_CLUSTER,
            count: 1,
            launchType: "EC2",
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: [
                        process.env.SERVER_SUBNET
                    ],
                    securityGroups: [
                        process.env.SERVER_SECURITY_GROUP
                    ]
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: "PaperTestGameContainer",
                        environment: [
                            {
                                name: "TYPE",
                                value: this.type
                            },
                            {
                                name: "VERSION",
                                value: this.version
                            }
                        ],
                        cpu: this.cpu,
                        memory: this.memory
                    }
                ]
            }

        })

        const response = client.run(command)

        
    }
}

module.exports = {
    Server: Server
}