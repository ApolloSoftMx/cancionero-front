const DB_NAME    = 'CancioneroDB';
const DB_VERSION = 1;

function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('esquemas')) {
                db.createObjectStore('esquemas', { keyPath: 'id' });
            }
        };

        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

export async function guardarEsquemaOffline(esquema) {
    const db    = await abrirDB();
    const tx    = db.transaction('esquemas', 'readwrite');
    const store = tx.objectStore('esquemas');
    store.put({ ...esquema, guardado_en: new Date().toISOString() });
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror    = reject;
    });
}

export async function obtenerEsquemasOffline() {
    const db    = await abrirDB();
    const tx    = db.transaction('esquemas', 'readonly');
    const store = tx.objectStore('esquemas');
    return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

export async function obtenerEsquemaOffline(id) {
    const db    = await abrirDB();
    const tx    = db.transaction('esquemas', 'readonly');
    const store = tx.objectStore('esquemas');
    return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror   = e => reject(e.target.error);
    });
}

export async function eliminarEsquemaOffline(id) {
    const db    = await abrirDB();
    const tx    = db.transaction('esquemas', 'readwrite');
    const store = tx.objectStore('esquemas');
    store.delete(id);
    return new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror    = reject;
    });
}