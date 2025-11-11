import React from "react";
import "./Chat.css";

const MessageItem = ({ message, isOwn, showAvatar }) => {
    const formatTime = (date) => {
        if (!date) return "";
        const messageDate = new Date(date);
        return messageDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={`message-item ${isOwn ? "own" : "other"}`}>
            {!isOwn && showAvatar && (
                <img
                    src={message.sender?.avatar || "/default-avatar.png"}
                    alt={message.sender?.username}
                    className="message-avatar"
                />
            )}
            <div className="message-content-wrapper">
                {!isOwn && showAvatar && (
                    <div className="message-sender-name">{message.sender?.username}</div>
                )}
                <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                        {formatTime(message.createdAt)}
                        {isOwn && (
                            <span className={`read-status ${message.isRead ? "read" : "unread"}`}>
                                {message.isRead ? "✓✓" : "✓"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
