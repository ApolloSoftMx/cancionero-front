import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/axios';

const CatalogosContext = createContext();

// API pública sin token
const apiPublica = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

let cacheGlobal = null;

export function CatalogosProvider({ children }) {
    const [secciones,   setSecciones]   = useState(cacheGlobal?.secciones   || []);
    const [tipos,       setTipos]       = useState(cacheGlobal?.tipos       || []);
    const [tonalidades, setTonalidades] = useState(cacheGlobal?.tonalidades || []);
    const [cargado,     setCargado]     = useState(Boolean(cacheGlobal));
    const cargando = useRef(false);

    useEffect(() => {
        if (cacheGlobal || cargando.current) return;
        cargando.current = true;

        async function cargar() {
            try {
                const token = localStorage.getItem('token');

                // Secciones y tipos — rutas públicas
                const [s, t] = await Promise.all([
                    apiPublica.get('/publico/catalogos/secciones'),
                    apiPublica.get('/publico/catalogos/tipos'),
                ]);

                // Tonalidades — solo si hay sesión
                let tonData = [];
                if (token) {
                    const ton = await api.get('/tonalidades');
                    tonData = ton.data;
                }

                cacheGlobal = {
                    secciones:   s.data,
                    tipos:       t.data,
                    tonalidades: tonData,
                };

                setSecciones(s.data);
                setTipos(t.data);
                setTonalidades(tonData);
            } catch (err) {
                console.error('Error cargando catálogos:', err);
            } finally {
                setCargado(true);
                cargando.current = false;
            }
        }

        cargar();
    }, []);

    // Si el usuario inicia sesión después, cargar tonalidades
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && cargado && tonalidades.length === 0) {
            api.get('/tonalidades').then(({ data }) => {
                setTonalidades(data);
                if (cacheGlobal) cacheGlobal.tonalidades = data;
            }).catch(() => {});
        }
    }, [cargado]);

    return (
        <CatalogosContext.Provider value={{ secciones, tipos, tonalidades, cargado }}>
            {children}
        </CatalogosContext.Provider>
    );
}

export function useCatalogos() {
    return useContext(CatalogosContext);
}

// Al final de CatalogosContext.jsx agrega:
export function limpiarCacheCatalogos() {
    cacheGlobal = null;
}