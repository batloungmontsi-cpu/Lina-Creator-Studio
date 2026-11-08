function SiteHeader({ view, creatorName, mobileMenuOpen, onToggleMenu, onOpenViewer, onOpenDashboard, onLogout }) {
  return (
    <header className="site-header">
      <button className="brand-lockup" type="button" onClick={onOpenViewer} aria-label="Mila Mokoena home">
        <span className="brand-avatar">m.</span>
        <span className="brand-copy"><strong>mila mokoena</strong><small>creator · storyteller · human</small></span>
      </button>
      <button className="mobile-menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-label="Toggle navigation" onClick={onToggleMenu}>
        <span /><span /><span />
      </button>
      <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {view === 'viewer' ? (
          <>
            <button type="button" onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}>Stories</button>
            <button type="button" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About me</button>
            <button className="nav-dashboard-button" type="button" onClick={onOpenDashboard}>Creator studio <span aria-hidden="true">↗</span></button>
          </>
        ) : view === 'login' ? (
          <button type="button" onClick={onOpenViewer}>Back to stories <span aria-hidden="true">↗</span></button>
        ) : (
          <>
            <span className="studio-mode-label"><span className="status-dot" /> {creatorName || 'Creator studio'}</span>
            <button className="nav-dashboard-button" type="button" onClick={onOpenViewer}>View my page <span aria-hidden="true">↗</span></button>
            <button type="button" onClick={onLogout}>Sign out</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default SiteHeader;
