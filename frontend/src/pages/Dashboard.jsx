import { useLocation } from "react-router"

const Dashboard = () => {
    const { username } = useLocation().state

    return (
        <div>
            <h2>Welcome, {username}.</h2>
            <div>
                
            </div>
        </div>
    )
}

export default Dashboard