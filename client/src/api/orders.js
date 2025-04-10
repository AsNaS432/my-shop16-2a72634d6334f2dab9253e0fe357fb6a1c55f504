import axios from 'axios';

// Updated base URL to point to the correct server port
const API_URL = 'http://localhost:5000/api/orders';

// Create an axios instance with base settings
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor for authorization
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interface for working with orders
const OrderService = {
  async createOrder(orderData) {
    try {
      if (!orderData?.user_id || !orderData?.products?.length) {
        throw new Error('Missing required fields');
      }

      console.log('Creating order with data:', {
        user_id: orderData.user_id,
        user_email: orderData.user_email,
        products: orderData.products.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          price: p.price,
          name: p.name
        })),
        phone_number: orderData.phone_number,
        delivery_method: orderData.delivery_method,
        address: orderData.delivery_method === 'delivery' 
          ? orderData.address 
          : 'Pickup'
      });

      const response = await apiClient.post('', {
        user_id: orderData.user_id,
        user_email: orderData.user_email,
        products: orderData.products.map(p => ({
          product_id: p.id,
          quantity: p.quantity,
          price: p.price,
          name: p.name
        })),
        phone_number: orderData.phone_number,
        delivery_method: orderData.delivery_method,
        address: orderData.delivery_method === 'delivery' 
          ? orderData.address 
          : 'Pickup'
      });

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status || 500
      };
    }
  },

  async getOrdersByUser(userId) {
    try {
      const response = await apiClient.get(`?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  async getOrderDetails(orderId) {
    try {
      const response = await apiClient.get(`/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order details error:', error);
      throw error;
    }
  }
};

export default OrderService;
