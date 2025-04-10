import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cartSlice';

const formatPrice = (price) => {
  return price.toLocaleString('ru-RU') + ' ₽'; // Removed decimal formatting
};

const ProductCard = ({ product }) => {
 const dispatch = useDispatch();
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <Card sx={{ maxWidth: 345, margin: 3, boxShadow: 6, backgroundColor: '#f5f5f5' }}>
 <CardMedia
 component="img"
 height="140"
 image={product.image}
 alt={product.title}
 />
 <CardContent>
 <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{product.title}</Typography>
 <Typography variant="body2" sx={{ color: '#666' }}>{product.description}</Typography>
 <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000' }}>{formatPrice(product.price)}</Typography>
 <Button
 variant="contained"
 sx={{ backgroundColor: '#ff5722', color: '#ffffff' }}
 onClick={() => dispatch(addToCart(product))}
 >
 Добавить в корзину
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 );
};

export default ProductCard;
