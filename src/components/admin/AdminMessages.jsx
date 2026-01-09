import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  RefreshCw,
  CheckCircle,
  Circle,
  User,
  Scale,
  ChevronRight
} from 'lucide-react';

const AdminMessages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCaseId = searchParams.get('caseId');

  const [cases, setCases] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId || null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all cases
  useEffect(() => {
    const casesQuery = query(
      collection(db, 'cases'),
      orderBy('createdAt', 'desc')
    );

    const unsubCases = onSnapshot(casesQuery, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCases(casesData);
      setLoading(false);
    });

    return () => unsubCases();
  }, []);

  // Load messages for selected case
  useEffect(() => {
    if (!selectedCaseId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('caseId', '==', selectedCaseId),
      orderBy('createdAt', 'asc')
    );

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);

      // Mark unread client messages as read
      messagesData.forEach(async (msg) => {
        if (!msg.isAdmin && !msg.read) {
          await updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    });

    return () => unsubMessages();
  }, [selectedCaseId]);

  // Get unread count for each case
  const [unreadCounts, setUnreadCounts] = useState({});
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('isAdmin', '==', false),
      where('read', '==', false)
    );

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const counts = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        counts[data.caseId] = (counts[data.caseId] || 0) + 1;
      });
      setUnreadCounts(counts);
    });

    return () => unsubMessages();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCaseId || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        caseId: selectedCaseId,
        senderId: user.uid,
        senderName: 'Legal Team',
        senderEmail: user.email,
        isAdmin: true,
        content: newMessage.trim(),
        read: false,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredCases = cases.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.estateName?.toLowerCase().includes(searchLower) ||
      c.petitioner?.firstName?.toLowerCase().includes(searchLower) ||
      c.petitioner?.lastName?.toLowerCase().includes(searchLower) ||
      c.petitioner?.email?.toLowerCase().includes(searchLower)
    );
  });

  // Sort cases by unread messages first
  const sortedCases = [...filteredCases].sort((a, b) => {
    const aUnread = unreadCounts[a.id] || 0;
    const bUnread = unreadCounts[b.id] || 0;
    return bUnread - aUnread;
  });

  const selectedCase = cases.find(c => c.id === selectedCaseId);
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500">Communicate with clients</p>
        </div>
        {totalUnread > 0 && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
            {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Messages Layout */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Cases List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cases..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Cases */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
                </div>
              ) : sortedCases.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No cases found</p>
                </div>
              ) : (
                sortedCases.map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => setSelectedCaseId(caseItem.id)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedCaseId === caseItem.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {caseItem.estateName || `Estate of ${caseItem.decedent?.firstName || ''}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {caseItem.petitioner?.firstName} {caseItem.petitioner?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{caseItem.petitioner?.email}</p>
                      </div>
                      {unreadCounts[caseItem.id] > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                          {unreadCounts[caseItem.id]}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedCaseId ? (
              <>
                {/* Case Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {selectedCase?.estateName || `Estate of ${selectedCase?.decedent?.firstName || ''}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedCase?.petitioner?.firstName} {selectedCase?.petitioner?.lastName} - {selectedCase?.petitioner?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation with this client</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.isAdmin ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-end gap-2 ${msg.isAdmin ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-1.5 rounded-full ${msg.isAdmin ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              {msg.isAdmin ? (
                                <Scale className="h-4 w-4 text-blue-700" />
                              ) : (
                                <User className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                msg.isAdmin
                                  ? 'bg-blue-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${msg.isAdmin ? 'text-right' : 'text-left'}`}>
                            {msg.isAdmin ? 'Legal Team' : msg.senderName} - {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a case</p>
                  <p className="text-sm">Choose a case from the list to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
