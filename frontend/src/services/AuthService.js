import axios from "axios"

const baseURL = "http://localhost:3001/api/validate"

const getValidate = () => {
    const request = axios.get(`${baseURL}`)
    return request.then(response => response)
}

export default { getValidate }