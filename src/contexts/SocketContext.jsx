import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
	const context = useContext(SocketContext)
	if (!context) {
		throw new Error('useSocket must be used within a SocketProvider')
	}
	return context
}

export const SocketProvider = ({ children }) => {
	const { isAuthenticated, user } = useAuth()
	const [socket, setSocket] = useState(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		if (isAuthenticated && user) {
			const token = localStorage.getItem('accessToken')
			const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999'
			
			const newSocket = io(API_URL, {
				auth: {
					token: token
				},
				transports: ['websocket', 'polling']
			})

			newSocket.on('connect', () => {
				console.log('Socket connected')
				setIsConnected(true)
			})

			newSocket.on('disconnect', () => {
				console.log('Socket disconnected')
				setIsConnected(false)
			})

			newSocket.on('connect_error', (error) => {
				console.error('Socket connection error:', error.message)
				setIsConnected(false)
			})

			setSocket(newSocket)

			return () => {
				newSocket.close()
				setSocket(null)
				setIsConnected(false)
			}
		} else {
			if (socket) {
				socket.close()
				setSocket(null)
				setIsConnected(false)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, user])

	const value = {
		socket,
		isConnected
	}

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	)
}

