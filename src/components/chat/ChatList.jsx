import React, { useState, useEffect, useCallback } from "react";
import { chatAPI } from "../../api/chat.api";
import { useSocket } from "../../contexts/SocketContext";
import "./Chat.css";

const ChatList = ({ onSelectConversation, selectedConversationId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { socket, isConnected } = useSocket();

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getConversations();
            setConversations(response.conversations || []);
        } catch (error) {
            console.error("Error loading conversations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleNewMessage = useCallback(
        (message) => {
            setConversations((prev) => {
                const updated = prev.map((conv) => {
                    if (conv._id?.toString() === message.conversation?.toString()) {
                        return {
                            ...conv,
                            lastMessage: message,
                            lastMessageAt: message.createdAt,
                            unreadCount:
                                conv._id?.toString() === selectedConversationId?.toString()
                                    ? 0
                                    : (conv.unreadCount || 0) + 1,
                        };
                    }
                    return conv;
                });

                // Move conversation to top if it exists
                const convIndex = updated.findIndex(
                    (c) => c._id?.toString() === message.conversation?.toString()
                );
                if (convIndex > 0) {
                    const [moved] = updated.splice(convIndex, 1);
                    updated.unshift(moved);
                } else if (convIndex === -1) {
                    // If conversation doesn't exist, add it to the top
                    const newConv = {
                        _id: message.conversation,
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: 1,
                        participants: [message.sender],
                    };
                    updated.unshift(newConv);
                }

                return updated;
            });
        },
        [selectedConversationId]
    );

    const handleMessageReceived = useCallback(
        (data) => {
            const { message } = data;
            if (message) {
                handleNewMessage(message);
            }
        },
        [handleNewMessage]
    );

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        if (socket && isConnected) {
            // Listen for new messages
            socket.on("new_message", handleNewMessage);
            socket.on("message_received", handleMessageReceived);

            return () => {
                socket.off("new_message", handleNewMessage);
                socket.off("message_received", handleMessageReceived);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isConnected]);

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

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return messageDate.toLocaleDateString("vi-VN");
    };

    if (loading) {
        return (
            <div className="chat-list">
                <div className="chat-list-header">
                    <h5>Messages</h5>
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                    autoComplete="off"
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
                                    <div className="username">{user.username || user.email}</div>
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
                        <p>No conversations yet</p>
                        <p style={{ fontSize: "13px", marginTop: "8px", opacity: 0.7 }}>
                            Search for users to start a conversation
                        </p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const otherUser = conv.otherParticipant;
                        const isSelected =
                            conv._id?.toString() === selectedConversationId?.toString();

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
                                            {conv.lastMessage?.content || "No messages yet"}
                                        </span>
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
