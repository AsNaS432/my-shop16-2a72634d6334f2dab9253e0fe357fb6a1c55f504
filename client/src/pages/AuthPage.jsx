
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Tabs, 
  Tab,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure
} from '../features/authSlice';
import { login, register } from '../api/auth';

const AuthPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { status, error } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'succeeded') {
      navigate('/');
    }
  }, [status, navigate]);

  const validateLogin = () => {
    const errors = {};
    if (!loginData.email) errors.email = 'Email обязателен';
    if (!loginData.password) errors.password = 'Пароль обязателен';
    return errors;
  };

  const validateRegister = () => {
    const errors = {};
    if (!registerData.email) errors.email = 'Email обязателен';
    if (!registerData.password) errors.password = 'Пароль обязателен';
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }
    return errors;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      dispatch(loginStart());
      const response = await login(loginData);
      dispatch(loginSuccess(response));
    } catch (err) {
      dispatch(loginFailure(err.message || 'Ошибка входа'));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      dispatch(registerStart());
      const response = await register({
        email: registerData.email,
        password: registerData.password
      });
      dispatch(registerSuccess(response));
    } catch (err) {
      dispatch(registerFailure(err.message || 'Ошибка регистрации'));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Button 
          variant="outlined" 
          fullWidth 
          sx={{ mb: 2 }}
          onClick={() => window.location.href = 'http://localhost:5173/'}
        >
          Главная
        </Button>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab label="Вход" />
          <Tab label="Регистрация" />
        </Tabs>

        {tabValue === 0 ? (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              margin="normal"
              required
            />
            {error && tabValue === 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <CircularProgress size={24} color="inherit" />
              ) : 'Войти'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              name="password"
              type="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Подтвердите пароль"
              name="confirmPassword"
              type="password"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              margin="normal"
              required
            />
            {error && tabValue === 1 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2 }}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <CircularProgress size={24} color="inherit" />
              ) : 'Зарегистрироваться'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AuthPage;
