import React, { useState, useEffect } from "react";
import { chatAPI } from "../../api/chat.api";
import { useSocket } from "../../contexts/SocketContext";
import "./Chat.css";

const ChatList = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        loadConversations();

        if (socket && isConnected) {
            // Listen for new messages
            socket.on("new_message", handleNewMessage);
            socket.on("message_received", handleMessageReceived);

            return () => {
                socket.off("new_message", handleNewMessage);
                socket.off("message_received", handleMessageReceived);
            };
        }
    }, [socket, isConnected]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations();
            setConversations(response.conversations || []);
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (message) => {
        setConversations((prev) => {
            const updated = prev.map((conv) => {
                if (conv._id === message.conversation) {
                    return {
                        ...conv,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount:
                            conv._id === selectedConversationId ? 0 : (conv.unreadCount || 0) + 1,
                    };
                }
                return conv;
            });

            // Move conversation to top
            const convIndex = updated.findIndex((c) => c._id === message.conversation);
            if (convIndex > 0) {
                const [moved] = updated.splice(convIndex, 1);
                updated.unshift(moved);
            }

            return updated;
        });
    };

    const handleMessageReceived = (data) => {
        const { conversationId, message } = data;
        handleNewMessage(message);
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim()) {
            try {
                const response = await chatAPI.getChatUsers(term);
                setSearchResults(response.users || []);
            } catch (error) {
                console.error("Error searching users:", error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleStartConversation = async (userId) => {
        try {
            const response = await chatAPI.getOrCreateConversation(userId);
            setSearchTerm("");
            setSearchResults([]);
            await loadConversations();
            if (response.conversation) {
                onSelectConversation(response.conversation);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    const formatTime = (date) => {
        if (!date) return "";
        const messageDate = new Date(date);
        const now = new Date();
        const diff = now - messageDate;

        if (diff < 60000) return "Vừa xong";
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
        return messageDate.toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="chat-list">
                <div className="chat-list-header">
                    <h5>Tin nhắn</h5>
                </div>
                <div className="text-center p-3">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <h5>Tin nhắn</h5>
            </div>

            <div className="chat-search">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((user) => (
                            <div
                                key={user._id}
                                className="search-result-item"
                                onClick={() => handleStartConversation(user._id)}
                            >
                                <img
                                    src={user.avatar || "/default-avatar.png"}
                                    alt={user.username}
                                    className="avatar"
                                />
                                <div className="user-info">
                                    <div className="username">{user.username}</div>
                                    <div className="email">{user.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="conversations">
                {conversations.length === 0 ? (
                    <div className="no-conversations">
                        <p>Chưa có cuộc trò chuyện nào</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const otherUser = conv.otherParticipant;
                        const isSelected = conv._id === selectedConversationId;

                        return (
                            <div
                                key={conv._id}
                                className={`conversation-item ${isSelected ? "active" : ""}`}
                                onClick={() => onSelectConversation(conv)}
                            >
                                <img
                                    src={otherUser?.avatar || "/default-avatar.png"}
                                    alt={otherUser?.username}
                                    className="avatar"
                                />
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <span className="username">
                                            {otherUser?.username || "Unknown"}
                                        </span>
                                        {conv.lastMessageAt && (
                                            <span className="time">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="conversation-preview">
                                        <span className="last-message">
                                            {conv.lastMessage?.content || "Chưa có tin nhắn"}
                                        </span>
                                        {conv.unreadCount > 0 && (
                                            <span className="unread-badge">{conv.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatList;
