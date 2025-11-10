import client from "./client";

export const userAPI = {
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await client.post("/users/upload-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};
