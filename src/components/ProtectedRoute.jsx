import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Ruta que requiere autenticación obligatoria
export default function ProtectedRoute({ children }) {
    const { token } = useAuth();
    if (!token) return <Navigate to="/canciones" replace />;
    return children;
}

// Ruta que muestra contenido pero con funciones limitadas sin auth
export function PublicRoute({ children }) {
    return children;
}