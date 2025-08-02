import axios from "axios"

const baseURL = "/api/logout"

const deleteLogout = () => {
    const request = axios.delete(`${baseURL}`)
    return request.then(response => response.status)
}

export default { deleteLogout }