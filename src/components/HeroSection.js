function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <span className="eyebrow"><span className="eyebrow-line" /> A little corner of the internet</span>
        <h1 id="hero-title">Stories for a<br /><em>softer life.</em></h1>
        <p className="hero-intro">Notes on creativity, slow living, and finding the lovely in the everyday. Made with care, shared with you.</p>
        <div className="hero-actions">
          <button className="button button-dark" type="button" onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}>Find your next read <span aria-hidden="true">↓</span></button>
          <span className="hero-note">A new story, every other Sunday <span aria-hidden="true">✳</span></span>
        </div>
        <div className="hero-social-proof"><div className="avatar-stack" aria-hidden="true"><span>t</span><span>a</span><span>k</span><span>+</span></div><span>Made for curious, kind people like you.</span></div>
      </div>
      <div className="hero-art">
        <div className="hero-image-frame">
          <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=90" alt="Sunlit creative studio with plants and a cosy reading chair" />
          <div className="image-caption"><span className="caption-sparkle">✳</span><span>Take what you need.<br />Leave a little light.</span></div>
        </div>
        <span className="hero-sticker" aria-hidden="true">make<br />space<br /><em>for joy</em></span>
        <span className="hero-photo-credit">life lately, through my lens</span>
      </div>
      <div className="hero-bottom-note"><span>01</span><span>Stories for living a little more intentionally</span><span className="note-line" /></div>
    </section>
  );
}

export default HeroSection;
