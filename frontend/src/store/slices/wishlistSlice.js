import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';
import { toast } from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistService.getWishlist();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách yêu thích');
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistService.addToWishlist(productId);
            toast.success(response.message || 'Đã thêm vào yêu thích');
            return productId;
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể thêm vào yêu thích';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistService.removeFromWishlist(productId);
            toast.success(response.message || 'Đã xóa khỏi yêu thích');
            return productId;
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể xóa khỏi yêu thích';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                // Technically we should refetch to get full product objects
                // but for now we just handle local IDs if needed
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = state.items.filter(item =>
                    (item._id || item) !== action.payload
                );
            });
    }
});

export default wishlistSlice.reducer;
