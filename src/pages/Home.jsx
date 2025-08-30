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
    <div className="container">
      <div className="home fade-in">
        {/* Hero Section */}
        <section className="card" style={{ 
          marginBottom: 'var(--space-8)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-8)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <div className="hero-text">
              <h1 style={{ 
                fontSize: 'var(--font-size-4xl)',
                marginBottom: 'var(--space-4)',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Discover. Borrow. Learn.
              </h1>
              <p style={{ 
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--space-6)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6'
              }}>
                Welcome to React Library — your modern, lightweight library system. 
                Browse thousands of titles and keep track of your borrowed books seamlessly.
              </p>
              <div className="btn-group" style={{ gap: 'var(--space-3)' }}>
                <Link to="/login" className="btn btn-primary btn-large">
                  <span>🚀</span>
                  Get Started
                </Link>
                <Link to="/signup/user" className="btn btn-secondary btn-large">
                  <span>🎓</span>
                  Student Signup
                </Link>
                <Link to="/signup/admin" className="btn btn-secondary btn-large">
                  <span>📚</span>
                  Librarian Signup
                </Link>
              </div>
            </div>
            <div className="hero-art" style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '120px',
                marginBottom: 'var(--space-4)',
                filter: 'drop-shadow(0 10px 20px rgba(99, 102, 241, 0.3))'
              }}>
                📚
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-3)',
                maxWidth: '200px',
                margin: '0 auto'
              }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: '40px',
                    height: '60px',
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-sm)',
                    transform: `rotate(${i * 5 - 10}deg)`,
                    boxShadow: 'var(--shadow-lg)'
                  }} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Background Orbs */}
          <div className="orb orb-1" style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent)',
            top: '-50px',
            right: '-50px',
            filter: 'blur(20px)'
          }} />
          <div className="orb orb-2" style={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)',
            bottom: '-30px',
            left: '-30px',
            filter: 'blur(15px)'
          }} />
        </section>

        {/* Features Section */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ 
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-3xl)'
          }}>
            Why Choose React Library?
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Find books quickly with our advanced search system' },
              { icon: '📱', title: 'Modern Interface', desc: 'Clean, responsive design that works on all devices' },
              { icon: '⚡', title: 'Fast & Lightweight', desc: 'Built with React for optimal performance' },
              { icon: '🔒', title: 'Secure Access', desc: 'Role-based authentication for students and librarians' }
            ].map((feature, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px',
                  marginBottom: 'var(--space-3)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ marginBottom: 'var(--space-2)' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery Section */}
        <section>
          <h3 style={{ 
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-2xl)'
          }}>
            Popular Collections
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            {sampleCovers.map((src, i) => (
              <div key={i} className="card" style={{ 
                padding: 'var(--space-3)',
                textAlign: 'center'
              }}>
                <img 
                  src={src} 
                  alt="Book cover" 
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-3)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                />
                <div style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)'
                }}>
                  Sample Book {i + 1}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}


