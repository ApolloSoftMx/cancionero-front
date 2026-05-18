import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Box, Card, CardContent, TextField,
    Button, Typography, Alert, CircularProgress
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.usuario);
            navigate('/canciones');
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5'
        }}>
            <Card sx={{ width: 380, p: 2, borderRadius: 3, boxShadow: 4 }}>
                <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <MusicNoteIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h5" fontWeight="bold">
                            Cancionero Católico
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Inicia sesión para continuar
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Correo electrónico"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Contraseña"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}