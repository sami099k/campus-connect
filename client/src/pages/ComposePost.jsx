import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, endpoints } from '../api/client.js'

export default function ComposePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }
    
    setImages(files)
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      
      // Append images
      images.forEach((image) => {
        formData.append('images', image)
      })

      const { data } = await api.post(endpoints.posts.root, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      navigate(`/posts/${data.post._id}`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card stack" style={{ padding: '32px' }}>
        <h2 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700 }}>Create Post</h2>
        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <div className="label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Title (optional)</div>
            <input 
              className="input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Give your post a catchy title..." 
              style={{ fontSize: 15, padding: '12px 16px' }}
            />
          </label>
          <label className="field">
            <div className="label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Content</div>
            <textarea 
              className="textarea" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required 
              rows={8} 
              placeholder="What's on your mind? Share your thoughts with your classmates..."
              style={{ fontSize: 15, padding: '12px 16px', lineHeight: 1.6 }}
            />
          </label>
          
          <label className="field">
            <div className="label" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Images <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional, max 5)</span>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageChange}
              style={{ 
                padding: '12px 0',
                fontSize: 14,
              }}
            />
          </label>

          {imagePreviews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
              gap: 16,
              padding: '16px',
              background: 'var(--surface)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ 
                  position: 'relative', 
                  borderRadius: 10, 
                  overflow: 'hidden', 
                  aspectRatio: '1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <img src={preview} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      cursor: 'pointer',
                      fontSize: 18,
                      lineHeight: '28px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(220, 38, 38, 0.9)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.8)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {error ? <div style={{ color: '#ef4444', fontSize: 14, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>{error}</div> : null}
          <button 
            className="btn primary" 
            disabled={loading} 
            type="submit"
            style={{
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
