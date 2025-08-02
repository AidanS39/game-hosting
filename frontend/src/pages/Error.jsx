import { useLocation } from 'react-router-dom';

const Error = () => {
    const location = useLocation()
    const statusCode = location.state?.statusCode
    const message = location.state?.message

    return (
        <>
            <h1>Error</h1>
            <h2>{statusCode}</h2>
            <h4>{message}</h4>
        </>
    )
}

export default Error