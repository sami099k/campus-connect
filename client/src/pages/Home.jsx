export default function Home() {
  return (
    <div style={{ paddingTop: 24 }}>
      <section className="card" style={{
        padding: 24,
        background: 'radial-gradient(1200px 600px at 10% -10%, rgba(255,255,255,.06), transparent 60%), radial-gradient(1000px 600px at 110% 10%, rgba(255,255,255,.03), transparent 60%), var(--surface)'
      }}>
        <h1 style={{ fontSize: 36, marginBottom: 8, letterSpacing: .2 }}>
          <span style={{
            background: 'linear-gradient(90deg, #ffffff, #d0d0d0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>Campus Connect</span>
        </h1>
        <p className="muted" style={{ fontSize: 18, maxWidth: 720 }}>
          A private community for NITW students to share updates, collaborate on projects, and grow together. Verified sign-in with college email, posts, and friend network.
        </p>
        <div className="actions" style={{ marginTop: 16 }}>
          <a className="btn primary" href="/register">Get Started</a>
          <a className="btn" href="/login">I have an account</a>
        </div>
      </section>

      <section style={{ marginTop: 20 }} className="stack">
        <h2>What we do</h2>
        <ul className="list">
          <li className="card">
            <h3>Verified Community</h3>
            <p className="muted">Only students with college emails can join, keeping the space focused and safe.</p>
          </li>
          <li className="card">
            <h3>Share and Discover</h3>
            <p className="muted">Post updates, achievements, and resources. Discover content from your peers.</p>
          </li>
          <li className="card">
            <h3>Build Your Network</h3>
            <p className="muted">Send and accept friend requests, find classmates by branch, year, and section.</p>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 20 }} className="stack">
        <h2>Who we are</h2>
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            We are Group 8, building a simple, privacy-friendly platform tailored for our campus. Our goal is to make it easier to connect, learn, and share opportunities within NITW.
          </p>
        </div>
      </section>
    </div>
  )
}
