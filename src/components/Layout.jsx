import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, IconButton,
    Divider, Avatar, Menu, MenuItem, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';

const DRAWER_WIDTH = 240;

const menuItems = [
    { label: 'Canciones',       icon: <LibraryMusicIcon />, path: '/canciones' },
    { label: 'Nueva Canción',   icon: <AddCircleIcon />,    path: '/canciones/nueva' },
    { label: 'Esquemas de Misa',icon: <EventNoteIcon />,    path: '/esquemas' },
];

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl]     = useState(null);
    const { usuario, logout }         = useAuth();
    const navigate  = useNavigate();
    const location  = useLocation();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    const drawer = (
        <Box>
            <Toolbar sx={{ gap: 1 }}>
                <MusicNoteIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                    Cancionero
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar superior */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2, display: { lg: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Cancionero Católico
                    </Typography>

                    {/* Avatar y menú de usuario */}
                    <Tooltip title={usuario?.nombre}>
                        <IconButton onClick={e => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 35, height: 35, fontSize: 14 }}>
                                {usuario?.nombre?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2">{usuario?.email}</Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Cerrar sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Drawer lateral */}
            <Box component="nav" sx={{flexShrink: { lg: 0 } }}>
                {/* Mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop */}
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Contenido principal */}
            <Box component="main" sx={{
                flexGrow: 1,
                 p: { xs: 1, sm: 3 },
                mt: 8,
                minWidth: 0,
                // ml: { xs: 0, lg: `${DRAWER_WIDTH}px` },
                width: { xs: '100%', lg: `calc(100% - ${DRAWER_WIDTH}px)` },
            }}>
                <Outlet />
            </Box>
        </Box>
    );
}