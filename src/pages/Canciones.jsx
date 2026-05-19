import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogos } from '../context/CatalogosContext';
import api from '../api/axios';
import {
    Box, Typography, TextField, Button, Card, CardContent,
    CardActions, Grid, Chip, MenuItem, Select, FormControl,
    InputLabel, IconButton, Tooltip, CircularProgress, Alert,
    InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function Canciones() {
    const [canciones,  setCanciones]  = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [buscar,     setBuscar]     = useState('');
    const [seccionId,  setSeccionId]  = useState('');
    const [tipoId,     setTipoId]     = useState('');
    const { secciones, tipos, tonalidades } = useCatalogos();
    const navigate = useNavigate();

    useEffect(() => {
        // cargarCatalogos();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => cargarCanciones(), 400);
        return () => clearTimeout(delay);
    }, [buscar, seccionId, tipoId]);

    async function cargarCatalogos() {
        try {
            const [s, t] = await Promise.all([
                api.get('/secciones'),
                api.get('/tipos'),
            ]);
            setSecciones(s.data);
            setTipos(t.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function cargarCanciones() {
        try {
            setLoading(true);
            const params = {};
            if (buscar)    params.buscar    = buscar;
            if (seccionId) params.seccion_id = seccionId;
            if (tipoId)    params.tipo_id    = tipoId;
            const { data } = await api.get('/canciones', { params });
            setCanciones(data);
        } catch (err) {
            setError('Error al cargar canciones');
        } finally {
            setLoading(false);
        }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Canciones
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/canciones/nueva')}
                >
                    Nueva Canción
                </Button>
            </Box>

            {/* Filtros */}
            <Card sx={{ mb: 3, p: 1 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Buscar por título o autor..."
                            value={buscar}
                            onChange={e => setBuscar(e.target.value)}
                            size="small"
                            sx={{ flexGrow: 1, minWidth: 200 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>Sección de Misa</InputLabel>
                            <Select
                                value={seccionId}
                                label="Sección de Misa"
                                onChange={e => setSeccionId(e.target.value)}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {secciones.map(s => (
                                    <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={tipoId}
                                label="Tipo"
                                onChange={e => setTipoId(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {tipos.map(t => (
                                    <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {hayFiltros && (
                            <Tooltip title="Limpiar filtros">
                                <IconButton onClick={limpiarFiltros} color="error">
                                    <ClearIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Error */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Loading */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Sin resultados */}
            {!loading && canciones.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <MusicNoteIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                    <Typography color="text.secondary" mt={1}>
                        No se encontraron canciones
                    </Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/canciones/nueva')}
                    >
                        Agregar la primera canción
                    </Button>
                </Box>
            )}

            {/* Grid de canciones */}
            <Grid container spacing={2}>
                {canciones.map(cancion => (
                    <Grid item xs={12} sm={6} md={4} key={cancion.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column',
                            '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                    {cancion.titulo}
                                </Typography>
                                {cancion.autor && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {cancion.autor}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                    {cancion.tonalidad && (
                                        <Chip label={cancion.tonalidad} size="small" color="primary" variant="outlined" />
                                    )}
                                    {cancion.tipos?.split(', ').map((t, i) => (
                                        <Chip key={i} label={t} size="small" color="secondary" variant="outlined" />
                                    ))}
                                </Box>
                                {cancion.secciones && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {cancion.secciones}
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Tooltip title="Ver canción">
                                    <IconButton
                                        color="primary"
                                        onClick={() => navigate(`/canciones/${cancion.id}`)}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton
                                        color="secondary"
                                        onClick={() => navigate(`/canciones/${cancion.id}/editar`)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}