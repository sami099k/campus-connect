import { useEffect, useState } from 'react'
import { api, endpoints } from '../api/client.js'
import Loader from '../components/Loader.jsx'

export default function SearchFriends() {
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => { setInfo('') }, [q])

  const search = async (e) => {
    e?.preventDefault()
    if (!q || q.trim().length < 2) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(endpoints.friends.search, { params: { q } })
      setUsers(data.users)
    } catch (err) {
      setError(err?.response?.data?.error || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (userId) => {
    setInfo('')
    try {
      await api.post(endpoints.friends.request, { receiverId: userId })
      setInfo('Friend request sent')
    } catch (err) {
      setInfo(err?.response?.data?.error || 'Failed to send request')
    }
  }

  return (
    <div className="page stack">
      <h2>Search Users</h2>
      <form onSubmit={search} className="row">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" style={{ flex: 1 }} />
        <button className="btn" disabled={loading || !q || q.trim().length < 2} type="submit">Search</button>
      </form>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {info && <div style={{ color: '#0a7' }}>{info}</div>}
      {loading && users.length === 0 ? <Loader /> : null}
      <ul className="list">
        {users.map((u) => (
          <li key={u._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div className="muted" style={{ fontSize: 14 }}>{u.collegeEmail}</div>
              <div className="muted" style={{ fontSize: 13 }}>{[u.branch, u.className, `Year ${u.year}`, `Section ${u.section}`].filter(Boolean).join(' · ')}</div>
            </div>
            <div>
              <button className="btn" onClick={() => sendRequest(u._id)}>Add Friend</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
