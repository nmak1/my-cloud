// frontend/src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login/', { username, password });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка входа' });
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register/', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка регистрации' });
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/logout/');
            return {};
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка выхода' });
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || {});
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Ошибка входа';
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Ошибка регистрации';
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            })
            // Check auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;