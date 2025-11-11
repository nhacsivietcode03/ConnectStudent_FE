import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import "./Chat.css";

const ChatPage = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    return (
        <div className="chat-container">
            <ChatList
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?._id}
            />
            <ChatWindow conversation={selectedConversation} />
        </div>
    );
};

export default ChatPage;
