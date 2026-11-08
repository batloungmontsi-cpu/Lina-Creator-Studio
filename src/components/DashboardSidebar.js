const navigation = [
  { id: 'overview', icon: '⌂', label: 'Overview' },
  { id: 'content', icon: '▤', label: 'My content' },
  { id: 'comments', icon: '◌', label: 'Comments' },
  { id: 'calendar', icon: '▦', label: 'Content calendar' },
];

function DashboardSidebar({ page, pendingCount, onNavigate }) {
  return (
    <aside className="dashboard-sidebar" aria-label="Creator studio navigation">
      <div className="sidebar-profile">
        <span className="profile-picture">m</span>
        <span><strong>Mila Mokoena</strong><small>Creator account</small></span>
        <span className="profile-menu" aria-hidden="true">···</span>
      </div>
      <span className="sidebar-label">WORKSPACE</span>
      <nav className="dashboard-nav">
        {navigation.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dashboard-nav-link ${page === item.id ? 'is-active' : ''}`}
            aria-current={page === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'comments' && pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip">
          <span aria-hidden="true">✳</span><strong>A gentle reminder</strong>
          <p>Good things take the time they take. Keep making yours.</p>
        </div>
        <div className="sidebar-help">
          <span className="help-avatar">?</span>
          <span><strong>Need a hand?</strong><small>Visit the creator guide</small></span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
