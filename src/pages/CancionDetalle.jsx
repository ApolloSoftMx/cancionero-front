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
import ModoLectura from '../components/acordes/ModoLectura';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../context/AuthContext';

export default function CancionDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cancion, setCancion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [eliminando, setEliminando] = useState(false);
    const [modoLectura, setModoLectura] = useState(false);
    const { estaAutenticado } = useAuth();

    useEffect(() => {
        cargarCancion();
    }, [id]);

    async function cargarCancion() {
        try {
            setLoading(true);
            const endpoint = estaAutenticado
                ? `/canciones/${id}`
                : `/publico/canciones/${id}`;
            const { data } = await api.get(endpoint);
            setCancion(data)
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
                {/* {estaAutenticado && (
                    <>
                        <Tooltip title="Editar">
                            <IconButton color="primary" onClick={() => navigate(`/canciones/${id}/editar`)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <IconButton color="error" onClick={handleEliminar}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )} */}
                <Tooltip title="Modo lectura en vivo">
                    <IconButton
                        color="success"
                        onClick={() => setModoLectura(true)}
                    >
                        <MenuBookIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
                {/* Info en acordeón */}
                <Grid xs={12} sx={{ width: '100%', px: { xs: 0 } }}>
                    <Accordion defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography fontWeight="bold">Información</Typography>
                                {cancion.tonalidad && (
                                    <Chip icon={<MusicNoteIcon />} label={cancion.tonalidad} size="small" color="primary" variant="outlined" />
                                )}
                                {cancion.bpm && (
                                    <Chip label={`${cancion.bpm} BPM`} size="small" variant="outlined" />
                                )}
                                {cancion.secciones_detalle?.map(s => (
                                    <Chip key={s.id} label={s.nombre} size="small" color="primary" />
                                ))}
                                {cancion.tipos_detalle?.map(t => (
                                    <Chip key={t.id} label={t.nombre} size="small" color="secondary" />
                                ))}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {cancion.autor && (
                                    <Grid xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Autor</Typography>
                                        <Typography>{cancion.autor}</Typography>
                                    </Grid>
                                )}
                                {cancion.fuente && (
                                    <Grid xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Fuente</Typography>
                                        <Typography>{cancion.fuente}</Typography>
                                    </Grid>
                                )}
                                {cancion.notas && (
                                    <Grid xs={12}>
                                        <Typography variant="caption" color="text.secondary">Notas del músico</Typography>
                                        <Typography variant="body2" sx={{
                                            bgcolor: 'action.hover',
                                            p: 1, borderRadius: 1, mt: 0.5
                                        }}>
                                            📌 {cancion.notas}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Letra */}
                <Grid xs={12} sx={{ width: '100%', px: { xs: 0 } }}>
                    <Card sx={{ width: '100%' }}>
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
            {modoLectura && (
                <ModoLectura
                    cancion={cancion}
                    onCerrar={() => setModoLectura(false)}
                />
            )}
        </Box>
    );
}