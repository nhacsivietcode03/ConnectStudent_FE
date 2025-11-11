import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { chatAPI } from "../../api/chat.api";
import "./Chat.css";

const ChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const conversationIdFromUrl = searchParams.get("conversationId");

    useEffect(() => {
        // If conversationId is in URL, load that conversation
        if (conversationIdFromUrl) {
            loadConversationFromId(conversationIdFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationIdFromUrl]);

    const loadConversationFromId = async (convId) => {
        try {
            // First, get all conversations to find the one with this ID
            const response = await chatAPI.getConversations();
            const conversations = response.conversations || [];
            const foundConversation = conversations.find((conv) => conv._id?.toString() === convId);

            if (foundConversation) {
                setSelectedConversation(foundConversation);
            } else {
                // If not found in list, try to get it directly
                // This might happen if it's a new conversation
                // For now, just clear the URL param
                setSearchParams({});
            }
        } catch (error) {
            console.error("Error loading conversation:", error);
            setSearchParams({});
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        // Update URL with conversation ID
        if (conversation?._id) {
            setSearchParams({ conversationId: conversation._id });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-back-button-container">
                <button
                    className="chat-back-button"
                    onClick={() => navigate("/")}
                    title="Quay về trang chủ"
                >
                    <i className="bi bi-arrow-left"></i>
                    <span>Trang chủ</span>
                </button>
            </div>
            <ChatList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?._id}
            />
            <ChatWindow conversation={selectedConversation} />
        </div>
    );
};

export default ChatPage;
