import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponService from '../../services/couponService';
import { toast } from 'react-hot-toast';

export const validateCoupon = createAsyncThunk(
    'coupon/validate',
    async ({ code, amount }, { rejectWithValue }) => {
        try {
            const response = await couponService.validateCoupon(code, amount);
            toast.success('Áp dụng mã giảm giá thành công');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Mã giảm giá không hợp lệ';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const couponSlice = createSlice({
    name: 'coupon',
    initialState: {
        appliedCoupon: null,
        loading: false,
        error: null
    },
    reducers: {
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(validateCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.appliedCoupon = action.payload;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.appliedCoupon = null;
            });
    }
});

export const { removeCoupon } = couponSlice.actions;
export default couponSlice.reducer;
