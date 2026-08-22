// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import fileReducer from './fileSlice';
import userReducer from './userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        files: fileReducer,
        users: userReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});