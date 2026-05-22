import { createTheme } from '@mui/material/styles';

export function crearTema(modo) {
    return createTheme({
        palette: {
            mode: modo,
        },
    });
}