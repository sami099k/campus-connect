import { useEffect, useState } from 'react'
import { api, endpoints } from '../api/client.js'
import Loader from '../components/Loader.jsx'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(endpoints.friends.root)
        setFriends(data.friends)
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load friends')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page stack">
      <h2>Friends</h2>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {loading && friends.length === 0 ? <Loader /> : null}
      {friends.length === 0 && !loading && <div className="muted">No friends yet.</div>}
      <ul className="list">
        {friends.map((f) => (
          <li key={f._id} className="card">
            <div style={{ fontWeight: 600 }}>{f.name}</div>
            <div className="muted" style={{ fontSize: 14 }}>{f.collegeEmail}</div>
            <div className="muted" style={{ fontSize: 13 }}>{[f.branch, f.className, `Year ${f.year}`, `Section ${f.section}`].filter(Boolean).join(' · ')}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
