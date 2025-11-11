import client from './client'

export const fetchPosts = () => {
	return client.get('/posts')
}

export const fetchPost = (id) => {
	return client.get(`/posts/${id}`)
}

export const createPost = (formData) => {
	return client.post('/posts', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

export const updatePost = (id, formData) => {
	return client.put(`/posts/${id}`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

export const deletePost = (id) => {
	return client.delete(`/posts/${id}`)
}

export const createComment = (postId, payload) => {
	return client.post(`/posts/${postId}/comments`, payload)
}

export const fetchComments = (postId) => {
	return client.get(`/posts/${postId}/comments`)
}

export const deleteComment = (postId, commentId) => {
	return client.delete(`/posts/${postId}/comments/${commentId}`)
}

export const updateComment = (postId, commentId, payload) => {
	return client.put(`/posts/${postId}/comments/${commentId}`, payload)
}

export const toggleLike = (postId) => {
	return client.post(`/posts/${postId}/like`)
}


