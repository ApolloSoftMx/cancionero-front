import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalogos } from '../context/CatalogosContext';
import api from '../api/axios';
import EditorAcordes from '../components/acordes/EditorAcordes';
import VisualizadorLetra from '../components/acordes/VisualizadorLetra';
import {
    Box, Typography, TextField, Button, Card, CardContent,
    Grid, FormControl, InputLabel, Select, MenuItem,
    Checkbox, FormControlLabel, FormGroup, Alert,
    CircularProgress, Tabs, Tab, Divider, Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

export default function CancionForm() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const esEdicion  = Boolean(id);

    const [tab,        setTab]        = useState(0);
    const [loading,    setLoading]    = useState(false);
    const [guardando,  setGuardando]  = useState(false);
    const [error,      setError]      = useState('');
    const { secciones, tipos, tonalidades } = useCatalogos();

    // Datos del formulario
    const [titulo,      setTitulo]      = useState('');
    const [autor,       setAutor]       = useState('');
    const [fuente,      setFuente]      = useState('');
    const [tonalidadId, setTonalidadId] = useState('');
    const [bpm,         setBpm]         = useState('');
    const [notas,       setNotas]       = useState('');
    const [seccionesSeleccionadas,  setSeccionesSeleccionadas]  = useState([]);
    const [tiposSeleccionados,      setTiposSeleccionados]      = useState([]);
    const [letra,       setLetra]       = useState([]);

    useEffect(() => {
        if (esEdicion) cargarCancion();
    }, [id]);


    async function cargarCancion() {
        try {
            setLoading(true);
            const { data } = await api.get(`/canciones/${id}`);
            setTitulo(data.titulo || '');
            setAutor(data.autor || '');
            setFuente(data.fuente || '');
            setTonalidadId(data.tonalidad_id || '');
            setBpm(data.bpm || '');
            setNotas(data.notas || '');
            setSeccionesSeleccionadas(data.secciones_detalle?.map(s => s.id) || []);
            setTiposSeleccionados(data.tipos_detalle?.map(t => t.id) || []);
            setLetra(data.letra?.contenido || []);
        } catch (err) {
            setError('Error al cargar la canción');
        } finally {
            setLoading(false);
        }
    }

    function toggleSeccion(id) {
        setSeccionesSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    }

    function toggleTipo(id) {
        setTiposSeleccionados(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    }

    async function handleGuardar() {
        if (!titulo.trim()) {
            setError('El título es requerido');
            setTab(0);
            return;
        }
        try {
            setGuardando(true);
            setError('');
            const payload = {
                titulo, autor, fuente,
                tonalidad_id: tonalidadId || null,
                bpm: bpm || null,
                notas,
                secciones: seccionesSeleccionadas,
                tipos: tiposSeleccionados,
                letra,
            };
            if (esEdicion) {
                await api.put(`/canciones/${id}`, payload);
            } else {
                await api.post('/canciones', payload);
            }
            navigate('/canciones');
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
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/canciones')}
                >
                    Volver
                </Button>
                <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {esEdicion ? 'Editar Canción' : 'Nueva Canción'}
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

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Datos generales" />
                <Tab label="Clasificación" />
                <Tab icon={<EditIcon fontSize="small" />} iconPosition="start" label="Editor de letra" />
                <Tab icon={<VisibilityIcon fontSize="small" />} iconPosition="start" label="Vista previa" />
            </Tabs>

            {/* Tab 0 — Datos generales */}
            {tab === 0 && (
                <Card>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Título *"
                                    fullWidth
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Autor"
                                    fullWidth
                                    value={autor}
                                    onChange={e => setAutor(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Fuente (libro, álbum...)"
                                    fullWidth
                                    value={fuente}
                                    onChange={e => setFuente(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tonalidad</InputLabel>
                                    <Select
                                        value={tonalidadId}
                                        label="Tonalidad"
                                        onChange={e => setTonalidadId(e.target.value)}
                                    >
                                        <MenuItem value="">Sin especificar</MenuItem>
                                        {tonalidades.map(t => (
                                            <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="BPM (tempo)"
                                    type="number"
                                    fullWidth
                                    value={bpm}
                                    onChange={e => setBpm(e.target.value)}
                                    inputProps={{ min: 40, max: 300 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Notas del músico"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={notas}
                                    onChange={e => setNotas(e.target.value)}
                                    placeholder="Observaciones, capo, digitaciones especiales..."
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Tab 1 — Clasificación */}
            {tab === 1 && (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Secciones de la Misa
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <FormGroup>
                                    {secciones.map(s => (
                                        <FormControlLabel
                                            key={s.id}
                                            control={
                                                <Checkbox
                                                    checked={seccionesSeleccionadas.includes(s.id)}
                                                    onChange={() => toggleSeccion(s.id)}
                                                />
                                            }
                                            label={s.nombre}
                                        />
                                    ))}
                                </FormGroup>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Tipos de Canción
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <FormGroup>
                                    {tipos.map(t => (
                                        <FormControlLabel
                                            key={t.id}
                                            control={
                                                <Checkbox
                                                    checked={tiposSeleccionados.includes(t.id)}
                                                    onChange={() => toggleTipo(t.id)}
                                                />
                                            }
                                            label={t.nombre}
                                        />
                                    ))}
                                </FormGroup>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Resumen de selección */}
                    {(seccionesSeleccionadas.length > 0 || tiposSeleccionados.length > 0) && (
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>Seleccionados:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {seccionesSeleccionadas.map(sid => {
                                            const s = secciones.find(x => x.id === sid);
                                            return s ? <Chip key={sid} label={s.nombre} size="small" color="primary" /> : null;
                                        })}
                                        {tiposSeleccionados.map(tid => {
                                            const t = tipos.find(x => x.id === tid);
                                            return t ? <Chip key={tid} label={t.nombre} size="small" color="secondary" /> : null;
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Tab 2 — Editor de letra */}
            {tab === 2 && (
                <EditorAcordes valor={letra} onChange={setLetra} />
            )}

            {/* Tab 3 — Vista previa */}
            {tab === 3 && (
                <Card>
                    <CardContent>
                        <VisualizadorLetra
                            contenido={letra}
                            titulo={titulo}
                            autor={autor}
                            tonalidad={tonalidades.find(t => t.id === tonalidadId)?.nombre}
                        />
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}