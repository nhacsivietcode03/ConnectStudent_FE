import client from './client';

export const adminAPI = {
    createUser: async (userData) => {
        const response = await client.post('/admin/users', userData);
        return response.data;
    },

    getAllUsers: async (params = {}) => {
        const { page = 1, limit = 10, search = "", role = "" } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(role && { role })
        });
        const response = await client.get(`/admin/users?${queryParams}`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await client.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await client.delete(`/admin/users/${id}`);
        return response.data;
    },

    banUser: async (id, reason) => {
        const response = await client.post(`/admin/users/${id}/ban`, { reason });
        return response.data;
    },

    unbanUser: async (id) => {
        const response = await client.post(`/admin/users/${id}/unban`);
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await client.get('/admin/stats');
        return response.data;
    },

    exportUsers: async (format = 'csv') => {
        const response = await client.get(`/admin/users/export?format=${format}`, {
            responseType: 'blob'
        });
        return response.data;
    }
};

