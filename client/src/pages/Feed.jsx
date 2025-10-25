import { useEffect, useState } from 'react'
import { api, endpoints } from '../api/client.js'
import PostCard from '../components/PostCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const load = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(endpoints.posts.feed, { params: { page: p, limit: 10 } })
      setPosts((prev) => (p === 1 ? data.posts : [...prev, ...data.posts]))
      setPage(data.pagination.page)
      setPages(data.pagination.pages)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const handleDelete = async (post) => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(endpoints.posts.byId(post._id))
      setPosts((prev) => prev.filter((p) => p._id !== post._id))
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Home Feed</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Stay connected with your classmates and campus community
        </p>
      </div>
      
      {error && (
        <div style={{ 
          color: '#ef4444', 
          fontSize: 14, 
          padding: '12px 16px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: 8,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}
      
      {loading && posts.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader />
        </div>
      ) : null}
      
      <div className="stack" style={{ gap: 0 }}>
        {posts.map((p) => (
          <PostCard key={p._id} post={p} onDelete={p.author?._id === user?.id ? handleDelete : undefined} />
        ))}
      </div>
      
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        {page < pages && (
          <button 
            className="btn" 
            disabled={loading} 
            onClick={() => load(page + 1)}
            style={{
              padding: '12px 32px',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {loading ? 'Loading…' : 'Load More Posts'}
          </button>
        )}
        {posts.length === 0 && !loading && (
          <div style={{ 
            padding: '60px 24px', 
            textAlign: 'center',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No posts yet</div>
            <div style={{ fontSize: 14 }}>Be the first to share something with your classmates!</div>
          </div>
        )}
      </div>
    </div>
  )
}