class Server:
    def __init__(self, id: int, name: str, cpu: int, memory: int, type: str, version: str, accountId: int, volumeId: str,):
        self.id = id
        self.name = name
        self.volumeId = volumeId
        self.cpu = cpu
        self.memory = memory
        self.type = type
        self.version = version
        self.accountId = accountId
        self.volumeId = volumeId