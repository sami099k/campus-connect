import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, endpoints } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const avatarUrl = useMemo(() => {
    const url = post?.author?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }, [post?.author])

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }

  const cohortLabel = useMemo(() => {
    const b = (post?.author?.branch || '').toUpperCase()
    const s = (post?.author?.section || '').toUpperCase()
    const y = Number(post?.author?.year)
    const nowYear = new Date().getFullYear()
    const batchYear = y ? nowYear - (y - 1) : undefined
    if (!b && !s) return null
    const group = `${b}${s || ''}`.trim()
    return batchYear ? `${group} ${batchYear}` : group
  }, [post?.author])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(endpoints.posts.byId(id))
        setPost(data.post)
        setLiked(data.post.isLiked || false)
        setLikesCount(data.post.likesCount || 0)
        
        // Load comments
        const commentsRes = await api.get(endpoints.posts.comments(id))
        setComments(commentsRes.data.comments || [])
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await api.delete(endpoints.posts.byId(id))
      navigate('/feed')
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to delete')
    }
  }

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const { data } = await api.post(endpoints.posts.like(id))
      setLiked(data.liked)
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1)
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setIsLiking(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isCommenting) return
    setIsCommenting(true)
    try {
      const { data } = await api.post(endpoints.posts.comments(id), { content: newComment.trim() })
      setComments(prev => [...prev, data.comment])
      setNewComment('')
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }))
    } catch (err) {
      console.error('Comment error:', err)
    } finally {
      setIsCommenting(false)
    }
  }

  if (loading) return <div className="page"><Loader /></div>
  if (error) return <div className="page" style={{ color: 'crimson' }}>{error}</div>
  if (!post) return <div className="page">Not found</div>

  const created = new Date(post.createdAt)

  return (
    <div className="page stack">
      <div className="card stack">
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e7f0ff', overflow: 'hidden', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.author?.name?.[0] || '?')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{post.author?.name}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {cohortLabel || [post.author?.branch, post.author?.className, `Year ${post.author?.year}`].filter(Boolean).join(' · ')}
            </div>
          </div>
        </header>
        
        {post.title && <h2 style={{ marginBottom: 8 }}>{post.title}</h2>}
        <p style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{post.content}</p>
        
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: post.mediaUrls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 10, 
            marginBottom: 10,
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            {post.mediaUrls.map((url, index) => (
              <img 
                key={index} 
                src={getImageUrl(url)} 
                alt={`Post image ${index + 1}`} 
                style={{ 
                  width: '100%', 
                  height: post.mediaUrls.length === 1 ? 'auto' : '200px',
                  maxHeight: post.mediaUrls.length === 1 ? '500px' : '200px',
                  objectFit: 'cover',
                  borderRadius: 8,
                }} 
              />
            ))}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLike} 
            disabled={isLiking}
            style={{ 
              fontSize: 16, 
              background: 'transparent', 
              border: 'none', 
              color: liked ? '#e74c3c' : 'var(--muted)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 4,
            }}
          >
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
          <div style={{ fontSize: 16, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            💬 {post.commentsCount || 0}
          </div>
          {post.author?._id === user?.id && (
            <button className="btn" onClick={handleDelete} style={{ marginLeft: 'auto' }}>Delete</button>
          )}
        </div>
      </div>

      <div className="card stack">
        <h3 style={{ marginBottom: 12 }}>Comments</h3>
        
        <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
          <textarea 
            className="textarea" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            maxLength={1000}
            style={{ marginBottom: 8 }}
          />
          <button className="btn primary" type="submit" disabled={!newComment.trim() || isCommenting}>
            {isCommenting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="muted">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="stack">
            {comments.map((comment) => {
              const commentDate = new Date(comment.createdAt)
              return (
                <div key={comment._id} style={{ padding: 12, background: 'var(--surface)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e7f0ff', overflow: 'hidden', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 14 }}>
                      {comment.author?.avatarUrl ? (
                        <img src={comment.author.avatarUrl.startsWith('http') ? comment.author.avatarUrl : `${import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')}${comment.author.avatarUrl}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (comment.author?.name?.[0] || '?')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{comment.author?.name}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{commentDate.toLocaleString()}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, marginLeft: 40, whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
