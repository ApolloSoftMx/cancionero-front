import { createContext, useContext, useState } from 'react';
import { limpiarCacheCatalogos } from './CatalogosContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [usuario, setUsuario] = useState(
        JSON.parse(localStorage.getItem('usuario') || 'null')
    );

    function login(token, usuario) {
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        setToken(token);
        setUsuario(usuario);
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
         // Limpiar cache de catálogos
        limpiarCacheCatalogos();
    }

    const estaAutenticado = Boolean(token);

    return (
        <AuthContext.Provider value={{ token, usuario, login, logout, estaAutenticado }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}