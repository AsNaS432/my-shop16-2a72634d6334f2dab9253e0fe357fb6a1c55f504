import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import productsReducer from '../features/productsSlice';
import cartReducer from '../features/cartSlice';
import authReducer from '../features/authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart', 'auth']
};

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  auth: authReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
