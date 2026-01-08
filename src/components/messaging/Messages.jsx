import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  User,
  Scale
} from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [caseId, setCaseId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load user's case and messages
  useEffect(() => {
    const loadData = async () => {
      // First find user's case
      const casesRef = collection(db, 'cases');
      const casesQuery = query(casesRef, where('userId', '==', user.uid));

      const unsubCases = onSnapshot(casesQuery, (snapshot) => {
        if (!snapshot.empty) {
          const userCase = snapshot.docs[0];
          setCaseId(userCase.id);
        }
        setLoading(false);
      });

      return () => unsubCases();
    };

    loadData();
  }, [user]);

  // Subscribe to messages when caseId is available
  useEffect(() => {
    if (!caseId) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('caseId', '==', caseId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);

      // Mark unread messages as read
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.read && data.senderId !== user.uid) {
          updateDoc(doc(db, 'messages', docSnap.id), { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [caseId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !caseId) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        caseId,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'Client',
        senderEmail: user.email,
        isAdmin: isAdmin,
        content: newMessage.trim(),
        read: false,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-900 animate-spin" />
      </div>
    );
  }

  if (!caseId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center">
              <button onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <MessageSquare className="h-6 w-6 text-blue-900 mr-2" />
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Complete the intake process to enable messaging.
            </p>
            <button
              onClick={() => navigate('/intake')}
              className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-lg"
            >
              Start Intake
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="bg-blue-900 p-2 rounded-lg mr-3">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-sm text-gray-500">Secure communication with your legal team</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 flex flex-col">
        <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col" style={{ minHeight: '60vh' }}>
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === user.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {!isOwnMessage && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                            message.isAdmin ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            {message.isAdmin ? (
                              <Scale className="h-3 w-3 text-blue-600" />
                            ) : (
                              <User className="h-3 w-3 text-gray-600" />
                            )}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {message.isAdmin ? 'Legal Team' : message.senderName}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-blue-900 text-white'
                            : message.isAdmin
                            ? 'bg-blue-50 text-gray-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  sending || !newMessage.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Messages;
