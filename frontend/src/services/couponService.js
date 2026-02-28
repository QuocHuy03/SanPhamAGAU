import api from './api';

const couponService = {
    validateCoupon: async (code, amount) => {
        return await api.post('/coupons/validate', { code, amount });
    },

    getAllCoupons: async () => {
        return await api.get('/coupons');
    },

    createCoupon: async (couponData) => {
        return await api.post('/coupons', couponData);
    },

    updateCoupon: async (id, couponData) => {
        return await api.put(`/coupons/${id}`, couponData);
    },

    deleteCoupon: async (id) => {
        return await api.delete(`/coupons/${id}`);
    }
};

export default couponService;
