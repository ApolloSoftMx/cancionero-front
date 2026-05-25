import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCatalogos } from '../context/CatalogosContext';
import {
    Box, Typography, Button, Card, CardContent, TextField,
    Grid, Alert, CircularProgress, Divider, List, ListItem,
    ListItemText, ListItemSecondaryAction, IconButton, Tooltip,
    MenuItem, Select, FormControl, InputLabel, Chip, Paper,
    InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function EsquemaForm() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const esEdicion = Boolean(id);
    const { secciones } = useCatalogos();

    const [loading,   setLoading]   = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error,     setError]     = useState('');

    // Datos generales
    const [nombre,      setNombre]      = useState('');
    const [fecha,       setFecha]       = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [codigoSala,  setCodigoSala]  = useState('');

    // Canciones del esquema
    const [cancionesEsquema, setCancionesEsquema] = useState([]);

    // Buscador de canciones
    const [buscar,           setBuscar]           = useState('');
    const [resultados,       setResultados]       = useState([]);
    const [buscando,         setBuscando]         = useState(false);

    useEffect(() => {
        if (esEdicion) cargarEsquema();
    }, [id]);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (buscar.trim().length >= 2) buscarCanciones();
            else setResultados([]);
        }, 400);
        return () => clearTimeout(delay);
    }, [buscar]);

    async function cargarEsquema() {
        try {
            setLoading(true);
            const { data } = await api.get(`/esquemas/${id}`);
            setNombre(data.nombre || '');
            setFecha(data.fecha ? data.fecha.split('T')[0] : '');
            setDescripcion(data.descripcion || '');
            setCodigoSala(data.codigo_sala || '');
            setCancionesEsquema(data.canciones || []);
        } catch {
            setError('Error al cargar el esquema');
        } finally {
            setLoading(false);
        }
    }

    async function buscarCanciones() {
        try {
            setBuscando(true);
            const { data } = await api.get('/canciones', { params: { buscar } });
            setResultados(data);
        } catch {
            setResultados([]);
        } finally {
            setBuscando(false);
        }
    }

    function agregarCancion(cancion) {
        const yaExiste = cancionesEsquema.some(c => c.cancion_id === cancion.id);
        if (yaExiste) return;
        setCancionesEsquema(prev => [...prev, {
            cancion_id:    cancion.id,
            titulo:        cancion.titulo,
            autor:         cancion.autor,
            tonalidad:     cancion.tonalidad,
            seccion_id:    null,
            nota_director: '',
        }]);
        setBuscar('');
        setResultados([]);
    }

    function eliminarCancion(index) {
        setCancionesEsquema(prev => prev.filter((_, i) => i !== index));
    }

    function moverCancion(index, direccion) {
        const copia   = [...cancionesEsquema];
        const destino = index + direccion;
        if (destino < 0 || destino >= copia.length) return;
        [copia[index], copia[destino]] = [copia[destino], copia[index]];
        setCancionesEsquema(copia);
    }

    function actualizarCancion(index, campo, valor) {
        setCancionesEsquema(prev => prev.map((c, i) =>
            i === index ? { ...c, [campo]: valor } : c
        ));
    }

    async function handleGuardar() {
        if (!nombre.trim()) return setError('El nombre es requerido');
        try {
            setGuardando(true);
            setError('');

            let esquemaId = id;

            if (esEdicion) {
                await api.put(`/esquemas/${id}`, { nombre, fecha, descripcion });
            } else {
                const { data } = await api.post('/esquemas', { nombre, fecha, descripcion });
                esquemaId = data.id;
                setCodigoSala(data.codigo_sala);
            }

            await api.put(`/esquemas/${esquemaId}/canciones`, {
                canciones: cancionesEsquema.map(c => ({
                    cancion_id:    c.cancion_id,
                    seccion_id:    c.seccion_id || null,
                    nota_director: c.nota_director || null,
                }))
            });

            navigate('/esquemas');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar');
        } finally {
            setGuardando(false);
        }
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
        </Box>
    );

    return (
    <Box>
        {/* Encabezado */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/esquemas')}>
                Volver
            </Button>
            <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
                {esEdicion ? 'Editar Esquema' : 'Nuevo Esquema'}
            </Typography>
            <Button
                variant="contained"
                startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleGuardar}
                disabled={guardando}
            >
                {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Datos generales */}
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Datos generales
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
                    <TextField
                        label="Nombre *"
                        fullWidth
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        placeholder="Ej. Misa dominical, Boda de Juan y María..."
                    />
                    <TextField
                        label="Fecha"
                        type="date"
                        fullWidth
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Descripción / Notas"
                        fullWidth
                        multiline
                        rows={2}
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                    />
                    {codigoSala && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Código de sala para compartir
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                <Chip
                                    label={codigoSala}
                                    color="primary"
                                    sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Comparte este código con los músicos
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>

        {/* Canciones */}
        <Card>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Canciones del esquema
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Buscador */}
                <Box sx={{ position: 'relative', mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar canción para agregar..."
                        value={buscar}
                        onChange={e => setBuscar(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    {buscando
                                        ? <CircularProgress size={16} />
                                        : <SearchIcon fontSize="small" />
                                    }
                                </InputAdornment>
                            )
                        }}
                    />
                    {resultados.length > 0 && (
                        <Paper elevation={4} sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0, right: 0,
                            zIndex: 100,
                            maxHeight: 250,
                            overflowY: 'auto',
                        }}>
                            <List dense>
                                {resultados.map(c => (
                                    <ListItem
                                        key={c.id}
                                        button
                                        onClick={() => agregarCancion(c)}
                                        disabled={cancionesEsquema.some(x => x.cancion_id === c.id)}
                                    >
                                        <ListItemText primary={c.titulo} secondary={c.autor} />
                                        {cancionesEsquema.some(x => x.cancion_id === c.id) && (
                                            <Chip label="Ya agregada" size="small" />
                                        )}
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Box>

                {/* Lista canciones */}
                {cancionesEsquema.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <MusicNoteIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                        <Typography color="text.secondary" variant="body2" mt={1}>
                            Busca canciones arriba para agregarlas
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {cancionesEsquema.map((c, index) => (
                            <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 20 }}>
                                        {index + 1}.
                                    </Typography>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography variant="body2" fontWeight="bold" noWrap>
                                            {c.titulo}
                                        </Typography>
                                        {c.autor && (
                                            <Typography variant="caption" color="text.secondary">
                                                {c.autor}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.3, flexShrink: 0 }}>
                                        <Tooltip title="Subir">
                                            <span>
                                                <IconButton size="small" onClick={() => moverCancion(index, -1)} disabled={index === 0}>
                                                    <ArrowUpwardIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Bajar">
                                            <span>
                                                <IconButton size="small" onClick={() => moverCancion(index, 1)} disabled={index === cancionesEsquema.length - 1}>
                                                    <ArrowDownwardIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" color="error" onClick={() => eliminarCancion(index)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                    <FormControl size="small" sx={{ minWidth: 140 }}>
                                        <InputLabel>Sección</InputLabel>
                                        <Select
                                            value={c.seccion_id || ''}
                                            label="Sección"
                                            onChange={e => actualizarCancion(index, 'seccion_id', e.target.value || null)}
                                        >
                                            <MenuItem value="">Sin sección</MenuItem>
                                            {secciones.map(s => (
                                                <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        size="small"
                                        label="Nota del director"
                                        value={c.nota_director || ''}
                                        onChange={e => actualizarCancion(index, 'nota_director', e.target.value)}
                                        placeholder="Ej. Capo 2, versión corta..."
                                        sx={{ flexGrow: 1, minWidth: 150 }}
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    </Box>
);
}