// Escala cromática con sostenidos y bemoles
const ESCALA_SOSTENIDOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const ESCALA_BEMOLES    = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Notas que prefieren bemoles
const PREFIEREN_BEMOLES = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm'];
const PREFIEREN_SOSTENIDOS = ['G', 'D', 'A', 'E', 'B', 'C#', 'F#', 'Gm', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];

function usarBemoles(tonica) {
    // Si explícitamente prefiere sostenidos, no usar bemoles
    if (PREFIEREN_SOSTENIDOS.some(n => tonica === n)) return false;
    // Si explícitamente prefiere bemoles, usarlos
    if (PREFIEREN_BEMOLES.some(n => tonica === n)) return true;
    // Por defecto sostenidos
    return false;
}

function encontrarIndice(nota) {
    let idx = ESCALA_SOSTENIDOS.indexOf(nota);
    if (idx === -1) idx = ESCALA_BEMOLES.indexOf(nota);
    return idx;
}

function transponerNota(nota, semitonos, useBemoles) {
    const escala = useBemoles ? ESCALA_BEMOLES : ESCALA_SOSTENIDOS;
    const idx = encontrarIndice(nota);
    if (idx === -1) return nota; // nota no reconocida, devolver igual
    return escala[((idx + semitonos) % 12 + 12) % 12];
}

// Parsea un acorde y lo transpone
// Ejemplos: 'Am7', 'C#maj7', 'D/F#', 'Gsus4', 'Bbm7b5'
export function transponerAcorde(acorde, semitonos) {
    if (!acorde || semitonos === 0) return acorde;

    // Acorde con bajo diferente (slash): 'G/B', 'D/F#'
    if (acorde.includes('/')) {
        const [arriba, abajo] = acorde.split('/');
        const tonicaT = transponerAcordeSimple(arriba, semitonos);
        const bajoT   = transponerNota(
            abajo.replace('b', '').replace('#', ''),
            semitonos,
            usarBemoles(tonicaT)
        );
        // Reconstruir el bajo con su accidental
        const bajoBase = abajo.replace(/[^A-Gb#]/g, '');
        const bajoTranspuesto = transponerNota(bajoBase, semitonos, usarBemoles(tonicaT));
        return `${tonicaT}/${bajoTranspuesto}`;
    }

    return transponerAcordeSimple(acorde, semitonos);
}

function transponerAcordeSimple(acorde, semitonos) {
    // Extraer la tónica (1 o 2 caracteres: C, C#, Db, etc.)
    const match = acorde.match(/^([A-G][#b]?)(.*)/);
    if (!match) return acorde;

    const [, tonica, sufijo] = match;
    const useBemoles = usarBemoles(tonica);
    const tonicaT    = transponerNota(tonica, semitonos, useBemoles);

    return tonicaT + sufijo;
}

// Transponer todo el contenido de una canción
export function transponerContenido(contenido, semitonos) {
    if (!contenido || semitonos === 0) return contenido;

    return contenido.map(parrafo => ({
        ...parrafo,
        lineas: parrafo.lineas.map(linea => ({
            ...linea,
            segmentos: linea.segmentos.map(seg => ({
                ...seg,
                acorde: seg.acorde ? transponerAcorde(seg.acorde, semitonos) : ''
            }))
        }))
    }));
}

// Nombres de las notas para mostrar en UI
export const NOTAS = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];