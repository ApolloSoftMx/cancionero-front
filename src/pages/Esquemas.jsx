import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Box, Typography, Button, Card, CardContent, CardActions,
    Grid, Chip, IconButton, Tooltip, CircularProgress,
    Alert, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function Esquemas() {
    const [esquemas, setEsquemas] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const navigate = useNavigate();

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        try {
            setLoading(true);
            const { data } = await api.get('/esquemas');
            setEsquemas(data);
            console.log(data);
        } catch (err) {
            setError('Error al cargar esquemas');
        } finally {
            setLoading(false);
        }
    }

    async function handleEliminar(id, nombre) {
        if (!confirm(`¿Eliminar "${nombre}"?`)) return;
        try {
            await api.delete(`/esquemas/${id}`);
            setEsquemas(prev => prev.filter(e => e.id !== id));
        } catch {
            setError('Error al eliminar');
        }
    }

    function copiarCodigo(codigo) {
        navigator.clipboard.writeText(codigo);
    }

    function formatFecha(fecha) {
        if (!fecha) return null;
        console.log(fecha)
        return new Date(fecha).toLocaleDateString('es-EU', {
           timeZone:'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Esquemas de Misa
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/esquemas/nuevo')}
                >
                    Nuevo Esquema
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && esquemas.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <EventNoteIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                    <Typography color="text.secondary" mt={1}>
                        No hay esquemas creados aún
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/esquemas/nuevo')}>
                        Crear el primer esquema
                    </Button>
                </Box>
            )}

            <Grid container spacing={2}>
                {esquemas.map(e => (
                    <Grid xs={12} sm={6} md={4} key={e.id}>
                        <Card sx={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s'
                        }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {e.nombre}
                                </Typography>
                                {e.fecha && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        📅 {formatFecha(e.fecha)}
                                    </Typography>
                                )}
                                {e.descripcion && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                                        {e.descripcion}
                                    </Typography>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`${e.total_canciones} canciones`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={e.codigo_sala}
                                        size="small"
                                        variant="outlined"
                                        onClick={() => copiarCodigo(e.codigo_sala)}
                                        icon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                                        sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
                                    />
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Tooltip title="Ejecutar misa">
                                    <IconButton
                                        color="success"
                                        onClick={() => navigate(`/esquemas/${e.id}/ejecutar`)}
                                    >
                                        <PlayCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton
                                        color="primary"
                                        onClick={() => navigate(`/esquemas/${e.id}/editar`)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                    <IconButton
                                        color="error"
                                        onClick={() => handleEliminar(e.id, e.nombre)}
                                    >
                                        <DeleteIcon />
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