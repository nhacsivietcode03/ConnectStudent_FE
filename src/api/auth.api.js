import client from './client';

export const authAPI = {
    sendOTP: async (email) => {
        const response = await client.post('/auth/send-otp', { email });
        return response.data;
    },

    login: async (email, password) => {
        const response = await client.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await client.post('/auth/register', userData);
        return response.data;
    },

    me: async () => {
        const response = await client.get('/auth/me');
        return response.data;
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await client.post('/auth/logout', { token: refreshToken });
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await client.put('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    sendOTPResetPassword: async (email) => {
        const response = await client.post('/auth/send-otp-reset', { email });
        return response.data;
    },

    resetPassword: async (email, otpCode, otpToken, newPassword) => {
        const response = await client.post('/auth/reset-password', {
            email,
            otpCode,
            otpToken,
            newPassword,
        });
        return response.data;
    },
};

