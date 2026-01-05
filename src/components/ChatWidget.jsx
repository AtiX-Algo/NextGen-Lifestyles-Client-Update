import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    // Join the shared support room
    socket.emit('join_support_chat', user._id);

    // Listen for messages in the support room
    socket.on('receive_support_message', (data) => {
      // Show message if it's from admin OR from this customer
      if (data.isAdmin || data.senderId === user._id) {
        setMessages((prev) => [
          ...prev,
          {
            ...data,
            own: data.senderId === user._id,
            timestamp: data.timestamp || new Date(),
          },
        ]);
      }
    });

    return () => {
      socket.off('receive_support_message');
    };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const chatData = {
      senderId: user._id,
      senderName: user.name || 'Customer',
      message: message.trim(),
    };

    socket.emit('send_support_message', chatData);

    // Optimistically add own message
    setMessages((prev) => [
      ...prev,
      { ...chatData, own: true, timestamp: new Date() },
    ]);

    setMessage('');
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role === 'admin') return null;

  return (
    <div className="fixed bottom-5 right-5 z-[999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary shadow-lg scale-110 hover:scale-125 transition-transform"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border">
          <div className="bg-primary p-4 text-white font-bold">Support Chat</div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 mt-10 text-sm">
                How can we help you today?
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat ${msg.own ? 'chat-end' : 'chat-start'}`}
              >
                <div className="chat-header text-xs opacity-70 mb-1">
                  {msg.own ? 'You' : msg.senderName || 'Support'}
                  <time className="ml-2">{formatTime(msg.timestamp)}</time>
                </div>
                <div
                  className={`chat-bubble text-sm ${
                    msg.own ? 'chat-bubble-primary' : 'chat-bubble-neutral'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-sm btn-primary">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;