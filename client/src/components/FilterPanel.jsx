import React from 'react';
import { Button, ButtonGroup, Paper, Typography } from '@mui/material';

const FilterPanel = ({ onFilterChange }) => {
 const categories = [
   { label: 'Все', value: 'all' },
   { label: 'Ноутбуки', value: 'laptops' },
   { label: 'Телефоны', value: 'phones' },
   { label: 'Планшеты', value: 'tablets' },
 ];


 return (
   <Paper elevation={3} sx={{ 
     p: 2,
     mb: 2,
     textAlign: 'center',
     backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'
   }}>
     <Typography variant="h6" sx={{ mb: 1 }}>Запчасти на</Typography>
     <ButtonGroup fullWidth variant="contained" sx={{ 
       gap: 1,
       '& .MuiButton-root': {
         py: 1.5,
         fontWeight: 500,
         letterSpacing: 0.5,
         transition: 'all 0.3s ease',
         '&:hover': {
           transform: 'translateY(-2px)',
           boxShadow: (theme) => theme.shadows[4]
         }
       }
     }}>
     {categories.map((category) => (
       <Button key={category.value} onClick={() => {

         console.log('Selected Category:', category.value);
         onFilterChange(category.value);

       }}>
         {category.label}

       </Button>
     ))}
   </ButtonGroup>
   </Paper>
 );
};

export default FilterPanel;
