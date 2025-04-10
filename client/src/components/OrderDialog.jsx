import React, { useState, useEffect } from 'react';
import OrderService from '../api/orders'; // Corrected import for OrderService
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Tabs, 
  Tab, 
  Box, 
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../features/ordersSlice';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const OrderDialog = ({ open, onClose, cartItems }) => {
  const [tabValue, setTabValue] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);

  // Сбрасываем форму при открытии/закрытии
  useEffect(() => {
    if (!open) {
      setTabValue(0);
      setAddress('');
      setPhone('');
      setPhoneError('');
      setFormErrors({});
    }
  }, [open]);

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9\s()-]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    if (!value) {
      setPhoneError('Номер телефона обязателен');
      return false;
    } else if (!validatePhone(value)) {
      setPhoneError('Введите корректный номер (10-15 цифр)');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!handlePhoneChange({ target: { value: phone } })) {
      errors.phone = 'Неверный формат телефона';
      isValid = false;
    }

    if (tabValue === 1 && !address.trim()) {
      errors.address = 'Укажите адрес доставки';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const orderData = {
        user_id: user.id,
        user_email: user.email,
        products: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.title
        })),
        phone_number: phone.replace(/[\s()-]/g, ''),
        delivery_method: tabValue === 0 ? 'pickup' : 'delivery',
        address: tabValue === 1 ? address : 'Самовывоз: г. Москва, ул. Примерная, д. 1',
        total_amount: calculateTotal()
      };
      
      const result = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(result)) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      } else if (createOrder.rejected.match(result)) {
        setFormErrors({
          submit: result.error.message || 'Ошибка при оформлении заказа'
        });
      }
    } catch (error) {
      console.error('Order submission error:', error);
      setFormErrors({
        submit: error.message || 'Произошла ошибка'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {showSuccess && (
        <Dialog open={true} onClose={() => setShowSuccess(false)}>
          <DialogTitle>Спасибо за заказ!</DialogTitle>
          <DialogContent>
            <Typography>Номер вашего заказа: {formErrors.orderId}</Typography>
            <Typography>С Вами свяжутся для подтверждения.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSuccess(false)}>OK</Button>
          </DialogActions>
        </Dialog>
      )}
      
      <DialogTitle>Оформление заказа</DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Ваш заказ:</Typography>
        <List dense>
          {cartItems.map(item => (
            <ListItem key={item.id}>
              <ListItemText 
                primary={item.title} 
                secondary={`${item.quantity} × ${item.price.toLocaleString()} ₽`}
              />
              <ListItemSecondaryAction>
                <Typography>
                  {(item.quantity * item.price).toLocaleString()} ₽
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="h6">
            Итого: {calculateTotal().toLocaleString()} ₽
          </Typography>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mt: 2 }}
        >
          <Tab label="Самовывоз" />
          <Tab label="Доставка" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            label="Контактный телефон"
            value={phone}
            onChange={handlePhoneChange}
            margin="normal"
            required
            error={!!phoneError}
            helperText={phoneError || "Например: +7 912 345-67-89"}
            sx={{ mb: 2 }}
            inputProps={{
              inputMode: 'tel',
              maxLength: 18
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Адрес самовывоза: г. Москва, ул. Примерная, д. 1
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Часы работы: Пн-Пт с 10:00 до 20:00
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TextField
            fullWidth
            label="Контактный телефон"
            value={phone}
            onChange={handlePhoneChange}
            margin="normal"
            required
            error={!!phoneError}
            helperText={phoneError || "Например: +7 912 345-67-89"}
            sx={{ mb: 2 }}
            inputProps={{
              inputMode: 'tel',
              maxLength: 18
            }}
          />
          <TextField
            fullWidth
            label="Адрес доставки"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            margin="normal"
            required
            error={!!formErrors.address}
            helperText={formErrors.address || "Укажите улицу, дом и квартиру"}
            multiline
            rows={2}
          />
        </TabPanel>

        {formErrors.submit && (
          <Typography color="error" sx={{ mt: 2 }}>
            {formErrors.submit}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !phone || 
            (tabValue === 1 && !address.trim()) || 
            isSubmitting ||
            !!phoneError
          }
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Оформляем...' : 'Подтвердить заказ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDialog;
