import React, { useContext, useState } from 'react';
import { Container, Typography, Grid, IconButton, useTheme, Button, Paper } from '@mui/material';
import UserInfoPopup from './components/UserInfoPopup'; // Import UserInfoPopup
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AuthPage from './pages/AuthPage';
import LoginButton from './components/LoginButton'; // Re-import LoginButton
import AIChatPopup from './components/AIChatPopup';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const theme = useTheme();
  const { toggleTheme } = useContext(ThemeContext);
  const [openAI, setOpenAI] = useState(false); // State for AI chat popup
  const [userInfoPopupOpen, setUserInfoPopupOpen] = useState(false); // State for UserInfoPopup
  const [user, setUser] = useState({ name: 'User Name', email: 'user@example.com' }); // Example user data
  const [orderHistory, setOrderHistory] = useState([]); // Example order history

  return (
    <Router>
      <Container>
        <Paper elevation={6} sx={{ 
          p: 3,
          mb: 4,
          textAlign: 'center',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1a237e, #283593)' 
            : 'linear-gradient(145deg, #3f51b5, #5c6bc0)',
          color: 'white',
          borderRadius: 0, // Remove border radius to stretch across the screen
          boxShadow: theme.shadows[10],
          width: '100%' // Ensure it spans the full width
        }}>
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}>
            MYtoolsShop
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
            Магазин качественных комплектующих
          </Typography>
        </Paper>
        <IconButton 
          onClick={toggleTheme} 
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <LoginButton /> {/* Re-add LoginButton */}
        
        {/* AI Assistant Button */}
        <Button 
          variant="contained" 
          size="small" // Set button size to small
          onClick={() => setOpenAI(true)}
          sx={{ position: 'absolute', top: 16, right: 80 }}
        >
          AI Помощник
        </Button>

        {/* Profile Button */}
        <Button 
          variant="contained" 
          size="small" // Set button size to small
          onClick={() => setUserInfoPopupOpen(true)} // Button to open UserInfoPopup
          sx={{ position: 'absolute', top: 70, left: 16 }} // Move Profile button slightly higher
        >
          Профиль {/* Updated button text */}
        </Button>
        
        <AIChatPopup
          open={openAI} 
          onClose={() => setOpenAI(false)}
        />
        
        <Routes>
          <Route path="/" element={
            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                <ProductList />
              </Grid>
              <Grid item xs={12} md={3}>
                <Cart />
              </Grid>
            </Grid>
          } />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>

        {/* UserInfoPopup Component */}
        <UserInfoPopup 
          open={userInfoPopupOpen} 
          onClose={() => setUserInfoPopupOpen(false)} 
          user={user} 
          orderHistory={orderHistory} 
        />
      </Container>
    </Router>
  );
}

export default App;
