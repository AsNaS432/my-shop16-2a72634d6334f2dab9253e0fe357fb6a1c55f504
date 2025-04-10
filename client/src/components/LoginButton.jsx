import React from 'react';
import { Button, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

const LoginButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  if (user) {
    return (
      <>
        <Button
          onClick={handleMenuOpen}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Avatar 
            sx={{ width: 32, height: 32 }} 
            src={user.avatar} 
            alt={user.email.charAt(0).toUpperCase()}
          />
          {user.email}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>Выйти</MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Button 
      variant="contained" 
      color="primary"
      onClick={() => navigate('/auth')}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
      }}
    >
      Войти
    </Button>
  );
};

export default LoginButton;
