import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import Loader from '../components/Loader.jsx';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/groups/mine');
        setGroups(data.groups || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page stack" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2>My Groups</h2>
      <div className="card stack">
        {loading ? <Loader /> : (
          groups.length === 0 ? <div className="muted">You are not in any groups.</div> :
            <ul className="list">
              {groups.map(g => (
                <li key={g._id} style={{ padding: 12, background: 'var(--surface)', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{g.description}</div>
                  </div>
                  <Link className="btn" to={`/groups/${g._id}/chat`}>Open Chat</Link>
                </li>
              ))}
            </ul>
        )}
      </div>
    </div>
  );
}
