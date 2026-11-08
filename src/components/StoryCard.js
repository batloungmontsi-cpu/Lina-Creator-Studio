import { formatNumber } from '../utils/creatorUtils';

function StoryCard({ story, index, liked, onOpen, onLike, onShare }) {
  return (
    <article className={`story-card story-card-${index % 3}`}>
      <button className="story-card-image" type="button" onClick={onOpen} aria-label={`Open ${story.title}`}>
        <img src={story.image} alt="" loading="lazy" />
        <span className="story-type">{story.type}</span>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </button>
      <div className="story-card-copy">
        <div className="story-card-meta">
          <span>{story.category}</span><span>·</span>
          <span>{new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
        </div>
        <button type="button" className="story-card-title" onClick={onOpen}>{story.title}</button>
        <p>{story.description}</p>
        <div className="story-card-bottom">
          <span>{story.duration}</span>
          <div className="card-actions">
            <button type="button" className={`icon-button ${liked ? 'is-liked' : ''}`} onClick={onLike} aria-label={liked ? `Unlike ${story.title}` : `Like ${story.title}`} aria-pressed={liked}>
              <span aria-hidden="true">{liked ? '♥' : '♡'}</span><span>{formatNumber(story.likes)}</span>
            </button>
            <button type="button" className="icon-button share-button" onClick={onShare} aria-label={`Share ${story.title}`}>↗</button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default StoryCard;
