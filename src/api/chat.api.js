import client from "./client";

export const chatAPI = {
    // Get or create conversation with a user
    getOrCreateConversation: async (userId) => {
        const response = await client.get(`/chat/conversation/${userId}`);
        return response.data;
    },

    // Get all conversations for current user
    getConversations: async () => {
        const response = await client.get("/chat/conversations");
        return response.data;
    },

    // Get messages for a conversation
    getMessages: async (conversationId, page = 1, limit = 50) => {
        const response = await client.get(`/chat/messages/${conversationId}`, {
            params: { page, limit },
        });
        return response.data;
    },

    // Get users for chat
    getChatUsers: async (search = "") => {
        const response = await client.get("/chat/users", {
            params: { search },
        });
        return response.data;
    },
};
