import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, endpoints } from '../api/client.js';
import { toast } from 'react-toastify';
import Loader from '../components/Loader.jsx';

export default function DirectChat() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [recipientLoading, setRecipientLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/messages/dm/${userId}`);
        setMessages(data.messages || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadRecipient = async () => {
      setRecipientLoading(true);
      try {
        const { data } = await api.get(`/user/${userId}/profile`);
        setRecipient(data.user);
      } catch {}
      setRecipientLoading(false);
    };
    loadRecipient();
  }, [userId]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/dm/${userId}`, { content: input });
      setMessages((prev) => [...prev, data.message]);
      setInput('');
    } catch (err) {
      if (err?.response?.status === 403) {
        toast.error('You can only message if you are friends.');
      }
    }
    setSending(false);
  };

  return (
    <div className="page stack" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: 18, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: '0 2px 12px #0002', borderRadius: 16 }}>
        {recipientLoading ? <Loader /> : recipient && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#222', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 26 }}>
              {recipient.avatarUrl ? <img src={recipient.avatarUrl.startsWith('http') ? recipient.avatarUrl : `http://localhost:4000${recipient.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (recipient.name?.[0] || '?')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{recipient.name}</div>
              <div className="muted" style={{ fontSize: 14 }}>{recipient.collegeEmail}</div>
              <Link to={`/users/${recipient._id}`} className="btn" style={{
                fontSize: 15,
                marginTop: 10,
                padding: '8px 20px',
                borderRadius: 8,
                background: '#fff',
                color: '#222',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 1px 4px #0001',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
                display: 'inline-block',
              }}>View Profile</Link>
            </div>
          </>
        )}
      </div>
      {/* Chat Box */}
      <div className="card" style={{ minHeight: 320, maxHeight: 420, overflowY: 'auto', marginBottom: 14, background: '#18191b', borderRadius: 14, padding: '18px 18px 8px 18px', boxShadow: '0 2px 8px #0001' }}>
        {loading ? <Loader /> : (
          messages.length === 0 ? <div className="muted">No messages yet.</div> :
            messages.map((msg) => (
              <div key={msg._id} style={{ marginBottom: 16, padding: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#eaf2ff', marginBottom: 2 }}>{msg.sender?.name || 'User'}<span style={{ fontWeight: 400, color: '#b3b8c2' }}>:{' '}{msg.content}</span></div>
                <div className="muted" style={{ fontSize: 11, marginLeft: 2 }}>{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form onSubmit={send} style={{ display: 'flex', gap: 10, marginTop: 2 }}>
        <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1px solid #222', background: '#0f1113', color: '#eef0f2', fontSize: 15 }} />
        <button className="btn primary" type="submit" disabled={sending || !input.trim()} style={{ padding: '12px 22px', borderRadius: 8, background: '#2f7bff', color: '#fff', fontWeight: 700, border: 'none', fontSize: 15 }}>{sending ? 'Sending...' : 'Send'}</button>
      </form>
    </div>
  );
}
