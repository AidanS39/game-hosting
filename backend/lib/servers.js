const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs")

class Server {
    constructor(id, name, cpu, memory, type, version, volumeId, accountId, instanceId) {
        this.id = id
        this.name = name
        this.cpu = cpu
        this.memory = memory
        this.type = type
        this.version = version
        this.volumeId = volumeId
        this.accountId = accountId
        this.instanceId = instanceId
    }

    // starts server
    // 1. Find EC2 instance that container will run on
    // 2. Attach server's EBS volume to EC2 instance at correct directory
    // 3. Start container on EC2 instance
    async run() {
        try {
            // 1. Find EC2 instance that container will run on
            const instanceId = assignServerToInstance(this.id)

            // 2. Attach server's EBS volume to EC2 instance at correct directory

            // 3. Start container on EC2 instance
            const client = new ECSClient()
            const command = new RunTaskCommand({
                taskDefinition: process.env.GameHostingGameServerTaskDefinition,
                cluster: process.env.GameHostingCluster,
                count: 1,
                launchType: "EC2",
                networkConfiguration: {
                    awsvpcConfiguration: {
                        subnets: [
                            process.env.GameHostingPublicSubnet
                        ],
                        securityGroups: [
                            process.env.GameHostingGameServerSecurityGroup
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
                },
                placementConstraints: [
                    {
                        type: "memberOf",
                        expression: `ec2InstanceId == ${instanceId}`
                    }
                ]
            })
            const response = client.run(command)
        }
        catch {

        }

    }
}

module.exports = {
    Server: Server
}