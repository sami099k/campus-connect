import { useEffect, useState } from 'react'
import { api, endpoints } from '../api/client.js'
import Loader from '../components/Loader.jsx'

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(endpoints.friends.pending)
      setRequests(data.requests)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (id, type) => {
    try {
      await api.put(type === 'accept' ? endpoints.friends.accept(id) : endpoints.friends.reject(id))
      await load()
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update request')
    }
  }

  return (
    <div className="page stack">
      <h2>Pending Friend Requests</h2>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {loading && requests.length === 0 ? <Loader /> : null}
      {requests.length === 0 && !loading && <div className="muted">No pending requests.</div>}
      <ul className="list">
        {requests.map((r) => (
          <li key={r._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.sender?.name}</div>
              <div className="muted" style={{ fontSize: 14 }}>{r.sender?.collegeEmail}</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => act(r._id, 'accept')}>Accept</button>
              <button className="btn" onClick={() => act(r._id, 'reject')}>Reject</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
