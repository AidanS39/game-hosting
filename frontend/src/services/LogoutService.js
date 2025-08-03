import axios from "axios"

const baseURL = "http://localhost:3001/api/logout"

const deleteLogout = () => {
    const request = axios.delete(`${baseURL}`)
    return request.then(response => response.status)
}

export default { deleteLogout }