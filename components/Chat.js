import React, { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://192.168.1.119:8001";

const ChatComponent = () => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState('.');
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingDots((prevDots) => (prevDots.length === 3 ? '.' : prevDots + '.'));
            }, 300);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const sendUserInput = useCallback(async () => {
        if (!userInput.trim()) return;

        setLoading(true);
        setError(null); // Clear any previous errors
        setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userInput }]);
        setUserInput('');

        try {
            const response = await fetch(`${BACKEND_URL}/api/generate-ai-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput, thread_id: "1" }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: data.response }]);
            } else {
                throw new Error('Error sending user input: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
            setLoadingDots('.');
        }
    }, [userInput]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            sendUserInput();
        }
    }, [sendUserInput]);

    return (
        <div className="chat-container">
            <h2>Chat with AI</h2>
            <div className="chat-box" aria-live="polite">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
                {loading && <div className="message ai">Processing{loadingDots}</div>}
                {error && <div className="message error">{error}</div>}
            </div>
            <textarea
                rows="2"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                className="input-box"
                aria-label="Chat input"
            />
            <button onClick={sendUserInput} disabled={loading} className="send-button" aria-label="Send message">
                {loading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

export default ChatComponent;
