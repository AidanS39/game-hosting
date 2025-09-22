const { CloudFormationClient, DescribeStacksCommand } = require("@aws-sdk/client-cloudformation")
const fs = require("fs")

const STACK_NAME = "GameHostingStack"
const ENV_FILE_NAME = ".env.resources"


async function setup() {
    const client = new CloudFormationClient()

    const command = new DescribeStacksCommand({
        StackName: STACK_NAME
    })

    const response = await client.send(command)
    const outputs = response.Stacks[0].Outputs

    const writer = fs.createWriteStream(ENV_FILE_NAME)
    
    outputs.forEach(output => {
        const item = `${output.OutputKey}="${output.OutputValue}"\n`
        writer.write(item)
    })

    writer.close()
    
}

setup()