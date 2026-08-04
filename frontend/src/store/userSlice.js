// frontend/src/store/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/users/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка загрузки пользователей' });
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            await api.delete(`/auth/users/${userId}/`);
            return userId;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка удаления пользователя' });
        }
    }
);

export const updateUserAdmin = createAsyncThunk(
    'users/updateUserAdmin',
    async ({ userId, isAdmin }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/auth/users/${userId}/admin/`, { is_admin: isAdmin });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка обновления статуса' });
        }
    }
);

const initialState = {
    users: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Ошибка загрузки пользователей';
            })
            // Delete user
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка удаления пользователя';
            })
            // Update admin status
            .addCase(updateUserAdmin.fulfilled, (state, action) => {
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateUserAdmin.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка обновления статуса';
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;