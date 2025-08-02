import { useAuth } from "../contexts/AuthContext.jsx"
import Typewriter from "../utils/Typewriter.jsx"

const Dashboard = () => {
    const username = useAuth().username

    return (
        <div>
            <Typewriter text={"Welcome, " + username} />
            <div>
                
            </div>
        </div>
    )
}

export default Dashboard