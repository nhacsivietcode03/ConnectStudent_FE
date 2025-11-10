import client from './client'

export const fetchNotifications = () => {
	return client.get('/notifications')
}

export const getUnreadCount = () => {
	return client.get('/notifications/unread-count')
}

export const markAsRead = (notificationId) => {
	return client.put(`/notifications/${notificationId}/read`)
}

export const markAllAsRead = () => {
	return client.put('/notifications/read-all')
}

