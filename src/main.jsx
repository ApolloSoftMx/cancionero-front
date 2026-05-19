import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CatalogosProvider } from './context/CatalogosContext';
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Canciones from './pages/Canciones'
import CancionDetalle from './pages/CancionDetalle'
import CancionForm from './pages/CancionForm'
import Layout from './components/Layout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
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
                    </Route>
                </Routes>
        </AuthProvider>
            </BrowserRouter>
    </React.StrictMode>
)