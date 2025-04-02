import React, { useState, useEffect } from 'react';

const ChatComponent = () => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState('.');

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingDots((prevDots) => (prevDots.length === 3 ? '.' : prevDots + '.'));
            }, 300);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const sendUserInput = async () => {
        if (!userInput.trim()) return;

        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userInput }]);
        setUserInput('');

        try {
            const response = await fetch('http://localhost:8001/api/receive-user-input/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userInput }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: data.response }]);
            } else {
                console.error('Error sending user input:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setLoadingDots('.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendUserInput();
        }
    };

    return (
        <div className="chat-container">
            <h2>Chat with AI</h2>
            <div className="chat-box">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}`}>
                        {message.text}
                    </div>
                ))}
                {loading && <div className="message ai">crazy ai stuff happening rn{loadingDots}</div>}
            </div>
            <textarea
                rows="2"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                className="input-box"
            />
            <button onClick={sendUserInput} disabled={loading} className="send-button">
                {loading ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};

export default ChatComponent;
