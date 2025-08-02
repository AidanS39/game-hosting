import axios from "axios"

const baseURL = "/api/validate"

const getValidate = () => {
    const request = axios.get(`${baseURL}`)
    return request.then(response => response)
}

export default { getValidate }