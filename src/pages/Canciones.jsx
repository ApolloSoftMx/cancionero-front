import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCatalogos } from '../context/CatalogosContext';
import {
    Box, Typography, TextField, Button, Chip,
    MenuItem, Select, FormControl, InputLabel,
    IconButton, Tooltip, CircularProgress, Alert,
    InputAdornment, List, ListItem, ListItemButton,
    ListItemText, ListItemSecondaryAction, Collapse,
    Divider, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function Canciones() {
    const [canciones,  setCanciones]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [buscar,     setBuscar]     = useState('');
    const [seccionId,  setSeccionId]  = useState('');
    const [tipoId,     setTipoId]     = useState('');
    const [expandida,  setExpandida]  = useState(null);
    const { secciones, tipos } = useCatalogos();
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const delay = setTimeout(() => cargarCanciones(), 400);
        return () => clearTimeout(delay);
    }, [buscar, seccionId, tipoId]);

    async function cargarCanciones() {
        try {
            setLoading(true);
            const params = {};
            if (buscar)    params.buscar     = buscar;
            if (seccionId) params.seccion_id = seccionId;
            if (tipoId)    params.tipo_id    = tipoId;
            const { data } = await api.get('/canciones', { params });
            setCanciones(data);
        } catch {
            setError('Error al cargar canciones');
        } finally {
            setLoading(false);
        }
    }

    function toggleExpandida(id) {
        setExpandida(prev => prev === id ? null : id);
    }

    function limpiarFiltros() {
        setBuscar('');
        setSeccionId('');
        setTipoId('');
    }

    const hayFiltros = buscar || seccionId || tipoId;

    return (
        <Box>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Canciones</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/canciones/nueva')}>
                    Nueva
                </Button>
            </Box>

            {/* Filtros */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Buscar..."
                    value={buscar}
                    onChange={e => setBuscar(e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1, minWidth: 150 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sección</InputLabel>
                    <Select value={seccionId} label="Sección" onChange={e => setSeccionId(e.target.value)}>
                        <MenuItem value="">Todas</MenuItem>
                        {secciones.map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select value={tipoId} label="Tipo" onChange={e => setTipoId(e.target.value)}>
                        <MenuItem value="">Todos</MenuItem>
                        {tipos.map(t => <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>)}
                    </Select>
                </FormControl>
                {hayFiltros && (
                    <Tooltip title="Limpiar">
                        <IconButton onClick={limpiarFiltros} color="error" size="small">
                            <ClearIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && canciones.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <MusicNoteIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                    <Typography color="text.secondary" mt={1}>No se encontraron canciones</Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/canciones/nueva')}>
                        Agregar la primera canción
                    </Button>
                </Box>
            )}

            {/* Lista tipo acordeón */}
            <List disablePadding sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
            }}>
                {canciones.map((cancion, index) => (
                    <Box key={cancion.id}>
                        {index > 0 && <Divider />}

                        {/* Fila principal */}
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => toggleExpandida(cancion.id)} sx={{ pr: 14 }}>
                                <ListItemText
                                    primary={
                                        <Typography fontWeight="bold" noWrap>
                                            {cancion.titulo}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                                            {cancion.autor && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {cancion.autor}
                                                </Typography>
                                            )}
                                            {cancion.tonalidad && (
                                                <Chip label={cancion.tonalidad} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItemButton>

                            {/* Acciones siempre visibles */}
                            <Box sx={{ position: 'absolute', right: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Tooltip title="Modo lectura">
                                    <IconButton size="small" color="success" onClick={() => navigate(`/canciones/${cancion.id}`)}>
                                        <MenuBookIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton size="small" color="primary" onClick={() => navigate(`/canciones/${cancion.id}/editar`)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <IconButton size="small" onClick={() => toggleExpandida(cancion.id)}>
                                    {expandida === cancion.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                            </Box>
                        </ListItem>

                        {/* Detalle expandible */}
                        <Collapse in={expandida === cancion.id} timeout="auto" unmountOnExit>
                            <Box sx={{
                                px: 2, pb: 2,
                                bgcolor: theme.palette.action.hover,
                                borderTop: `1px solid ${theme.palette.divider}`
                            }}>
                                {cancion.tipos && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                        {cancion.tipos.split(', ').map((t, i) => (
                                            <Chip key={i} label={t} size="small" color="secondary" variant="outlined" />
                                        ))}
                                    </Box>
                                )}
                                {cancion.secciones && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {cancion.secciones}
                                    </Typography>
                                )}
                                <Button
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => navigate(`/canciones/${cancion.id}`)}
                                    sx={{ mt: 1 }}
                                >
                                    Ver completa
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </List>
        </Box>
    );
}