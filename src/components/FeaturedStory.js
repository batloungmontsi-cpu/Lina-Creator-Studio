function FeaturedStory({ story, onOpen }) {
  if (!story) return null;

  return (
    <section className="featured-section" aria-labelledby="featured-title">
      <div className="section-topline"><span>THE LATEST NOTE</span><span>02 / 06</span></div>
      <div className="featured-card">
        <button className="featured-image-button" type="button" onClick={onOpen} aria-label={`Read ${story.title}`}>
          <img src={story.image} alt="" />
          <span className="image-play" aria-hidden="true">↗</span>
        </button>
        <div className="featured-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> FEATURED STORY · {story.category.toUpperCase()}</span>
          <h2 id="featured-title">{story.title}</h2>
          <p>{story.description}</p>
          <div className="featured-meta">
            <span>{story.duration}</span><span className="meta-dot">·</span>
            <span>{new Date(story.publicationDate || `${story.date}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <button className="text-link" type="button" onClick={onOpen}>Come on in <span aria-hidden="true">↗</span></button>
        </div>
        <span className="featured-deco" aria-hidden="true">✳</span>
      </div>
    </section>
  );
}

export default FeaturedStory;
