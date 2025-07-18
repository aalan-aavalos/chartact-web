import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Home,
  Article,
  Memory,
  Menu,
  Close,
} from '@mui/icons-material';

import { Box, IconButton, Typography, Tooltip } from '@mui/material';

const navItems = [
  { to: '/', label: 'Inicio', icon: <Home fontSize="small" /> },
  { to: '/models', label: 'Modelos', icon: <Memory fontSize="small" /> },
  { to: '/documents', label: 'Documentos', icon: <Article fontSize="small" /> },
];

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        width: collapsed ? '64px' : '240px',
        bgcolor: 'grey.900',
        color: 'white',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 2,
          borderBottom: '1px solid #444',
        }}
      >
        {!collapsed && <Box
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : 'auto',

          }}
        >
          <Typography variant="h6">Mi App</Typography>
        </Box>}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            color: 'white', '&:hover': {
              bgcolor: 'grey.800',
            },
          }}
        >
          {collapsed ? <Menu /> : <Close />}
        </IconButton>
      </Box>

      {/* Nav Items */}
      <Box component="nav" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <Tooltip key={to} title={collapsed ? label : ''} placement="right">
              <Link to={to} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: collapsed ? 0 : 2,
                    py: 1,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: isActive ? 'grey.800' : 'transparent',
                    color: isActive ? 'warning.main' : 'white',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'grey.800',
                    },
                  }}
                >
                  {icon}
                  {!collapsed && <Typography variant="body2">{label}</Typography>}
                </Box>
              </Link>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default Sidebar;
