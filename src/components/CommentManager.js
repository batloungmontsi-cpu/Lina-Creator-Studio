import { useState } from 'react';

function CommentManager({ comments, content, onUpdate, onDelete }) {
  const [filter, setFilter] = useState('All comments');
  const filtered = comments.filter((comment) => filter === 'All comments' || (filter === 'Needs review' ? !comment.approved : comment.approved));

  return (
    <section className="management-panel">
      <div className="manager-toolbar">
        <div className="manager-filters" role="group" aria-label="Filter comments">
          {['All comments', 'Needs review', 'Approved'].map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>
              {item}{item === 'Needs review' ? ` (${comments.filter((comment) => !comment.approved).length})` : ''}
            </button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <div className="comment-list">
          {filtered.map((comment) => (
            <article className="moderation-comment" key={comment.id}>
              <span className="comment-avatar">{comment.name.charAt(0).toLowerCase()}</span>
              <div className="moderation-comment-copy">
                <div><strong>{comment.name}</strong><span>{comment.date}</span></div>
                <p>{comment.text}</p>
                <small>On “{comment.contentTitle || content.find((item) => item.id === comment.contentId)?.title || 'your story'}”</small>
              </div>
              <div className="moderation-actions">
                {comment.approved
                  ? <button className="hide-comment" type="button" onClick={() => onUpdate(comment.id, { approved: false })}>Hide</button>
                  : comment.status === 'Hidden'
                    ? <button className="approve-comment" type="button" onClick={() => onUpdate(comment.id, { approved: true })}>Show</button>
                    : <button className="approve-comment" type="button" onClick={() => onUpdate(comment.id, { approved: true })}>Approve</button>}
                <button className="delete-action" type="button" aria-label={`Delete comment by ${comment.name}`} onClick={() => onDelete(comment.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span aria-hidden="true">♡</span><h3>All caught up</h3><p>There are no comments to show here right now.</p></div>
      )}
    </section>
  );
}

export default CommentManager;
