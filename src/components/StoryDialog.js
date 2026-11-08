import { useRef } from 'react';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

function StoryDialog({ story, comments, liked, nameDraft, commentDraft, onNameChange, onCommentChange, onClose, onLike, onShare, onSubmit }) {
  const dialogRef = useRef(null);
  useDialogAccessibility(dialogRef, onClose);

  return (
    <div className="modal-backdrop story-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <article className="story-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="story-dialog-title" tabIndex="-1">
        <button className="modal-close story-dialog-close" type="button" data-dialog-initial-focus onClick={onClose} aria-label="Close story">×</button>
        <div className="dialog-story-image">
          <img src={story.image} alt="" />
          <span>{story.type} · {story.duration}</span>
        </div>
        <div className="dialog-story-copy">
          <span className="eyebrow"><span className="eyebrow-line" /> {story.category.toUpperCase()} · {new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          <h2 id="story-dialog-title">{story.title}</h2>
          <p>{story.description}</p>
          {story.mediaUrl && <a className="story-media-link" href={story.mediaUrl} target="_blank" rel="noreferrer">Open the original {story.type.toLowerCase()} <span aria-hidden="true">↗</span></a>}
          {story.articleContent && <div className="story-article-content">{story.articleContent}</div>}
          <div className="story-engagement">
            <button className={`button button-outline ${liked ? 'is-liked' : ''}`} type="button" aria-pressed={liked} onClick={onLike}><span aria-hidden="true">{liked ? '♥' : '♡'}</span> {liked ? 'Loved' : 'Send a little love'} · {story.likes}</button>
            <button className="button button-outline" type="button" onClick={onShare}>Share this story <span aria-hidden="true">↗</span></button>
          </div>
          <section className="story-comments">
            <div className="comments-heading"><h3>A little conversation</h3><span>{comments.length} {comments.length === 1 ? 'note' : 'notes'}</span></div>
            {comments.map((comment) => (
              <article className="public-comment" key={comment.id}>
                <span className="comment-avatar">{comment.name.charAt(0).toLowerCase()}</span>
                <div><div><strong>{comment.name}</strong><small>{comment.date}</small></div><p>{comment.text}</p></div>
              </article>
            ))}
            {!comments.length && <p className="no-comments">No notes yet. Yours could be the first.</p>}
            <form className="comment-form" onSubmit={onSubmit}>
              <label className="visually-hidden" htmlFor="comment-name">Your name</label>
              <input id="comment-name" placeholder="Your name" value={nameDraft} onChange={(event) => onNameChange(event.target.value)} required maxLength="50" />
              <label className="visually-hidden" htmlFor="comment-draft">Your comment</label>
              <textarea id="comment-draft" placeholder="Leave a kind little note..." value={commentDraft} onChange={(event) => onCommentChange(event.target.value)} required minLength="3" maxLength="500" rows="2" />
              <button className="button button-dark" type="submit">Leave a note <span aria-hidden="true">↗</span></button>
              <small>Your note will appear after Mila gives it a quick look.</small>
            </form>
          </section>
        </div>
      </article>
    </div>
  );
}

export default StoryDialog;
