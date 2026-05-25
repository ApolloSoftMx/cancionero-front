import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ModoLectura from '../components/acordes/ModoLectura';
import {
    Box, Typography, IconButton, Tooltip, CircularProgress,
    Alert, Chip, List, ListItem, ListItemButton, ListItemText,
    Divider, Paper, Fade
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListIcon from '@mui/icons-material/List';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function EsquemaEjecucion() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [esquema,    setEsquema]    = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [actual,     setActual]     = useState(0);
    const [modoLectura, setModoLectura] = useState(false);
    const [mostrarLista, setMostrarLista] = useState(false);
    const [copiado,    setCopiado]    = useState(false);
    const pollingRef   = useRef(null);

    useEffect(() => {
        cargarEsquema();
        return () => clearInterval(pollingRef.current);
    }, [id]);

    async function cargarEsquema() {
        try {
            setLoading(true);
            const { data } = await api.get(`/esquemas/${id}`);
            setEsquema(data);
            // Restaurar posición de sesión
            if (data.cancion_actual !== undefined) {
                setActual(data.cancion_actual);
            }
        } catch {
            setError('Error al cargar el esquema');
        } finally {
            setLoading(false);
        }
    }

    async function cambiarCancion(nuevoIndex) {
        if (!esquema) return;
        if (nuevoIndex < 0 || nuevoIndex >= esquema.canciones.length) return;
        setActual(nuevoIndex);
        // Sincronizar con otros músicos
        try {
            await api.put(`/esquemas/${id}/sesion`, { cancion_actual: nuevoIndex });
        } catch {
            // silencioso, no crítico
        }
    }

    function copiarCodigo() {
        navigator.clipboard.writeText(esquema.codigo_sala);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }

    function formatFecha(fecha) {
        if (!fecha) return null;
        return new Date(fecha).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!esquema) return null;

    const canciones   = esquema.canciones || [];
    const cancionActual = canciones[actual];

    // Construir objeto cancion compatible con ModoLectura
    const cancionParaLectura = cancionActual ? {
        titulo: cancionActual.titulo,
        autor:  cancionActual.autor,
        notas:  cancionActual.nota_director || cancionActual.notas,
        tonalidad: cancionActual.tonalidad,
        letra:  cancionActual.letra,
    } : null;

    return (
        <Box>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Volver">
                    <IconButton onClick={() => navigate('/esquemas')}>
                        <ArrowBackIosIcon />
                    </IconButton>
                </Tooltip>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        {esquema.nombre}
                    </Typography>
                    {esquema.fecha && (
                        <Typography variant="caption" color="text.secondary">
                            📅 {formatFecha(esquema.fecha)}
                        </Typography>
                    )}
                </Box>
                <Tooltip title={copiado ? '¡Copiado!' : 'Compartir código de sala'}>
                    <Chip
                        label={copiado ? '¡Copiado!' : esquema.codigo_sala}
                        icon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={copiarCodigo}
                        color={copiado ? 'success' : 'primary'}
                        sx={{ fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer' }}
                    />
                </Tooltip>
                <Tooltip title="Ver lista">
                    <IconButton onClick={() => setMostrarLista(!mostrarLista)} color={mostrarLista ? 'primary' : 'default'}>
                        <ListIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Lista de canciones colapsable */}
            <Fade in={mostrarLista}>
                <Paper variant="outlined" sx={{ mb: 2, display: mostrarLista ? 'block' : 'none' }}>
                    <List dense disablePadding>
                        {canciones.map((c, i) => (
                            <Box key={i}>
                                {i > 0 && <Divider />}
                                <ListItem disablePadding>
                                    <ListItemButton
                                        selected={i === actual}
                                        onClick={() => {
                                            cambiarCancion(i);
                                            setMostrarLista(false);
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {i + 1}.
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={i === actual ? 'bold' : 'normal'}>
                                                        {c.titulo}
                                                    </Typography>
                                                    {c.seccion && (
                                                        <Chip label={c.seccion} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                                                    )}
                                                </Box>
                                            }
                                            secondary={c.nota_director}
                                        />
                                        {i === actual && (
                                            <Chip label="Actual" size="small" color="primary" />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                </Paper>
            </Fade>

            {/* Canción actual */}
            {cancionActual ? (
                <Box>
                    {/* Navegación */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Tooltip title="Anterior">
                                <span>
                                    <IconButton
                                        onClick={() => cambiarCancion(actual - 1)}
                                        disabled={actual === 0}
                                        color="primary"
                                    >
                                        <ArrowBackIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {cancionActual.titulo}
                                </Typography>
                                {cancionActual.autor && (
                                    <Typography variant="body2" color="text.secondary">
                                        {cancionActual.autor}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                    {cancionActual.tonalidad && (
                                        <Chip label={cancionActual.tonalidad} size="small" color="primary" variant="outlined" />
                                    )}
                                    {cancionActual.seccion && (
                                        <Chip label={cancionActual.seccion} size="small" variant="outlined" />
                                    )}
                                    {cancionActual.nota_director && (
                                        <Chip label={`📌 ${cancionActual.nota_director}`} size="small" color="warning" variant="outlined" />
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {actual + 1} de {canciones.length}
                                </Typography>
                            </Box>

                            <Tooltip title="Siguiente">
                                <span>
                                    <IconButton
                                        onClick={() => cambiarCancion(actual + 1)}
                                        disabled={actual === canciones.length - 1}
                                        color="primary"
                                    >
                                        <ArrowForwardIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        {/* Botón modo lectura */}
                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Tooltip title="Abrir en modo lectura en vivo">
                                <IconButton
                                    color="success"
                                    size="large"
                                    onClick={() => setModoLectura(true)}
                                >
                                    <MenuBookIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>

                    {/* Mini vista previa */}
                    {cancionActual.letra?.contenido?.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                Vista previa
                            </Typography>
                            {cancionActual.letra.contenido.slice(0, 2).map((parrafo, i) => (
                                <Box key={i} sx={{ mb: 1 }}>
                                    <Chip
                                        label={parrafo.etiqueta || parrafo.tipo}
                                        size="small"
                                        sx={{ mb: 0.5, fontSize: 10 }}
                                    />
                                    {parrafo.lineas?.slice(0, 2).map((linea, li) => (
                                        <Typography key={li} variant="body2" color="text.secondary" noWrap>
                                            {linea.segmentos?.map(s => s.texto).join('')}
                                        </Typography>
                                    ))}
                                </Box>
                            ))}
                            {cancionActual.letra.contenido.length > 2 && (
                                <Typography variant="caption" color="text.disabled">
                                    + {cancionActual.letra.contenido.length - 2} secciones más...
                                </Typography>
                            )}
                        </Paper>
                    )}
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', mt: 6 }}>
                    <Typography color="text.secondary">
                        Este esquema no tiene canciones
                    </Typography>
                </Box>
            )}

            {/* Modo lectura */}
            {modoLectura && cancionParaLectura && (
                <ModoLectura
                    cancion={cancionParaLectura}
                    onCerrar={() => setModoLectura(false)}
                    onSiguiente={actual < canciones.length - 1 ? () => {
                        cambiarCancion(actual + 1);
                        setModoLectura(false);
                        setTimeout(() => setModoLectura(true), 100);
                    } : null}
                    onAnterior={actual > 0 ? () => {
                        cambiarCancion(actual - 1);
                        setModoLectura(false);
                        setTimeout(() => setModoLectura(true), 100);
                    } : null}
                />
            )}
        </Box>
    );
}