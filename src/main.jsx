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
import './index.css';

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
                            <ProtectedRoute>
                                <CatalogosProvider>
                                    <Layout />
                                </CatalogosProvider>
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/canciones" replace />} />
                            <Route path="canciones" element={<Canciones />} />
                            <Route path="canciones/nueva" element={<CancionForm />} />
                            <Route path="canciones/:id" element={<CancionDetalle />} />
                            <Route path="canciones/:id/editar" element={<CancionForm />} />
                            <Route path="esquemas" element={<Esquemas />} />
                            <Route path="esquemas/nuevo" element={<EsquemaForm />} />
                            <Route path="esquemas/:id/editar" element={<EsquemaForm />} />
                            <Route path="esquemas/:id/ejecutar" element={<EsquemaEjecucion />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);