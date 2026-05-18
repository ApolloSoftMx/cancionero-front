import { Box, Typography, Chip, Divider, Paper } from '@mui/material';

const COLORES_TIPO = {
    estrofa: { bg: '#f5f5f5', border: '#e0e0e0', label: '#757575' },
    coro:    { bg: '#e8f4fd', border: '#90caf9', label: '#1565c0' },
    puente:  { bg: '#f3e5f5', border: '#ce93d8', label: '#6a1b9a' },
    intro:   { bg: '#e8f5e9', border: '#a5d6a7', label: '#2e7d32' },
    final:   { bg: '#fff3e0', border: '#ffcc80', label: '#e65100' },
};

function Segmento({ texto, acorde }) {
    return (
        <Box sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mr: 0.3,
            mb: 0.5,
        }}>
            <Typography
                component="span"
                sx={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: acorde ? 'primary.main' : 'transparent',
                    lineHeight: 1.2,
                    minHeight: '1rem',
                    userSelect: 'none',
                    fontFamily: 'monospace',
                }}
            >
                {acorde || '.'}
            </Typography>
            <Typography
                component="span"
                sx={{
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    whiteSpace: 'pre',
                }}
            >
                {texto}
            </Typography>
        </Box>
    );
}

function Linea({ segmentos }) {
    if (!segmentos || segmentos.length === 0) return null;
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 0.5 }}>
            {segmentos.map((seg, i) => (
                <Segmento key={seg.id || i} texto={seg.texto} acorde={seg.acorde} />
            ))}
        </Box>
    );
}

function Parrafo({ parrafo }) {
    const colores = COLORES_TIPO[parrafo.tipo] || COLORES_TIPO.estrofa;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                mb: 2,
                bgcolor: colores.bg,
                borderColor: colores.border,
                borderRadius: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Chip
                    label={parrafo.etiqueta || parrafo.tipo}
                    size="small"
                    sx={{
                        bgcolor: colores.border,
                        color: colores.label,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                    }}
                />
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: colores.border }} />
            {parrafo.lineas?.map((linea, i) => (
                <Linea key={linea.id || i} segmentos={linea.segmentos} />
            ))}
        </Paper>
    );
}

export default function VisualizadorLetra({ contenido = [], titulo, autor, tonalidad }) {
    if (!contenido || contenido.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                    Esta canción no tiene letra cargada aún.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Encabezado */}
            {titulo && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">{titulo}</Typography>
                    {autor && (
                        <Typography variant="body2" color="text.secondary">{autor}</Typography>
                    )}
                    {tonalidad && (
                        <Chip
                            label={`Tonalidad: ${tonalidad}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                    )}
                    <Divider sx={{ mt: 2 }} />
                </Box>
            )}

            {/* Párrafos */}
            {contenido.map((parrafo, i) => (
                <Parrafo key={parrafo.id || i} parrafo={parrafo} />
            ))}

            {/* Leyenda de colores */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {Object.entries(COLORES_TIPO).map(([tipo, colores]) => (
                    <Chip
                        key={tipo}
                        label={tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        size="small"
                        sx={{ bgcolor: colores.bg, borderColor: colores.border, border: '1px solid' }}
                    />
                ))}
            </Box>
        </Box>
    );
}