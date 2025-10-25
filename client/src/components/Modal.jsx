import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmStyle = 'primary' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 16,
          padding: '28px 32px',
          maxWidth: 440,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: 20, 
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            {title}
          </h3>
        )}
        
        {message && (
          <p style={{ 
            margin: '0 0 24px 0', 
            fontSize: 15, 
            lineHeight: 1.6,
            color: 'var(--muted)',
          }}>
            {message}
          </p>
        )}

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'flex-end',
        }}>
          <button 
            className="btn" 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: 14,
            }}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${confirmStyle}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{
              padding: '10px 20px',
              fontSize: 14,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
