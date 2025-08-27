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
}

module.exports = {
    Server: Server
}