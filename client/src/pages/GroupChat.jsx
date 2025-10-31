import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader from '../components/Loader.jsx';

export default function GroupChat() {
  const { user } = useAuth();
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [group, setGroup] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        console.log('GroupChat: groupId =', groupId);
        const [msgRes, groupRes] = await Promise.all([
          api.get(`/messages/group/${groupId}`),
          api.get(`/groups/${groupId}`),
        ]);
        if (!mounted) return;
        setMessages(msgRes?.data?.messages || []);
        setGroup(groupRes?.data?.group || null);
      } catch (err) {
        console.error('GroupChat load error:', err, 'groupId:', groupId);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (groupId) load();
    return () => { mounted = false; };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      console.log('Sending message to groupId:', groupId, 'content:', input);
      const { data } = await api.post(`/messages/group/${groupId}`, { content: input });
      if (data?.message) setMessages((prev) => [...prev, data.message]);
      setInput('');
    } catch (err) {
      console.error('GroupChat send error:', err, 'groupId:', groupId);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1113', color: '#eef0f2', padding: '24px 12px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 980 }}>
        <header style={{ textAlign: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>{group?.name || 'Group Chat'}</h2>
        </header>

        <div style={{ background: '#141518', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', height: '75vh' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><Loader /></div>
            ) : messages.length === 0 ? (
              <div style={{ color: '#8a8f98', textAlign: 'center', paddingTop: 24 }}>No messages yet. Start the conversation!</div>
            ) : (
              <div>
                {Array.isArray(messages) && messages.map((msg) => {
                  // Robust sender detection
                  const senderName = msg?.sender?.name || msg?.senderName || msg?.senderId || 'Unknown';
                  const isMe = user && (msg?.sender?._id === user._id || msg?.senderId === user._id);
                  return (
                    <div key={msg._id || Math.random()} style={{ display: 'flex', marginBottom: 12, alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', gap: 10 }}>
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isMe ? '#a9cdfd' : '#9bd1ff', marginBottom: 6, textAlign: isMe ? 'right' : 'left' }}>
                          {senderName}
                        </div>
                        <div style={{ background: isMe ? 'linear-gradient(90deg,#2f7bff,#6fb8ff)' : '#1b1c20', color: isMe ? '#fff' : '#d1d6dc', padding: '8px 10px', borderRadius: 10, wordBreak: 'break-word', fontSize: 14 }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 6, textAlign: isMe ? 'right' : 'left' }}>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message..."
              className="input"
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #222', background: '#0f1113', color: '#eef0f2' }}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn primary" style={{ padding: '10px 16px', borderRadius: 8, background: '#2f7bff', color: '#fff', fontWeight: 700, border: 'none' }}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
  