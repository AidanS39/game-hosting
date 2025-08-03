import axios from "axios"

const baseURL = "http://localhost:3001/api/createLogin"

const postCreateAccount = (login) => {
    const request = axios.post(`${baseURL}`, login)
    return request.then(response => response.data)
}

export default { postCreateAccount }