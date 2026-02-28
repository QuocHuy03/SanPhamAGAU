import api from './api';

const wishlistService = {
    getWishlist: async () => {
        return await api.get('/wishlist');
    },

    addToWishlist: async (productId) => {
        return await api.post('/wishlist/add', { productId });
    },

    removeFromWishlist: async (productId) => {
        return await api.delete(`/wishlist/remove/${productId}`);
    },

    clearWishlist: async () => {
        return await api.delete('/wishlist/clear');
    }
};

export default wishlistService;
