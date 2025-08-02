import { AuthProvider } from './contexts/AuthContext.jsx'
import AppRoutes from './AppRoutes.jsx'

const App = () => {

    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    )
}

export default App