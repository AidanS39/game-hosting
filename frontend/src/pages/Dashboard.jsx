import { ServerRouter } from "react-router"
import { useAuth } from "../contexts/AuthContext.jsx"
import ServerService from "../services/ServerService.js"
import Typewriter from "../utils/Typewriter.jsx"

const Dashboard = () => {
    const username = useAuth().username
    const servers = ServerService.getServers(username)

    const createServer = () => {

    }


    return (
        <div>
            <Typewriter text={"Welcome, " + username} />
            <div className="m-4 grid grid-cols-2 gap-4">
                <div className="p-5 outline-3 outline-white bg-slate-700">
                    <h4 className="text-[25px]">Your servers</h4>
                    <div>
                        {
                            servers.map((server) => {
                                return (
                                    <div className="outline-3 p-4 my-4 grid grid-cols-2 bg-blue-950">
                                        <div className="">
                                            <h5 className="text-[20px]">{server.name}</h5>
                                            <h6 className="text-[15px]">{server.type}</h6>
                                            <h6 className="text-[15px]">{server.version}</h6>
                                            <h6 className="text-[10px]">{server.cpu} vCPUs</h6>
                                            <h6 className="text-[10px]">{server.memory} GiB RAM</h6>
                                        </div>
                                        <div className="">
                                            <button className="block float-end">Start</button>
                                            <button className="block float-end">Edit</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="p-5 outline-3 outline-white">
                    <button onClick={createServer}>Create a server</button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard