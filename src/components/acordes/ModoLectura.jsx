import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, IconButton, Slider, Tooltip,
    Switch, FormControlLabel, Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { transponerContenido } from '../../utils/transpositor';

function SegmentoLectura({ texto, acorde, mostrarAcordes, fontSize }) {
    return (
        <Box sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mr: `${fontSize * 0.3}px`,
            mb: `${fontSize * 0.3}px`,
        }}>
            {mostrarAcordes && (
                <Typography component="span" sx={{
                    fontSize: `${fontSize * 0.7}px`,
                    fontWeight: 'bold',
                    color: acorde ? '#4fc3f7' : 'transparent',
                    lineHeight: 1.2,
                    minHeight: `${fontSize * 0.8}px`,
                    fontFamily: 'monospace',
                    userSelect: 'none',
                }}>
                    {acorde || '.'}
                </Typography>
            )}
            <Typography component="span" sx={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.5,
                whiteSpace: 'pre',
            }}>
                {texto}
            </Typography>
        </Box>
    );
}

function ParrafoLectura({ parrafo, mostrarAcordes, fontSize, modoOscuro }) {
    const ETIQUETA_COLORES = {
        coro: { bg: '#1565c0', text: '#fff' },
        puente: { bg: '#6a1b9a', text: '#fff' },
        intro: { bg: '#2e7d32', text: '#fff' },
        final: { bg: '#e65100', text: '#fff' },
        estrofa: { bg: modoOscuro ? '#333' : '#eee', text: modoOscuro ? '#fff' : '#333' },
    };
    const colores = ETIQUETA_COLORES[parrafo.tipo] || ETIQUETA_COLORES.estrofa;

    return (
        <Box sx={{ mb: fontSize * 0.15, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Box sx={{
                display: 'inline-block',
                bgcolor: colores.bg,
                color: colores.text,
                px: 1.5,
                py: 0.3,
                borderRadius: 1,
                mb: 1,
                fontSize: `${fontSize * 0.6}px`,
                fontWeight: 'bold',
                letterSpacing: 1,
                textTransform: 'uppercase',
                alignSelf: 'flex-start',
            }}>
                {parrafo.etiqueta || parrafo.tipo}
            </Box>

            {parrafo.lineas?.map((linea, li) => (
                <Box key={linea.id || li} sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    mb: `${fontSize * 0.1}px`,
                }}>
                    {linea.segmentos?.map((seg, si) => (
                        <SegmentoLectura
                            key={seg.id || si}
                            texto={seg.texto}
                            acorde={seg.acorde}
                            mostrarAcordes={mostrarAcordes}
                            fontSize={fontSize}
                        />
                    ))}
                </Box>
            ))}
        </Box>
    );
}



export default function ModoLectura({ cancion, onCerrar }) {
    const [modoOscuro, setModoOscuro] = useState(true);
    const [mostrarAcordes, setMostrarAcordes] = useState(true);
    const [fontSize, setFontSize] = useState(22);
    const [scrollActivo, setScrollActivo] = useState(false);
    const [velocidad, setVelocidad] = useState(10);
    const [controlesVisibles, setControlesVisibles] = useState(true);
    const [semitonos, setSemitonos] = useState(0);

    const contenidoTranspuesto = transponerContenido(
    cancion?.letra?.contenido || [],
    semitonos
);

    const contenedorRef = useRef(null);
    const scrollRef = useRef(null);
    const ocultarTimerRef = useRef(null);

    const contenido = cancion?.letra?.contenido || [];

    // Scroll automático
    useEffect(() => {
        if (scrollActivo) {
            const pixelsPorSegundo = velocidad * 0.4;
            scrollRef.current = setInterval(() => {
                if (contenedorRef.current) {
                    contenedorRef.current.scrollTop += 1;
                    // Si llegó al final, detener
                    const { scrollTop, scrollHeight, clientHeight } = contenedorRef.current;
                    if (scrollTop + clientHeight >= scrollHeight - 10) {
                        setScrollActivo(false);
                    }
                }
            }, 1000 / pixelsPorSegundo);
        } else {
            clearInterval(scrollRef.current);
        }
        return () => clearInterval(scrollRef.current);
    }, [scrollActivo, velocidad]);

    // Ocultar controles tras 4 segundos de inactividad
    function mostrarControles() {
        setControlesVisibles(true);
        clearTimeout(ocultarTimerRef.current);
        ocultarTimerRef.current = setTimeout(() => {
            setControlesVisibles(false);
        }, 4000);
    }

    useEffect(() => {
        mostrarControles();
        return () => clearTimeout(ocultarTimerRef.current);
    }, []);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const bg = modoOscuro ? '#121212' : '#ffffff';
    const text = modoOscuro ? '#ffffff' : '#121212';
    const controlBg = modoOscuro ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)';

    return (
        <Box
            onMouseMove={mostrarControles}
            onTouchStart={mostrarControles}
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                bgcolor: bg,
                color: text,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Barra superior */}
            <Fade in={controlesVisibles}>
                <Box sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    zIndex: 10,
                    bgcolor: controlBg,
                    backdropFilter: 'blur(8px)',
                    px: 2, py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    borderBottom: `1px solid ${modoOscuro ? '#333' : '#ddd'}`,
                }}>
                    {/* Título y notas */}
                    <MusicNoteIcon sx={{ color: '#4fc3f7', flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight="bold" sx={{ color: text, fontSize: 14 }} noWrap>
                            {cancion?.titulo}
                        </Typography>
                        {cancion?.notas && (
                            <Typography sx={{
                                color: '#ffcc80',
                                fontSize: 11,
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                📌 {cancion.notas}
                            </Typography>
                        )}
                    </Box>

                    {/* Modo oscuro/claro */}
                    <Tooltip title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}>
                        <IconButton size="small" onClick={() => setModoOscuro(!modoOscuro)} sx={{ color: text }}>
                            {modoOscuro ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>

                    {/* Acordes */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mostrarAcordes}
                                onChange={e => setMostrarAcordes(e.target.checked)}
                                size="small"
                                color="info"
                            />
                        }
                        label={<Typography sx={{ color: text, fontSize: 12 }}>Acordes</Typography>}
                        sx={{ m: 0 }}
                    />
                    {/* Transpositor */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="Bajar semitono">
                            <IconButton
                                size="small"
                                onClick={() => setSemitonos(s => s - 1)}
                                sx={{ color: text }}
                            >
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Tono original">
                            <Typography
                                onClick={() => setSemitonos(0)}
                                sx={{
                                    color: semitonos === 0 ? text : '#4fc3f7',
                                    fontSize: 12,
                                    minWidth: 32,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                }}
                            >
                                {semitonos === 0 ? 'T.O.' : semitonos > 0 ? `+${semitonos}` : semitonos}
                            </Typography>
                        </Tooltip>
                        <Tooltip title="Subir semitono">
                            <IconButton
                                size="small"
                                onClick={() => setSemitonos(s => s + 1)}
                                sx={{ color: text }}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* Tamaño texto */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="Reducir texto">
                            <IconButton size="small" onClick={() => setFontSize(f => Math.max(14, f - 2))} sx={{ color: text }}>
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Typography sx={{ color: text, fontSize: 12, minWidth: 28, textAlign: 'center' }}>
                            {fontSize}
                        </Typography>
                        <Tooltip title="Aumentar texto">
                            <IconButton size="small" onClick={() => setFontSize(f => Math.min(48, f + 2))} sx={{ color: text }}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Cerrar */}
                    <Tooltip title="Salir del modo lectura">
                        <IconButton size="small" onClick={onCerrar} sx={{ color: text }}>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Fade>

            {/* Contenido letra */}
            <Box
                ref={contenedorRef}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: { xs: 2, sm: 4 },
                    pt: 8,
                    pb: 12,
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: modoOscuro ? '#444' : '#ccc',
                        borderRadius: 2
                    },
                }}
            >
                {contenido.length === 0 ? (
                    <Typography sx={{ color: text, opacity: 0.5, textAlign: 'center', mt: 8 }}>
                        Esta canción no tiene letra cargada.
                    </Typography>
                ) : (
                    contenidoTranspuesto.map((parrafo, i) => (
                        <ParrafoLectura
                            key={parrafo.id || i}
                            parrafo={parrafo}
                            mostrarAcordes={mostrarAcordes}
                            fontSize={fontSize}
                            modoOscuro={modoOscuro}
                        />
                    ))
                )}
            </Box>

            {/* Barra inferior — controles de scroll */}
            <Fade in={controlesVisibles}>
                <Box sx={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    zIndex: 10,
                    bgcolor: controlBg,
                    backdropFilter: 'blur(8px)',
                    px: 3, py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderTop: `1px solid ${modoOscuro ? '#333' : '#ddd'}`,
                }}>
                    {/* Play/Pause scroll */}
                    <Tooltip title={scrollActivo ? 'Pausar scroll' : 'Iniciar scroll automático'}>
                        <IconButton
                            onClick={() => setScrollActivo(!scrollActivo)}
                            sx={{
                                bgcolor: '#4fc3f7',
                                color: '#000',
                                '&:hover': { bgcolor: '#81d4fa' },
                            }}
                        >
                            {scrollActivo ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Velocidad */}
                    <Typography sx={{ color: text, fontSize: 12, whiteSpace: 'nowrap' }}>
                        Velocidad
                    </Typography>
                    <Slider
                        value={velocidad}
                        onChange={(_, v) => setVelocidad(v)}
                        min={10}
                        max={150}
                        sx={{
                            color: '#4fc3f7',
                            flex: 1,
                        }}
                    />
                    <Typography sx={{ color: text, fontSize: 12, minWidth: 24 }}>
                        {velocidad < 40 ? '🐢' : velocidad < 90 ? '🚶' : '🏃'}
                    </Typography>
                </Box>
            </Fade>
        </Box>
    );
}