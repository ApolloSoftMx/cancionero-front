import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import VisualizadorLetra from '../components/acordes/VisualizadorLetra';
import {
    Box, Typography, Button, Card, CardContent,
    Chip, Divider, CircularProgress, Alert,
    Grid, Tooltip, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TempoIcon from '@mui/icons-material/Speed';
import NotesIcon from '@mui/icons-material/Notes';

export default function CancionDetalle() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [cancion,    setCancion]  = useState(null);
    const [loading,    setLoading]  = useState(true);
    const [error,      setError]    = useState('');
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        cargarCancion();
    }, [id]);

    async function cargarCancion() {
        try {
            setLoading(true);
            const { data } = await api.get(`/canciones/${id}`);
            setCancion(data);
        } catch (err) {
            setError('Error al cargar la canción');
        } finally {
            setLoading(false);
        }
    }

    async function handleEliminar() {
        if (!confirm(`¿Eliminar "${cancion.titulo}"?`)) return;
        try {
            setEliminando(true);
            await api.delete(`/canciones/${id}`);
            navigate('/canciones');
        } catch (err) {
            setError('Error al eliminar la canción');
        } finally {
            setEliminando(false);
        }
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Alert severity="error">{error}</Alert>
    );

    if (!cancion) return null;

    return (
        <Box>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/canciones')}
                >
                    Volver
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {cancion.titulo}
                </Typography>
                <Tooltip title="Editar">
                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/canciones/${id}/editar`)}
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                    <IconButton
                        color="error"
                        onClick={handleEliminar}
                        disabled={eliminando}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3}>
                {/* Info general */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Información
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {cancion.autor && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Autor</Typography>
                                    <Typography>{cancion.autor}</Typography>
                                </Box>
                            )}

                            {cancion.fuente && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Fuente</Typography>
                                    <Typography>{cancion.fuente}</Typography>
                                </Box>
                            )}

                            {cancion.tonalidad && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Tonalidad</Typography>
                                    <Box>
                                        <Chip
                                            icon={<MusicNoteIcon />}
                                            label={cancion.tonalidad}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            )}

                            {cancion.bpm && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Tempo</Typography>
                                    <Box>
                                        <Chip
                                            icon={<TempoIcon />}
                                            label={`${cancion.bpm} BPM`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            )}

                            {cancion.notas && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Notas del músico
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            bgcolor: '#fffde7',
                                            p: 1,
                                            borderRadius: 1,
                                            mt: 0.5,
                                            border: '1px solid #fff9c4'
                                        }}
                                    >
                                        {cancion.notas}
                                    </Typography>
                                </Box>
                            )}

                            {/* Secciones */}
                            {cancion.secciones_detalle?.length > 0 && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Secciones de la Misa
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {cancion.secciones_detalle.map(s => (
                                            <Chip key={s.id} label={s.nombre} size="small" color="primary" />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Tipos */}
                            {cancion.tipos_detalle?.length > 0 && (
                                <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Tipos
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {cancion.tipos_detalle.map(t => (
                                            <Chip key={t.id} label={t.nombre} size="small" color="secondary" />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Letra con acordes */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <VisualizadorLetra
                                contenido={cancion.letra?.contenido}
                                titulo={cancion.titulo}
                                autor={cancion.autor}
                                tonalidad={cancion.tonalidad}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}