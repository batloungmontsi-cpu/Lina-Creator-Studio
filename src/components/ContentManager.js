import { useState } from 'react';
import { formatNumber } from '../utils/creatorUtils';
import StatusTag from './StatusTag';

function ContentManager({ content, onAdd, onEdit, onDelete, onPreview }) {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? content : content.filter((item) => item.status === filter);

  return (
    <section className="management-panel">
      <div className="manager-toolbar">
        <div className="manager-filters" role="group" aria-label="Filter stories by status">
          {['All', 'Published', 'Draft', 'Scheduled'].map((status) => (
            <button key={status} type="button" className={filter === status ? 'is-active' : ''} aria-pressed={filter === status} onClick={() => setFilter(status)}>
              {status}{status === 'All' ? ` (${content.length})` : ''}
            </button>
          ))}
        </div>
        <button className="button button-outline" type="button" onClick={onAdd}>＋ New story</button>
      </div>
      {filtered.length ? (
        <div className="content-list">
          {filtered.map((story) => (
            <article className="content-row" key={story.id}>
              <img className="content-row-image" src={story.image} alt="" />
              <div className="content-row-main">
                <div className="content-row-heading"><h2>{story.title}</h2><StatusTag status={story.status} /></div>
                <p>{story.category} <span>·</span> {story.type} <span>·</span> {story.duration}</p>
                <small>
                  {story.status === 'Scheduled'
                    ? `Publishing ${new Date(story.publicationDate).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}`
                    : `${story.status === 'Draft' ? 'Last edited' : 'Published'} ${new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { month: 'long', day: 'numeric' })}`}
                </small>
              </div>
              <div className="content-row-stats">
                <span>{formatNumber(story.views)} <small>views</small></span>
                <span>{formatNumber(story.likes)} <small>likes</small></span>
              </div>
              <div className="content-row-actions">
                <button type="button" onClick={() => story.status === 'Published' ? onPreview(story) : onEdit(story)}>View</button>
                <button type="button" onClick={() => onEdit(story)}>Edit</button>
                <button type="button" className="delete-action" aria-label={`Delete ${story.title}`} onClick={() => onDelete(story.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">✳</span><h3>Nothing in this little corner yet</h3>
          <p>Make something new, and it will find a home here.</p>
          <button className="button button-dark" type="button" onClick={onAdd}>Create a story</button>
        </div>
      )}
    </section>
  );
}

export default ContentManager;
