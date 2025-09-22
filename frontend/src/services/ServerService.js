import axios from "axios"

const baseURL = "http://localhost:3001/api/servers"

const getServers = (username) => {
    const request = axios.get(`${baseURL}/${username}`)
    return request.then(response => response)
}

export default { getServers }