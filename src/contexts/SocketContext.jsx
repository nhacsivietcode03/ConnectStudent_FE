import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            const token = localStorage.getItem("accessToken");
            const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";
            const socketURL = API_URL.replace("/api", "");

            // Initialize socket connection
            const newSocket = io(socketURL, {
                auth: {
                    token: token,
                },
                transports: ["websocket", "polling"],
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            // Connection events
            newSocket.on("connect", () => {
                console.log("Socket connected");
                setIsConnected(true);
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
                setIsConnected(false);
            });

            // Cleanup on unmount
            return () => {
                if (newSocket) {
                    newSocket.disconnect();
                }
            };
        } else {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [isAuthenticated, user]);

    const value = {
        socket,
        isConnected,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
