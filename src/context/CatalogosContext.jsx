import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const CatalogosContext = createContext();

let cacheGlobal = null; // Cache fuera del componente — persiste entre renders

export function CatalogosProvider({ children }) {
    const [secciones,   setSecciones]   = useState(cacheGlobal?.secciones   || []);
    const [tipos,       setTipos]       = useState(cacheGlobal?.tipos       || []);
    const [tonalidades, setTonalidades] = useState(cacheGlobal?.tonalidades || []);
    const [cargado,     setCargado]     = useState(Boolean(cacheGlobal));
    const cargando = useRef(false);

    useEffect(() => {
        if (cacheGlobal || cargando.current) return; // Ya cargado o en proceso
        cargando.current = true;

        async function cargar() {
            try {
                console.log('Cargando catálogos...');
                const [s, t, ton] = await Promise.all([
                    api.get('/secciones'),
                    api.get('/tipos'),
                    api.get('/tonalidades'),
                ]);
                cacheGlobal = {
                    secciones:   s.data,
                    tipos:       t.data,
                    tonalidades: ton.data,
                };
                setSecciones(s.data);
                setTipos(t.data);
                setTonalidades(ton.data);
            } catch (err) {
                console.error('Error cargando catálogos:', err);
            } finally {
                setCargado(true);
                cargando.current = false;
            }
        }

        cargar();
    }, []);

    return (
        <CatalogosContext.Provider value={{ secciones, tipos, tonalidades, cargado }}>
            {children}
        </CatalogosContext.Provider>
    );
}

export function useCatalogos() {
    return useContext(CatalogosContext);
}