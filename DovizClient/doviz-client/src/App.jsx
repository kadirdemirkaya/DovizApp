import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import
{
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Home from './pages/Home';
import Converter from './pages/Converter';
import Historical from './pages/Historical';
import Crypto from './pages/Crypto';
import Chat from './components/Chat';
import './App.css';

function App()
{
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () =>
  {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Currency Converter', path: '/converter' },
    { text: 'Historical Rates', path: '/historical' },
    { text: 'Cryptocurrencies', path: '/crypto' }
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem disablePadding key={item.text}>
          <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle}>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ backgroundColor: '#4caf50' }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CurrencyApp
            </Typography>
            {!isMobile && (
              <Box>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    component={Link}
                    to={item.path}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
        <Box
          component="main"
          sx={{
            pt: { xs: 8, sm: 10 },
            pb: 4,
            minHeight: '100vh',
            backgroundColor: (theme) => theme.palette.background.default
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/historical" element={<Historical />} />
            <Route path="/crypto" element={<Crypto />} />
          </Routes>
        </Box>
        <Chat />
      </Box>
    </BrowserRouter>
  );
}

export default App;
