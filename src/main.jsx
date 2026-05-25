import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { crearTema } from './theme';
import { AuthProvider } from './context/AuthContext';
import { CatalogosProvider } from './context/CatalogosContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Canciones from './pages/Canciones';
import CancionDetalle from './pages/CancionDetalle';
import CancionForm from './pages/CancionForm';
import Layout from './components/Layout';
import Esquemas from './pages/Esquemas';
import EsquemaForm from './pages/EsquemaForm';
import EsquemaEjecucion from './pages/EsquemaEjecucion';
import EsquemasOffline from './pages/EsquemasOffline';
import './index.css';
import Sala from './pages/Sala';


function AppRoot() {
    const [modo, setModo] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = e => setModo(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const tema = useMemo(() => crearTema(modo), [modo]);

    return (
        <ThemeProvider theme={tema}>
            <CssBaseline />
            <BrowserRouter basename='/remamusic'>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={
                            <CatalogosProvider>
                                <Layout />
                            </CatalogosProvider>
                        }>
                            <Route index element={<Navigate to="/canciones" replace />} />
                            <Route path="canciones" element={<Canciones />} />
                            // Ruta pública, sin ProtectedRoute
                            <Route path="sala" element={<Sala />} />
                            <Route path="sala/:codigo" element={<Sala />} />
                            <Route path="canciones/nueva" element={<ProtectedRoute><CancionForm /></ProtectedRoute>} />
                            <Route path="canciones/:id" element={<CancionDetalle />} />
                            <Route path="canciones/:id/editar" element={<ProtectedRoute><CancionForm /></ProtectedRoute>} />
                            <Route path="esquemas" element={<ProtectedRoute><Esquemas /></ProtectedRoute>} />
                            <Route path="esquemas/nuevo" element={<ProtectedRoute><EsquemaForm /></ProtectedRoute>} />
                            <Route path="esquemas/:id/editar" element={<ProtectedRoute><EsquemaForm /></ProtectedRoute>} />
                            <Route path="esquemas/:id/ejecutar" element={<ProtectedRoute><EsquemaEjecucion /></ProtectedRoute>} />
                            <Route path="esquemas/offline" element={<EsquemasOffline />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);