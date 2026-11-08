import { formatNumber } from '../utils/creatorUtils';
import StatusTag from './StatusTag';

function DashboardOverview({ content, published, drafts, scheduled, comments, pendingComments, totalViews, onNavigate, onAdd, onEdit, onPreview }) {
  const recent = [...content].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const popular = [...published].sort((a, b) => b.views - a.views || b.likes - a.likes).slice(0, 5);
  const stats = [
    { label: 'Total stories', value: content.length, note: 'Your growing library', icon: '▤', tone: 'lavender' },
    { label: 'Published', value: published.length, note: 'Out in the world', icon: '↗', tone: 'peach' },
    { label: 'In progress', value: drafts.length, note: 'Ideas taking shape', icon: '✎', tone: 'mint' },
    { label: 'Community notes', value: comments.length, note: pendingComments.length ? `${pendingComments.length} waiting for you` : 'All caught up', icon: '◌', tone: 'butter' },
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className={`stat-icon ${stat.tone}`} aria-hidden="true">{stat.icon}</div>
            <span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small>
          </article>
        ))}
      </div>
      <section className="analytics-row">
        <article className="analytics-card">
          <div className="panel-heading">
            <div><span className="panel-kicker">CONTENT ANALYTICS</span><h2>Most popular stories</h2></div>
          </div>
          <div className="chart-summary"><strong>{formatNumber(totalViews)}</strong><span>total views across your stories</span></div>
          {popular.length ? (
            <ol className="popular-content-list">
              {popular.map((story, index) => (
                <li key={story.id}>
                  <span className="popular-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="popular-story"><strong title={story.title}>{story.title}</strong><small>{story.category}</small></span>
                  <span className="popular-metric"><strong>{formatNumber(story.views)}</strong><small>views</small></span>
                  <span className="popular-metric"><strong>{formatNumber(story.likes)}</strong><small>likes</small></span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="popular-empty">Published stories will appear here as viewers engage with them.</p>
          )}
        </article>
        <CommunityCard content={content} pendingComments={pendingComments} onNavigate={onNavigate} />
      </section>
      <section className="recent-content-panel">
        <div className="panel-heading">
          <div><span className="panel-kicker">MADE BY YOU</span><h2>Your latest stories</h2></div>
          <button className="text-link" type="button" onClick={() => onNavigate('content')}>View all <span aria-hidden="true">↗</span></button>
        </div>
        <div className="recent-table">
          <div className="recent-table-header"><span>STORY</span><span>STATUS</span><span>DATE</span><span>VIEWS</span><span aria-hidden="true" /></div>
          {recent.map((story) => (
            <button className="recent-table-row" type="button" key={story.id} onClick={() => story.status === 'Published' ? onPreview(story) : onEdit(story)}>
              <span className="recent-story-name">
                <img src={story.image} alt="" />
                <span><strong>{story.title}</strong><small>{story.category} · {story.type}</small></span>
              </span>
              <span><StatusTag status={story.status} /></span>
              <span>{new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              <span>{formatNumber(story.views)}</span><span className="row-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <button className="mobile-add-story" type="button" onClick={onAdd}>＋ Create a story</button>
      </section>
      <div className="dashboard-footer-note">
        <span aria-hidden="true">✳</span>
        {scheduled.length ? `${scheduled.length} stor${scheduled.length > 1 ? 'ies' : 'y'} scheduled. Nice work, future you.` : 'A good idea can happen at any moment. Keep a little space for it.'}
        <button type="button" onClick={() => onNavigate('calendar')}>See your calendar <span aria-hidden="true">↗</span></button>
      </div>
    </>
  );
}

function CommunityCard({ content, pendingComments, onNavigate }) {
  const totalLikes = content.reduce((sum, item) => sum + item.likes, 0);

  return (
    <article className="community-card">
      <div className="community-card-top"><span className="community-icon" aria-hidden="true">♡</span><span className="community-label">YOUR COMMUNITY</span></div>
      <strong>{formatNumber(totalLikes)}</strong>
      <p>little bits of love across all your stories</p>
      <div className="community-divider" />
      <div className="community-comment">
        <span className="comment-avatar">t</span>
        <span><strong>{pendingComments.length ? 'A comment is waiting' : 'Your community is here'}</strong><small>{pendingComments.length ? 'Give it a quick look when you can.' : 'Keep sharing the things you love.'}</small></span>
        <button type="button" onClick={() => onNavigate('comments')} aria-label="View comments">↗</button>
      </div>
    </article>
  );
}

export default DashboardOverview;
