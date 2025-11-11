import client from './client'

export const sendFollowRequest = (userId) => {
	return client.post(`/follow/request/${userId}`)
}

export const getIncomingRequests = () => {
	return client.get('/follow/requests')
}

export const getFollowing = () => {
	return client.get('/follow/following')
}

export const getFollowers = () => {
	return client.get('/follow/followers')
}

export const acceptFollowRequest = (id) => {
	return client.post(`/follow/accept/${id}`)
}

export const rejectFollowRequest = (id) => {
	return client.post(`/follow/reject/${id}`)
}

export const unfollow = (userId) => {
	return client.delete(`/follow/unfollow/${userId}`)
}

export const removeFollower = (userId) => {
	return client.delete(`/follow/remove-follower/${userId}`)
}


