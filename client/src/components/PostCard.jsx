import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { api, endpoints } from '../api/client.js'

export default function PostCard({ post, onDelete, onLikeUpdate }) {
  const created = new Date(post.createdAt)
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likesCount || 0)
  const [isLiking, setIsLiking] = useState(false)

  const avatarUrl = useMemo(() => {
    const url = post.author?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }, [post.author])

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }

  // Build compact cohort label like "CSEA 2024" using branch + section + batch year
  const cohortLabel = useMemo(() => {
    const b = (post.author?.branch || '').toUpperCase()
    const s = (post.author?.section || '').toUpperCase()
    const y = Number(post.author?.year)
    const nowYear = new Date().getFullYear()
    const batchYear = y ? nowYear - (y - 1) : undefined
    if (!b && !s) return null
    const group = `${b}${s || ''}`.trim()
    return batchYear ? `${group} ${batchYear}` : group
  }, [post.author])

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const { data } = await api.post(endpoints.posts.like(post._id))
      setLiked(data.liked)
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
      if (onLikeUpdate) onLikeUpdate(post._id, data.liked)
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <article className="card" style={{ padding: '16px', marginBottom: 12 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ 
          width: 38, 
          height: 38, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          overflow: 'hidden', 
          display: 'grid', 
          placeItems: 'center', 
          fontWeight: 700,
          color: 'white',
          fontSize: 16,
          border: '2px solid var(--border)',
        }}>
          {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.name?.[0] || '?')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author?.name}</div>
          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
            {cohortLabel || [post.author?.branch, post.author?.className, `Year ${post.author?.year}`].filter(Boolean).join(' · ')}
          </div>
        </div>
      </header>
      {post.title ? <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{post.title}</h3> : null}
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 14, marginBottom: 10 }}>{post.content}</p>
      
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: 10, 
          marginTop: 10,
          marginBottom: 10,
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {post.mediaUrls.map((url, index) => (
            <img 
              key={index} 
              src={getImageUrl(url)} 
              alt={`Post image ${index + 1}`} 
              style={{ 
                width: '100%', 
                height: post.mediaUrls.length === 1 ? 'auto' : '170px',
                maxHeight: post.mediaUrls.length === 1 ? '360px' : '170px',
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }} 
            />
          ))}
        </div>
      )}

      <footer style={{ 
        marginTop: 10, 
        paddingTop: 10,
        borderTop: '1px solid var(--border)',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
      }}>
        <button 
          onClick={handleLike} 
          disabled={isLiking}
          style={{ 
            fontSize: 13, 
            background: 'transparent', 
            border: 'none', 
            color: liked ? '#ef4444' : 'var(--muted)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => !liked && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {likesCount}
        </button>
        <Link to={`/posts/${post._id}`} style={{ 
          fontSize: 13, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          color: 'var(--muted)',
          textDecoration: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'var(--text)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--muted)'
        }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {post.commentsCount || 0}
        </Link>
        <Link to={`/posts/${post._id}`} style={{ 
          fontSize: 13, 
          marginLeft: 'auto',
          color: 'var(--muted)',
          textDecoration: 'none',
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 6,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = 'var(--text)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--muted)'
        }}
        >
          View Post
        </Link>
        {onDelete && (
          <button className="btn" onClick={() => onDelete(post)} style={{ fontSize: 12, padding: '4px 10px' }}>Delete</button>
        )}
      </footer>
    </article>
  )
}
