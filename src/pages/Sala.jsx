import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ModoLectura from '../components/acordes/ModoLectura';
import {
    Box, Typography, TextField, Button, Alert,
    CircularProgress, Card, CardContent, Chip,
    Divider, Paper, List, ListItem, ListItemButton,
    ListItemText, IconButton, Tooltip
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ListIcon from '@mui/icons-material/List';
import SyncIcon from '@mui/icons-material/Sync';

const POLLING_INTERVAL = 3000; // 3 segundos

export default function Sala() {
    const { codigo: codigoParam } = useParams();
    const navigate = useNavigate();

    const [codigo,       setCodigo]       = useState(codigoParam || '');
    const [esquema,      setEsquema]      = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [actual,       setActual]       = useState(0);
    const [modoLectura,  setModoLectura]  = useState(false);
    const [mostrarLista, setMostrarLista] = useState(false);
    const [sincronizado, setSincronizado] = useState(true);
    const [ultimaSync,   setUltimaSync]   = useState(null);
    const pollingRef     = useRef(null);
    const esquemaRef     = useRef(null);

    // Si viene con código en la URL, cargar automáticamente
    useEffect(() => {
        if (codigoParam) unirseASala(codigoParam);
        return () => clearInterval(pollingRef.current);
    }, [codigoParam]);

    async function unirseASala(cod) {
        const codigoLimpio = (cod || codigo).trim().toUpperCase();
        if (!codigoLimpio) return setError('Ingresa el código de sala');

        try {
            setLoading(true);
            setError('');
            const { data } = await api.get(`/publico/esquemas/sala/${codigoLimpio}`);
            setEsquema(data);
            esquemaRef.current = data;
            setActual(data.cancion_actual || 0);
            iniciarPolling(data.id);
            console.log(data)
        } catch {
            setError('Código de sala no encontrado. Verifica con el director.');
        } finally {
            setLoading(false);
        }
    }

    function iniciarPolling(esquemaId) {
        clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            try {
                const { data } = await api.get(`/publico/esquemas/sesion/${esquemaId}`);
                setActual(prev => {
                    if (prev !== data.cancion_actual) {
                        setSincronizado(true);
                        return data.cancion_actual;
                    }
                    return prev;
                });
                setUltimaSync(new Date());
            } catch {
                setSincronizado(false);
            }
        }, POLLING_INTERVAL);
    }

    function formatHora(fecha) {
        if (!fecha) return '';
        return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Sin esquema — pantalla de ingreso de código
    if (!esquema) {
        return (
            <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <QrCodeIcon sx={{ fontSize: 64, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight="bold" mt={1}>
                        Unirse a una Sala
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Pide el código al director de música e ingrésalo aquí
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Card>
                    <CardContent>
                        <TextField
                            fullWidth
                            label="Código de sala"
                            value={codigo}
                            onChange={e => setCodigo(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && unirseASala()}
                            inputProps={{
                                maxLength: 8,
                                style: {
                                    fontFamily: 'monospace',
                                    fontSize: 28,
                                    textAlign: 'center',
                                    letterSpacing: 8,
                                    fontWeight: 'bold',
                                }
                            }}
                            placeholder="A3F9B2C1"
                            sx={{ mb: 2 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => unirseASala()}
                            disabled={loading || codigo.length < 6}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayCircleIcon />}
                        >
                            {loading ? 'Conectando...' : 'Entrar a la sala'}
                        </Button>
                    </CardContent>
                </Card>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                    No necesitas cuenta para unirte a una sala
                </Typography>
            </Box>
        );
    }

    // Con esquema — vista de músico sincronizada
    const canciones     = esquema.canciones || [];
    const cancionActual = canciones[actual];

    const cancionParaLectura = cancionActual ? {
        titulo:    cancionActual.titulo,
        autor:     cancionActual.autor,
        notas:     cancionActual.nota_director || cancionActual.notas,
        tonalidad: cancionActual.tonalidad,
        letra:     cancionActual.letra,
    } : null;

    return (
        <Box>
            {/* Encabezado */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Salir de la sala">
                    <IconButton onClick={() => {
                        clearInterval(pollingRef.current);
                        setEsquema(null);
                        setCodigo('');
                        navigate('/sala');
                    }}>
                        <ArrowBackIcon />
                    </IconButton>
                </Tooltip>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        {esquema.nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SyncIcon
                            sx={{
                                fontSize: 12,
                                color: sincronizado ? 'success.main' : 'error.main',
                                animation: sincronizado ? 'none' : 'spin 1s linear infinite',
                            }}
                        />
                        <Typography variant="caption" color={sincronizado ? 'success.main' : 'error.main'}>
                            {sincronizado
                                ? `Sincronizado ${ultimaSync ? formatHora(ultimaSync) : ''}`
                                : 'Sin conexión'
                            }
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    label={esquema.codigo_sala}
                    size="small"
                    sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                />
                <Tooltip title="Ver lista">
                    <IconButton
                        onClick={() => setMostrarLista(!mostrarLista)}
                        color={mostrarLista ? 'primary' : 'default'}
                    >
                        <ListIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Lista colapsable */}
            {mostrarLista && (
                <Paper variant="outlined" sx={{ mb: 2 }}>
                    <List dense disablePadding>
                        {canciones.map((c, i) => (
                            <Box key={i}>
                                {i > 0 && <Divider />}
                                <ListItem disablePadding>
                                    <ListItemButton selected={i === actual}>
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
                                        />
                                        {i === actual && <Chip label="Actual" size="small" color="primary" />}
                                    </ListItemButton>
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Canción actual */}
            {cancionActual ? (
                <Box>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight="bold">
                                {cancionActual.titulo}
                            </Typography>
                            {cancionActual.autor && (
                                <Typography variant="body2" color="text.secondary">
                                    {cancionActual.autor}
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
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
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {actual + 1} de {canciones.length}
                            </Typography>

                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<MenuBookIcon />}
                                onClick={() => setModoLectura(true)}
                                sx={{ mt: 2 }}
                                size="large"
                                fullWidth
                            >
                                Abrir modo lectura
                            </Button>
                        </Box>
                    </Paper>

                    {/* Mini vista previa */}
                    {cancionActual.letra?.contenido?.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, maxHeight: 250, overflowY: 'auto' }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                Vista previa
                            </Typography>
                            {cancionActual.letra.contenido.slice(0, 2).map((parrafo, i) => (
                                <Box key={i} sx={{ mb: 1 }}>
                                    <Chip label={parrafo.etiqueta || parrafo.tipo} size="small" sx={{ mb: 0.5, fontSize: 10 }} />
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
                        Esperando que el director inicie la misa...
                    </Typography>
                </Box>
            )}

            {/* Modo lectura */}
            {modoLectura && cancionParaLectura && (
                <ModoLectura
                    cancion={cancionParaLectura}
                    onCerrar={() => setModoLectura(false)}
                />
            )}
        </Box>
    );
}