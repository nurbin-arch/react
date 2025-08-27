import { Link } from 'react-router-dom'

const sampleCovers = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=640&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=640&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=640&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=640&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=640&q=80&auto=format&fit=crop'
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero card">
        <div className="hero-text">
          <h1>Discover. Borrow. Learn.</h1>
          <p>Welcome to React Library — your modern, lightweight library system. Browse thousands of titles and keep track of your borrowed books seamlessly.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/signup/user"><button className="btn-outline">Student signup</button></Link>
            <Link to="/signup/admin"><button className="btn-outline">Librarian signup</button></Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
      </section>

      <section className="gallery">
        <h3>Popular Collections</h3>
        <div className="gallery-grid">
          {sampleCovers.map((src, i) => (
            <img key={i} src={src} alt="Book cover" loading="lazy" />
          ))}
        </div>
      </section>
    </div>
  )
}


