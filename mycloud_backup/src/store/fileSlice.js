// frontend/src/store/fileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchFiles = createAsyncThunk(
    'files/fetchFiles',
    async (username, { rejectWithValue }) => {
        try {
            const url = username ? `/storage/files/?user=${username}` : '/storage/files/';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const uploadFile = createAsyncThunk(
    'files/uploadFile',
    async ({ file, comment, username }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (comment) formData.append('comment', comment);
            const url = username ? `/storage/files/upload/?user=${username}` : '/storage/files/upload/';
            const response = await api.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteFile = createAsyncThunk(
    'files/deleteFile',
    async (fileId, { rejectWithValue }) => {
        try {
            await api.delete(`/storage/files/${fileId}/`);
            return fileId;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const renameFile = createAsyncThunk(
    'files/renameFile',
    async ({ fileId, newName }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/storage/files/${fileId}/rename/`, { new_name: newName });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateComment = createAsyncThunk(
    'files/updateComment',
    async ({ fileId, comment }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/storage/files/${fileId}/comment/`, { comment });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const shareFile = createAsyncThunk(
    'files/shareFile',
    async ({ fileId, share }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/storage/files/${fileId}/share/`, { share });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    files: [],
    loading: false,
    error: null,
    uploadProgress: 0,
};

const fileSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearFiles: (state) => {
            state.files = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch files
            .addCase(fetchFiles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.files = action.payload;
                state.error = null;
            })
            .addCase(fetchFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Ошибка загрузки списка файлов';
            })
            // Upload file
            .addCase(uploadFile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadFile.fulfilled, (state, action) => {
                state.loading = false;
                state.files.unshift(action.payload);
                state.error = null;
                state.uploadProgress = 0;
            })
            .addCase(uploadFile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Ошибка загрузки файла';
                state.uploadProgress = 0;
            })
            // Delete file
            .addCase(deleteFile.fulfilled, (state, action) => {
                state.files = state.files.filter((f) => f.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteFile.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка удаления файла';
            })
            // Rename file
            .addCase(renameFile.fulfilled, (state, action) => {
                const index = state.files.findIndex((f) => f.id === action.payload.id);
                if (index !== -1) {
                    state.files[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(renameFile.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка переименования файла';
            })
            // Update comment
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.files.findIndex((f) => f.id === action.payload.id);
                if (index !== -1) {
                    state.files[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка обновления комментария';
            })
            // Share file
            .addCase(shareFile.fulfilled, (state, action) => {
                const index = state.files.findIndex((f) => f.id === action.payload.id);
                if (index !== -1) {
                    state.files[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(shareFile.rejected, (state, action) => {
                state.error = action.payload?.error || 'Ошибка управления доступом';
            });
    },
});

export const { setUploadProgress, clearError, clearFiles } = fileSlice.actions;
export default fileSlice.reducer;