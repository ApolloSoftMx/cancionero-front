import { useState } from 'react';
import {
    Box, Typography, Button, TextField, IconButton,
    Chip, Divider, Tooltip, Select, MenuItem,
    FormControl, InputLabel, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ListItemButton, ListItemText, Collapse, Tabs, Tab } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const GRUPOS_ACORDES = [
    { label: 'Mayores', acordes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    { label: 'Menores', acordes: ['Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'] },
    { label: 'Sostenidos', acordes: ['C#', 'D#', 'F#', 'G#', 'A#', 'C#m', 'D#m', 'F#m', 'G#m', 'A#m'] },
    { label: 'Bemoles', acordes: ['Db', 'Eb', 'Gb', 'Ab', 'Bb', 'Dbm', 'Ebm', 'Gbm', 'Abm', 'Bbm'] },
    { label: '7ª Dom', acordes: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'Db7', 'Eb7', 'F#7', 'Ab7', 'Bb7'] },
    { label: '7ª Men', acordes: ['Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7'] },
    { label: 'Maj7', acordes: ['Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7', 'Dbmaj7', 'Ebmaj7', 'Abmaj7', 'Bbmaj7'] },
    { label: 'Sus2', acordes: ['Csus2', 'Dsus2', 'Esus2', 'Fsus2', 'Gsus2', 'Asus2', 'Bsus2'] },
    { label: 'Sus4', acordes: ['Csus4', 'Dsus4', 'Esus4', 'Fsus4', 'Gsus4', 'Asus4', 'Bsus4'] },
    { label: '7sus4', acordes: ['C7sus4', 'D7sus4', 'E7sus4', 'F7sus4', 'G7sus4', 'A7sus4', 'B7sus4'] },
    { label: 'Add9', acordes: ['Cadd9', 'Dadd9', 'Eadd9', 'Fadd9', 'Gadd9', 'Aadd9', 'Badd9'] },
    { label: '9ª', acordes: ['C9', 'D9', 'E9', 'F9', 'G9', 'A9', 'B9', 'Cm9', 'Dm9', 'Em9', 'Gm9', 'Am9'] },
    { label: 'Dim', acordes: ['Cdim', 'Ddim', 'Edim', 'Fdim', 'Gdim', 'Adim', 'Bdim', 'Cdim7', 'Ddim7', 'Gdim7', 'Adim7'] },
    { label: 'Aug', acordes: ['Caug', 'Daug', 'Eaug', 'Faug', 'Gaug', 'Aaug', 'Baug'] },
    { label: 'm7b5', acordes: ['Cm7b5', 'Dm7b5', 'Em7b5', 'Fm7b5', 'Gm7b5', 'Am7b5', 'Bm7b5'] },
    { label: 'Slash', acordes: ['C/E', 'C/G', 'D/F#', 'D/A', 'E/G#', 'F/A', 'G/B', 'G/F', 'A/C#', 'A/G', 'Am/E', 'Am/G', 'Dm/F', 'Em/G'] },
    { label: 'Alterados', acordes: ['G7b9', 'G7#9', 'D7b9', 'A7b9', 'E7b9', 'C7#11', 'F7#11', 'Bb7#11'] },
];

const PESTANAS_ACORDES = [
    {
        label: 'May/Men',
        acordes: [
            'C', 'D', 'E', 'F', 'G', 'A', 'B',
            'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
        ]
    },
    {
        label: '# / b',
        acordes: [
            'C#', 'D#', 'F#', 'G#', 'A#',
            'C#m', 'D#m', 'F#m', 'G#m', 'A#m',
            'Db', 'Eb', 'Gb', 'Ab', 'Bb',
            'Dbm', 'Ebm', 'Gbm', 'Abm', 'Bbm',
        ]
    },
    {
        label: '7as',
        acordes: [
            'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
            'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7',
            'Cmaj7', 'Dmaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7',
            'Db7', 'Eb7', 'F#7', 'Ab7', 'Bb7',
            'Dbmaj7', 'Ebmaj7', 'Abmaj7', 'Bbmaj7',
        ]
    },
    {
        label: 'Sus/Add',
        acordes: [
            'Csus2', 'Dsus2', 'Esus2', 'Fsus2', 'Gsus2', 'Asus2', 'Bsus2',
            'Csus4', 'Dsus4', 'Esus4', 'Fsus4', 'Gsus4', 'Asus4', 'Bsus4',
            'C7sus4', 'D7sus4', 'G7sus4', 'A7sus4',
            'Cadd9', 'Dadd9', 'Eadd9', 'Fadd9', 'Gadd9', 'Aadd9', 'Badd9',
        ]
    },
    {
        label: 'Dim/Aug',
        acordes: [
            'Cdim', 'Ddim', 'Edim', 'Fdim', 'Gdim', 'Adim', 'Bdim',
            'Cdim7', 'Ddim7', 'Gdim7', 'Adim7',
            'Cm7b5', 'Dm7b5', 'Em7b5', 'Gm7b5', 'Am7b5', 'Bm7b5',
            'Caug', 'Daug', 'Eaug', 'Faug', 'Gaug', 'Aaug', 'Baug',
        ]
    },
    {
        label: '9as/+',
        acordes: [
            'C9', 'D9', 'E9', 'F9', 'G9', 'A9', 'B9',
            'Cm9', 'Dm9', 'Gm9', 'Am9',
            'Cmaj9', 'Dmaj9', 'Fmaj9', 'Gmaj9', 'Amaj9',
            'C/E', 'C/G', 'D/F#', 'E/G#', 'F/A', 'G/B', 'G/F',
            'A/C#', 'Am/E', 'Dm/F', 'Em/G',
            'G7b9', 'G7#9', 'D7b9', 'A7b9', 'C7#11', 'F7#11',
        ]
    },
];

const TIPOS_PARRAFO = [
    { value: 'estrofa', label: 'Estrofa' },
    { value: 'coro', label: 'Coro' },
    { value: 'puente', label: 'Puente' },
    { value: 'intro', label: 'Intro' },
    { value: 'final', label: 'Final' },
];

function generarId() {
    return Math.random().toString(36).substr(2, 9);
}

function textoASegmentos(texto, segmentosViejos = []) {
    if (!texto || !texto.trim()) return [];
    const palabras = texto.trim().split(/\s+/);
    return palabras.map((palabra, i) => ({
        id: segmentosViejos[i]?.id || generarId(),
        texto: palabra + ' ',
        acorde: segmentosViejos[i]?.acorde || ''
    }));
}



// Componente separado para cada línea — tiene su propio estado de texto
function LineaEditor({ parrafoId, linea, onActualizar, onEliminar, puedeEliminar, acordeSeleccionado, onAsignarAcorde }) {
    const [textoLocal, setTextoLocal] = useState(
        linea.segmentos.map(s => s.texto.trimEnd()).join(' ')
    );

    function handleBlur() {
        onActualizar(parrafoId, linea.id, textoLocal);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            onActualizar(parrafoId, linea.id, textoLocal);
        }
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe la letra aquí y presiona Enter o Tab..."
                    value={textoLocal}
                    onChange={e => setTextoLocal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    helperText="Presiona Enter o haz clic fuera para ver las palabras y poder asignar acordes"
                />
                <Tooltip title="Eliminar línea">
                    <span>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onEliminar(parrafoId, linea.id)}
                            disabled={!puedeEliminar}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {/* Palabras clicables */}
            {linea.segmentos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pl: 0.5, mt: 1 }}>
                    {linea.segmentos.map(seg => (
                        <Box
                            key={seg.id}
                            onClick={() => onAsignarAcorde(parrafoId, linea.id, seg.id)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: acordeSeleccionado ? 'pointer' : 'default',
                                px: 0.5,
                                py: 0.3,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: seg.acorde ? 'primary.main' : 'transparent',
                                bgcolor: seg.acorde ? 'primary.50' : 'transparent',
                                '&:hover': acordeSeleccionado ? {
                                    bgcolor: 'action.hover',
                                    borderColor: 'primary.light'
                                } : {}
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                    minHeight: 16,
                                    lineHeight: 1,
                                    fontFamily: 'monospace',
                                }}
                            >
                                {seg.acorde}
                            </Typography>
                            <Typography variant="body2">
                                {seg.texto}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default function EditorAcordes({ valor = [], onChange }) {
    const [acordeSeleccionado, setAcordeSeleccionado] = useState('');
    const [pestanaAcorde, setPestanaAcorde] = useState(0);

    function agregarParrafo() {
        const nuevo = {
            id: generarId(),
            tipo: 'estrofa',
            etiqueta: `Estrofa ${valor.filter(p => p.tipo === 'estrofa').length + 1}`,
            lineas: [{ id: generarId(), segmentos: [] }]
        };
        onChange([...valor, nuevo]);
    }

    function eliminarParrafo(parrafoId) {
        onChange(valor.filter(p => p.id !== parrafoId));
    }

    function moverParrafo(index, direccion) {
        const copia = [...valor];
        const destino = index + direccion;
        if (destino < 0 || destino >= copia.length) return;
        [copia[index], copia[destino]] = [copia[destino], copia[index]];
        onChange(copia);
    }

    function actualizarParrafo(parrafoId, campo, nuevoValor) {
        onChange(valor.map(p =>
            p.id === parrafoId ? { ...p, [campo]: nuevoValor } : p
        ));
    }

    function agregarLinea(parrafoId) {
        onChange(valor.map(p => {
            if (p.id !== parrafoId) return p;
            return {
                ...p,
                lineas: [...p.lineas, { id: generarId(), segmentos: [] }]
            };
        }));
    }

    function eliminarLinea(parrafoId, lineaId) {
        onChange(valor.map(p => {
            if (p.id !== parrafoId) return p;
            return { ...p, lineas: p.lineas.filter(l => l.id !== lineaId) };
        }));
    }

    function actualizarTextoLinea(parrafoId, lineaId, texto) {
        onChange(valor.map(p => {
            if (p.id !== parrafoId) return p;
            return {
                ...p,
                lineas: p.lineas.map(l => {
                    if (l.id !== lineaId) return l;
                    return {
                        ...l,
                        segmentos: textoASegmentos(texto, l.segmentos)
                    };
                })
            };
        }));
    }

    function asignarAcorde(parrafoId, lineaId, segmentoId) {
        if (!acordeSeleccionado) return;
        onChange(valor.map(p => {
            if (p.id !== parrafoId) return p;
            return {
                ...p,
                lineas: p.lineas.map(l => {
                    if (l.id !== lineaId) return l;
                    return {
                        ...l,
                        segmentos: l.segmentos.map(s =>
                            s.id === segmentoId
                                ? { ...s, acorde: s.acorde === acordeSeleccionado ? '' : acordeSeleccionado }
                                : s
                        )
                    };
                })
            };
        }));
    }

    function duplicarParrafo(parrafo) {
    const copia = {
        ...parrafo,
        id: generarId(),
        etiqueta: parrafo.etiqueta + ' (copia)',
        lineas: parrafo.lineas.map(l => ({
            ...l,
            id: generarId(),
            segmentos: l.segmentos.map(s => ({ ...s, id: generarId() }))
        }))
    };
    const index = valor.findIndex(p => p.id === parrafo.id);
    const nuevos = [...valor];
    nuevos.splice(index + 1, 0, copia);
    onChange(nuevos);
}
    return (
        <Box>
            {/* Selector de acorde */}
            <Paper variant="outlined" sx={{ mb: 3 }}>
                {/* Pestañas */}
                <Tabs
                    value={pestanaAcorde}
                    onChange={(_, v) => setPestanaAcorde(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 36,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 11, minWidth: 60 },
                    }}
                >
                    {PESTANAS_ACORDES.map((p, i) => (
                        <Tab key={i} label={p.label} />
                    ))}
                </Tabs>

                {/* Acordes de la pestaña activa */}
                <Box sx={{ p: 1 }}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        maxHeight: 100,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: 3 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
                    }}>
                        {PESTANAS_ACORDES[pestanaAcorde].acordes.map(a => (
                            <Chip
                                key={a}
                                label={a}
                                onClick={() => setAcordeSeleccionado(a === acordeSeleccionado ? '' : a)}
                                color={acordeSeleccionado === a ? 'primary' : 'default'}
                                variant={acordeSeleccionado === a ? 'filled' : 'outlined'}
                                size="small"
                                sx={{ fontFamily: 'monospace', cursor: 'pointer', height: 24, fontSize: 11 }}
                            />
                        ))}
                    </Box>

                    {/* Acorde activo */}
                    {acordeSeleccionado && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Activo:</Typography>
                            <Chip
                                label={acordeSeleccionado}
                                color="primary"
                                size="small"
                                onDelete={() => setAcordeSeleccionado('')}
                                sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                — toca una palabra para asignarlo
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                2. Escribe la letra línea por línea y asigna acordes
            </Typography>

            {valor.map((parrafo, index) => (
                <Paper key={parrafo.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    {/* Encabezado párrafo */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={parrafo.tipo}
                                label="Tipo"
                                onChange={e => actualizarParrafo(parrafo.id, 'tipo', e.target.value)}
                            >
                                {TIPOS_PARRAFO.map(t => (
                                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            size="small"
                            label="Etiqueta"
                            value={parrafo.etiqueta}
                            onChange={e => actualizarParrafo(parrafo.id, 'etiqueta', e.target.value)}
                            sx={{ width: 150 }}
                        />
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Subir">
                                <span>
                                    <IconButton size="small" onClick={() => moverParrafo(index, -1)} disabled={index === 0}>
                                        <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Bajar">
                                <span>
                                    <IconButton size="small" onClick={() => moverParrafo(index, 1)} disabled={index === valor.length - 1}>
                                        <ArrowDownwardIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Duplicar párrafo">
                                <IconButton size="small" onClick={() => duplicarParrafo(parrafo)}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar párrafo">
                                <IconButton size="small" color="error" onClick={() => eliminarParrafo(parrafo.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {parrafo.lineas.map((linea) => (
                        <LineaEditor
                            key={linea.id}
                            parrafoId={parrafo.id}
                            linea={linea}
                            onActualizar={actualizarTextoLinea}
                            onEliminar={eliminarLinea}
                            puedeEliminar={parrafo.lineas.length > 1}
                            acordeSeleccionado={acordeSeleccionado}
                            onAsignarAcorde={asignarAcorde}
                        />
                    ))}

                    <Button size="small" startIcon={<AddIcon />} onClick={() => agregarLinea(parrafo.id)}>
                        Agregar línea
                    </Button>
                </Paper>
            ))}

            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={agregarParrafo}
                fullWidth
                sx={{ mt: 1 }}
            >
                Agregar párrafo
            </Button>
        </Box>
    );
}