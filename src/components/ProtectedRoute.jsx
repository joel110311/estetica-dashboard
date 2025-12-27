import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

function ProtectedRoute({ children, requiredPermission = null }) {
    const { isAuthenticated, loading, hasPermission } = useAuth()
    const location = useLocation()

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <LoadingSpinner text="Cargando..." />
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check for required permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
                    <p className="text-slate-500 mb-4">No tienes permisos para acceder a esta sección.</p>
                    <a href="/" className="text-primary-600 hover:underline">Volver al inicio</a>
                </div>
            </div>
        )
    }

    return children
}

export default ProtectedRoute
