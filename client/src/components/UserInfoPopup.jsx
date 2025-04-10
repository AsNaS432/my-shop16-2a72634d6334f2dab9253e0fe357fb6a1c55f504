import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import ProfileDialog from './ProfileDialog'; // Import ProfileDialog

const UserInfoPopup = ({ open, onClose, user, orderHistory }) => {
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Информация о пользователе</DialogTitle>
        <DialogContent>
          <Typography variant="h6">Email: {user.email}</Typography>
          <Typography variant="h6">История заказов:</Typography>
          {orderHistory && orderHistory.length === 0 ? (
            <Typography>Нет заказов</Typography>
          ) : (
            orderHistory && orderHistory.map((order, index) => (
              <Typography key={index}>
                Заказ #{order.id}: {order.total} ₽
              </Typography>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <ProfileDialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} />
    </>
  );
};

export default UserInfoPopup;
