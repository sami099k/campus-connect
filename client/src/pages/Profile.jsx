import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { api, endpoints } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Profile() {
  const { user: authUser, setUser } = useAuth()
  const location = useLocation()
  const [user, setLocalUser] = useState(authUser)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  
  // Check for tab query parameter
  const urlParams = new URLSearchParams(location.search)
  const tabFromUrl = urlParams.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(tabFromUrl) // profile, friends, search, requests, posts
  
  // Friends state
  const [friends, setFriends] = useState([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const friendsCount = friends.length
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchInfo, setSearchInfo] = useState('')
  
  // Requests state
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)

  // My Posts state
  const [myPosts, setMyPosts] = useState([])
  const [myPostsLoading, setMyPostsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(endpoints.user.me)
        setLocalUser(data.user)
        try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
        setUser(data.user)
      } catch {}
    }
    load()
    // also pre-load friends to show count in header
    loadFriends()
  }, [])

  const [form, setForm] = useState({
    name: authUser?.name || '',
    bio: authUser?.additional?.bio || '',
    skills: (authUser?.additional?.skills || []).join(', '),
    interests: (authUser?.additional?.interests || []).join(', '),
    social: {
      linkedin: authUser?.additional?.social?.linkedin || '',
      github: authUser?.additional?.social?.github || '',
      twitter: authUser?.additional?.social?.twitter || '',
      instagram: authUser?.additional?.social?.instagram || '',
    },
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user?.additional?.bio || '',
        skills: (user?.additional?.skills || []).join(', '),
        interests: (user?.additional?.interests || []).join(', '),
        social: {
          linkedin: user?.additional?.social?.linkedin || '',
          github: user?.additional?.social?.github || '',
          twitter: user?.additional?.social?.twitter || '',
          instagram: user?.additional?.social?.instagram || '',
        },
      })
    }
  }, [user])

  // Update activeTab when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')
    if (tabFromUrl && ['profile', 'friends', 'search', 'requests', 'posts'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [location.search])

  // Load friends when tab is active
  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriends()
    }
    if (activeTab === 'posts') {
      loadMyPosts()
    }
  }, [activeTab])

  // Load requests when tab is active
  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests()
    }
  }, [activeTab])

  const loadFriends = async () => {
    setFriendsLoading(true)
    try {
      const { data } = await api.get(endpoints.friends.root)
      setFriends(data.friends || [])
    } catch (err) {
      console.error('Failed to load friends:', err)
    } finally {
      setFriendsLoading(false)
    }
  }

  const loadMyPosts = async () => {
    setMyPostsLoading(true)
    try {
      const { data } = await api.get(endpoints.posts.mine)
      setMyPosts(data.posts || [])
    } catch (err) {
      console.error('Failed to load my posts:', err)
    } finally {
      setMyPostsLoading(false)
    }
  }

  const handleDeleteMyPost = async (post) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(endpoints.posts.byId(post._id))
      setMyPosts((prev) => prev.filter((p) => p._id !== post._id))
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete')
    }
  }

  const loadRequests = async () => {
    setRequestsLoading(true)
    try {
      const { data } = await api.get(endpoints.friends.pending)
      setRequests(data.requests || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!searchQuery || searchQuery.trim().length < 2) return
    setSearchLoading(true)
    setSearchInfo('')
    try {
      const { data } = await api.get(endpoints.friends.search, { params: { q: searchQuery } })
      setSearchResults(data.users || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const sendRequest = async (userId) => {
    setSearchInfo('')
    try {
      await api.post(endpoints.friends.request, { receiverId: userId })
      setSearchInfo('Friend request sent')
    } catch (err) {
      setSearchInfo(err?.response?.data?.error || 'Failed to send request')
    }
  }

  const handleRequestAction = async (id, type) => {
    try {
      await api.put(type === 'accept' ? endpoints.friends.accept(id) : endpoints.friends.reject(id))
      await loadRequests()
      if (type === 'accept') {
        loadFriends() // Refresh friends list if accepted
      }
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to update request')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('social.')) {
      const key = name.split('.')[1]
      setForm((f) => ({ ...f, social: { ...f.social, [key]: value } }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        skills: form.skills,
        interests: form.interests,
        social: form.social,
      }
      const { data } = await api.put(endpoints.user.update, payload)
      setLocalUser(data.user)
      setUser(data.user)
      try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
    } catch {}
    setSaving(false)
  }

  const avatarUrl = useMemo(() => {
    const url = user?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }, [user])

  const onFileChange = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', f)
      const { data } = await api.post(endpoints.user.avatar, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLocalUser(data.user)
      setUser(data.user)
      try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
    } catch {}
    setUploading(false)
  }

  return (
    <div className="page">
      <div className="stack" style={{ maxWidth: 820, margin: '0 auto' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#1f1f1f', overflow: 'hidden', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 28 }}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.[0] || '?')}
          </div>
          <div className="stack" style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
            <div className="muted" style={{ fontSize: 14 }}>{user?.collegeEmail}</div>
            <div className="muted" style={{ fontSize: 13 }}>{[user?.branch, user?.className, `Year ${user?.year}`, `Section ${user?.section}`].filter(Boolean).join(' · ')}</div>
            <div className="muted" style={{ fontSize: 12 }}>Friends: {friendsCount}</div>
          </div>
          <div>
            <label className="btn">
              {uploading ? 'Uploading…' : 'Change avatar'}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} hidden />
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          <button 
            onClick={() => setActiveTab('profile')} 
            style={{ 
              padding: '8px 16px', 
              background: activeTab === 'profile' ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: activeTab === 'profile' ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeTab === 'profile' ? 600 : 400,
            }}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('friends')} 
            style={{ 
              padding: '8px 16px', 
              background: activeTab === 'friends' ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: activeTab === 'friends' ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeTab === 'friends' ? 600 : 400,
            }}
          >
            Friends {friendsCount > 0 && `(${friendsCount})`}
          </button>
          <button 
            onClick={() => setActiveTab('posts')} 
            style={{ 
              padding: '8px 16px', 
              background: activeTab === 'posts' ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: activeTab === 'posts' ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeTab === 'posts' ? 600 : 400,
            }}
          >
            My Posts
          </button>
          <button 
            onClick={() => setActiveTab('search')} 
            style={{ 
              padding: '8px 16px', 
              background: activeTab === 'search' ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: activeTab === 'search' ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeTab === 'search' ? 600 : 400,
            }}
          >
            Search Friends
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            style={{ 
              padding: '8px 16px', 
              background: activeTab === 'requests' ? 'var(--surface)' : 'transparent',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              color: activeTab === 'requests' ? 'var(--text)' : 'var(--muted)',
              fontWeight: activeTab === 'requests' ? 600 : 400,
            }}
          >
            Requests {requests.length > 0 && `(${requests.length})`}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <form className="stack" onSubmit={save}>
              <div className="row" style={{ gap: 16 }}>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">Name</div>
                  <input className="input" name="name" value={form.name} onChange={handleChange} required />
                </label>
              </div>

              <label className="field">
                <div className="label">Bio</div>
                <textarea className="textarea" name="bio" value={form.bio} onChange={handleChange} maxLength={280} />
              </label>

              <div className="row" style={{ gap: 16 }}>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">Skills (comma separated)</div>
                  <input className="input" name="skills" value={form.skills} onChange={handleChange} />
                </label>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">Interests (comma separated)</div>
                  <input className="input" name="interests" value={form.interests} onChange={handleChange} />
                </label>
              </div>

              <div className="row" style={{ gap: 16 }}>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">LinkedIn</div>
                  <input className="input" name="social.linkedin" value={form.social.linkedin} onChange={handleChange} placeholder="https://www.linkedin.com/in/username" />
                </label>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">GitHub</div>
                  <input className="input" name="social.github" value={form.social.github} onChange={handleChange} placeholder="https://github.com/username" />
                </label>
              </div>

              <div className="row" style={{ gap: 16 }}>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">Twitter</div>
                  <input className="input" name="social.twitter" value={form.social.twitter} onChange={handleChange} placeholder="https://x.com/username" />
                </label>
                <label className="field" style={{ flex: 1 }}>
                  <div className="label">Instagram</div>
                  <input className="input" name="social.instagram" value={form.social.instagram} onChange={handleChange} placeholder="https://instagram.com/username" />
                </label>
              </div>

              <div className="actions">
                <button className="btn primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="card stack">
            <h3>My Friends</h3>
            {friendsLoading && friends.length === 0 ? <Loader /> : null}
            {friends.length === 0 && !friendsLoading && <div className="muted">No friends yet.</div>}
            <ul className="list">
              {Array.isArray(friends) && friends.filter(f => f && typeof f === 'object').length === 0 && (
                <li className="muted">No friends to show.</li>
              )}
              {Array.isArray(friends) && friends.filter(f => f && typeof f === 'object').map((f) => (
                <li key={f._id || Math.random()} style={{ padding: 12, background: 'var(--surface)', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Link to={`/users/${f._id}`} style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none', fontSize: 16 }}>{f.name || 'Unknown'}</Link>
                    <div className="muted" style={{ fontSize: 14 }}>{f.collegeEmail || ''}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{[f.branch, f.className, f.year ? `Year ${f.year}` : '', f.section ? `Section ${f.section}` : ''].filter(Boolean).join(' · ')}</div>
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
        )}

        {/* My Posts Tab */}
        {activeTab === 'posts' && (
          <div className="card stack">
            <h3>My Posts</h3>
            {myPostsLoading && myPosts.length === 0 ? <Loader /> : null}
            {myPosts.length === 0 && !myPostsLoading && <div className="muted">You haven't posted yet.</div>}
            <div className="stack">
              {myPosts.map((p) => (
                <PostCard key={p._id} post={p} onDelete={handleDeleteMyPost} />
              ))}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="card stack">
            <h3>Search Friends</h3>
            <form onSubmit={handleSearch} className="row" style={{ gap: 8 }}>
              <input 
                className="input" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search by name or email" 
                style={{ flex: 1 }} 
              />
              <button className="btn" disabled={searchLoading || !searchQuery || searchQuery.trim().length < 2} type="submit">
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {searchInfo && <div style={{ color: searchInfo.includes('sent') ? '#0a7' : 'crimson' }}>{searchInfo}</div>}
            {searchLoading && searchResults.length === 0 ? <Loader /> : null}
            <ul className="list">
              {searchResults.map((u) => (
                <li key={u._id} style={{ padding: 12, background: 'var(--surface)', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="card stack">
            <h3>Friend Requests</h3>
            {requestsLoading && requests.length === 0 ? <Loader /> : null}
            {requests.length === 0 && !requestsLoading && <div className="muted">No pending requests.</div>}
            <ul className="list">
              {requests.map((r) => (
                <li key={r._id} style={{ padding: 12, background: 'var(--surface)', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.sender?.name}</div>
                    <div className="muted" style={{ fontSize: 14 }}>{r.sender?.collegeEmail}</div>
                  </div>
                  <div className="actions">
                    <button className="btn" onClick={() => handleRequestAction(r._id, 'accept')}>Accept</button>
                    <button className="btn" onClick={() => handleRequestAction(r._id, 'reject')}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
