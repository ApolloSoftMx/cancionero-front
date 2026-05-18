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

const ACORDES = [
    'A', 'Am', 'A7', 'Am7',
    'B', 'Bm', 'B7',
    'C', 'Cm', 'C7',
    'D', 'Dm', 'D7',
    'E', 'Em', 'E7',
    'F', 'Fm', 'F7',
    'G', 'Gm', 'G7',
    'Ab', 'Bb', 'Db', 'Eb', 'Gb',
    'Abm', 'Bbm', 'Dbm', 'Ebm',
];

const TIPOS_PARRAFO = [
    { value: 'estrofa', label: 'Estrofa' },
    { value: 'coro',    label: 'Coro' },
    { value: 'puente',  label: 'Puente' },
    { value: 'intro',   label: 'Intro' },
    { value: 'final',   label: 'Final' },
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

    return (
        <Box>
            {/* Selector de acorde */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    1. Selecciona un acorde
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {ACORDES.map(a => (
                        <Chip
                            key={a}
                            label={a}
                            onClick={() => setAcordeSeleccionado(a === acordeSeleccionado ? '' : a)}
                            color={acordeSeleccionado === a ? 'primary' : 'default'}
                            variant={acordeSeleccionado === a ? 'filled' : 'outlined'}
                            size="small"
                            icon={<MusicNoteIcon />}
                        />
                    ))}
                </Box>
                {acordeSeleccionado && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                        Acorde activo: <strong>{acordeSeleccionado}</strong> — haz clic en una palabra para asignarlo
                    </Typography>
                )}
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