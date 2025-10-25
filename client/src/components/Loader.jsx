export default function Loader({ label = 'Loading…', center = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: center ? 'center' : 'flex-start', padding: 8 }}>
      <div className="spinner" />
      <span className="muted" style={{ fontSize: 14 }}>{label}</span>
    </div>
  )
}
