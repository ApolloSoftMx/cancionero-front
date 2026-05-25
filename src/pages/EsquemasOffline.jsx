import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerEsquemasOffline, eliminarEsquemaOffline } from '../utils/offlineStorage';
import {
    Box, Typography, Card, CardContent, CardActions,
    IconButton, Tooltip, Alert, Chip, Divider
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import WifiOffIcon from '@mui/icons-material/WifiOff';

export default function EsquemasOffline() {
    const [esquemas, setEsquemas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => { cargar(); }, []);

    async function cargar() {
        const data = await obtenerEsquemasOffline();
        setEsquemas(data);
    }

    async function handleEliminar(id) {
        await eliminarEsquemaOffline(id);
        cargar();
    }

    function formatFecha(fecha) {
        if (!fecha) return null;
        return new Date(fecha).toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WifiOffIcon color="warning" />
                <Typography variant="h5" fontWeight="bold">
                    Esquemas sin conexión
                </Typography>
            </Box>

            {esquemas.length === 0 ? (
                <Alert severity="info">
                    No tienes esquemas guardados offline. Descárgalos desde la pantalla de ejecución de cada esquema.
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {esquemas.map(e => (
                        <Card key={e.id}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">
                                    {e.nombre}
                                </Typography>
                                {e.fecha && (
                                    <Typography variant="body2" color="text.secondary">
                                        📅 {formatFecha(e.fecha)}
                                    </Typography>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`${e.canciones?.length || 0} canciones`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`Guardado: ${new Date(e.guardado_en).toLocaleDateString('es-MX')}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Tooltip title="Ejecutar offline">
                                    <IconButton
                                        color="success"
                                        onClick={() => navigate(`/esquemas/${e.id}/ejecutar`, { state: { offline: true, esquema: e } })}
                                    >
                                        <PlayCircleIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                    <IconButton color="error" onClick={() => handleEliminar(e.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
}