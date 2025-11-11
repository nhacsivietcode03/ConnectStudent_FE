import React, { useState, useEffect, useRef, useCallback } from "react";
import { chatAPI } from "../../api/chat.api";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import MessageItem from "./MessageItem";
import "./Chat.css";

const ChatWindow = ({ conversation }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();

    const markAsRead = useCallback(() => {
        if (socket && isConnected && conversation) {
            socket.emit("mark_as_read", {
                conversationId: conversation._id,
            });
        }
    }, [socket, isConnected, conversation]);

    const joinConversation = useCallback(() => {
        if (socket && isConnected && conversation) {
            socket.emit("join_conversation", conversation._id);
            markAsRead();
        }
    }, [socket, isConnected, conversation, markAsRead]);

    const loadMessages = useCallback(
        async (pageNum = 1) => {
            if (!conversation) return;

            try {
                setLoading(true);
                const response = await chatAPI.getMessages(conversation._id, pageNum, 50);
                const newMessages = response.messages || [];

                if (pageNum === 1) {
                    setMessages(newMessages);
                } else {
                    setMessages((prev) => [...newMessages, ...prev]);
                }

                setHasMore(response.hasMore);
                setPage(pageNum);
            } catch (error) {
                console.error("Error loading messages:", error);
            } finally {
                setLoading(false);
            }
        },
        [conversation]
    );

    const handleNewMessage = useCallback(
        (message) => {
            if (message.conversation?.toString() === conversation?._id?.toString()) {
                setMessages((prev) => {
                    // Check if message already exists
                    const exists = prev.some(
                        (msg) => msg._id?.toString() === message._id?.toString()
                    );
                    if (exists) {
                        return prev;
                    }

                    // Replace temporary message if exists (optimistic update)
                    const tempIndex = prev.findIndex(
                        (msg) =>
                            msg._id?.toString().startsWith("temp_") &&
                            msg.content === message.content &&
                            msg.sender._id?.toString() === message.sender._id?.toString()
                    );

                    if (tempIndex !== -1) {
                        const updated = [...prev];
                        updated[tempIndex] = message;
                        return updated;
                    }

                    return [...prev, message];
                });
                markAsRead();
            }
        },
        [conversation, markAsRead]
    );

    const handleUserTyping = useCallback(
        (data) => {
            if (data.userId?.toString() !== user._id?.toString()) {
                setTypingUser(data.username);
                setIsTyping(true);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser(null);
                }, 3000);
            }
        },
        [user._id]
    );

    const handleMessagesRead = useCallback(
        (data) => {
            if (data.conversationId?.toString() === conversation?._id?.toString()) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender._id?.toString() === user._id?.toString() &&
                        !msg.readBy?.some((r) => r.user?.toString() === data.readBy?.toString())
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
            }
        },
        [conversation, user._id]
    );

    useEffect(() => {
        if (conversation) {
            loadMessages(1);
            joinConversation();
        }

        return () => {
            if (socket && conversation) {
                socket.emit("leave_conversation", conversation._id);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?._id]);

    useEffect(() => {
        if (socket && isConnected && conversation) {
            socket.on("new_message", handleNewMessage);
            socket.on("user_typing", handleUserTyping);
            socket.on("messages_read", handleMessagesRead);

            return () => {
                socket.off("new_message", handleNewMessage);
                socket.off("user_typing", handleUserTyping);
                socket.off("messages_read", handleMessagesRead);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isConnected, conversation?._id]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const loadMoreMessages = () => {
        if (!loading && hasMore) {
            loadMessages(page + 1);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !isConnected || !conversation) return;

        const messageContent = newMessage.trim();
        setNewMessage("");

        // Optimistic update - add message immediately
        const tempMessage = {
            _id: `temp_${Date.now()}`,
            conversation: conversation._id,
            sender: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
            content: messageContent,
            readBy: [],
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setMessages((prev) => [...prev, tempMessage]);

        try {
            socket.emit("send_message", {
                conversationId: conversation._id,
                content: messageContent,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove optimistic message and restore input
            setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
            setNewMessage(messageContent);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        if (socket && isConnected && conversation) {
            socket.emit("typing", {
                conversationId: conversation._id,
                isTyping: value.length > 0,
            });
        }
    };

    if (!conversation) {
        return (
            <div className="chat-window empty">
                <div className="empty-state">
                    <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    <p style={{ fontSize: "14px", marginTop: "12px", opacity: 0.7 }}>
                        Hoặc tìm kiếm người dùng mới để nhắn tin
                    </p>
                </div>
            </div>
        );
    }

    const otherUser =
        conversation.otherParticipant ||
        conversation.participants?.find((p) => p._id?.toString() !== user._id?.toString());

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-header-info">
                    <img
                        src={otherUser?.avatar || "/default-avatar.png"}
                        alt={otherUser?.username}
                        className="avatar"
                    />
                    <div>
                        <div className="username">{otherUser?.username || "Unknown"}</div>
                        {isTyping && typingUser && (
                            <div className="typing-indicator">{typingUser} đang nhập...</div>
                        )}
                    </div>
                </div>
            </div>

            <div
                className="messages-container"
                ref={messagesContainerRef}
                onScroll={(e) => {
                    if (e.target.scrollTop === 0 && hasMore) {
                        loadMoreMessages();
                    }
                }}
            >
                {loading && page > 1 && (
                    <div className="text-center p-2">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const showAvatar =
                        !prevMessage ||
                        prevMessage.sender._id?.toString() !== message.sender._id?.toString();

                    return (
                        <MessageItem
                            key={message._id}
                            message={message}
                            isOwn={message.sender._id?.toString() === user._id?.toString()}
                            showAvatar={showAvatar}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={handleTyping}
                    autoComplete="off"
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
