import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader from '../components/Loader.jsx';

export default function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/user/${userId}/profile`);
        setUser(data.user);
        setFriends(data.friends || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <Loader />;
  if (!user) return <div className="muted">User not found.</div>;

  return (
    <div className="page stack" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card stack">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#222', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 28 }}>
            {user.avatarUrl ? <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:4000${user.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name?.[0] || '?')}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 14 }}>{user.collegeEmail}</div>
            <div className="muted" style={{ fontSize: 13 }}>{[user.branch, user.className, `Year ${user.year}`, `Section ${user.section}`].filter(Boolean).join(' · ')}</div>
            <div style={{ marginTop: 12 }}>
              <Link to={`/dm/${user._id}`} className="btn" style={{
                fontSize: 15,
                padding: '8px 20px',
                borderRadius: 8,
                background: '#2f7bff',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 1px 4px #0001',
                textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
                display: 'inline-block',
              }}>Message</Link>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Bio:</div>
          <div className="muted">{user.additional?.bio || 'No bio.'}</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Friends ({Array.isArray(friends) ? friends.filter(f => f && typeof f === 'object').length : 0}):</div>
          <ul className="list">
            {Array.isArray(friends) && friends.filter(f => f && typeof f === 'object').length === 0 && (
              <li className="muted">No friends to show.</li>
            )}
            {Array.isArray(friends) && friends.filter(f => f && typeof f === 'object').map(f => (
              <li key={f._id || Math.random()} style={{ padding: 8, background: 'var(--surface)', borderRadius: 8, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Link to={`/users/${f._id}`} style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none', fontSize: 15 }}>{f.name || 'Unknown'}</Link>
                  <div className="muted" style={{ fontSize: 13 }}>{f.collegeEmail || ''}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{[f.branch, f.className, f.year ? `Year ${f.year}` : '', f.section ? `Section ${f.section}` : ''].filter(Boolean).join(' · ')}</div>
                </div>
                <Link to={`/dm/${f._id}`} className="btn" style={{
                  fontSize: 14,
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: '#2f7bff',
                  color: '#fff',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 1px 4px #0001',
                  textDecoration: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  display: 'inline-block',
                }}>Message</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
