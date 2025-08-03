import { useAuth } from "../contexts/AuthContext.jsx"
import Typewriter from "../utils/Typewriter.jsx"

const Dashboard = () => {
    const username = useAuth().username

    return (
        <div>
            <Typewriter text={"Welcome, " + username} />
            {/* <div className="dashboard-container">
                <div className="dashboard-section">
                    <h4>Your servers</h4>
                    <button>Create a server</button>
                </div>
            </div>
            <div className="dashboard-container">
                <div className="dashboard-section">
                </div>
            </div> */}
        </div>
    )
}

export default Dashboard