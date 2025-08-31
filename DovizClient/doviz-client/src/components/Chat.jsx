import { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';

const Chat = () =>
{
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () =>
    {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() =>
    {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMessage = {
            text: inputMessage,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');

        try
        {
            const response = await fetch('http://localhost:5001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: currentInput })
            });

            if (!response.ok)
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const botMessage = {
                text: data.commentary || "Sorry, I couldn't get a clear answer.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error)
        {
            console.error('Error:', error);
            const errorMessage = {
                text: 'Sorry, an error occurred. Could not connect to the server.',
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const ChatIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
        </svg>
    );

    if (!isOpen)
    {
        return (
            <button className="chat-icon-button" onClick={() => setIsOpen(true)}>
                <ChatIcon />
            </button>
        );
    }

    return (
        <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
            <div className="chat-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>Chat Assistant</h3>
                <button className="toggle-button">
                    {isOpen ? '▼' : '▲'}
                </button>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender}`}
                    >
                        {message.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-input">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
