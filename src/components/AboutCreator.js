function AboutCreator({ onMoreAbout }) {
  return (
    <section className="about-section" id="about">
      <div className="about-photo">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=85" alt="Mila smiling in a sunlit room" />
        <span className="about-photo-caption">usually with a notebook nearby</span>
      </div>
      <div className="about-copy">
        <span className="eyebrow"><span className="eyebrow-line" /> A NOTE FROM ME</span>
        <h2 id="about-title">Hi, I’m Mila.<br /><em>It’s lovely to meet you.</em></h2>
        <p>I’m a creator, curious person, and professional collector of little moments. This is where I share the ideas, places, and everyday rituals that make life feel a bit more like yours.</p>
        <p>Make yourself at home. There’s always room at the table.</p>
        <button className="text-link" type="button" onClick={onMoreAbout}>A little more about me <span aria-hidden="true">↗</span></button>
      </div>
      <span className="about-doodle" aria-hidden="true">hello<br /><em>there</em> ✳</span>
    </section>
  );
}

export default AboutCreator;
