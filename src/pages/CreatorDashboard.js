import ContentManager from '../components/ContentManager';
import CommentManager from '../components/CommentManager';
import CalendarView from '../components/CalendarView';
import DashboardOverview from '../components/DashboardOverview';
import DashboardSidebar from '../components/DashboardSidebar';

const pageDetails = {
  overview: {
    label: 'Overview',
    title: 'Your creative corner.',
    description: 'A thoughtful home for everything you make and everyone you reach.',
  },
  content: {
    label: 'My content',
    title: 'All your stories.',
    description: 'Every idea, in progress or ready to share.',
  },
  comments: {
    label: 'Comments',
    title: 'The conversation.',
    description: 'See what your community is saying and keep the conversation kind.',
  },
  calendar: {
    label: 'Content calendar',
    title: 'A little look ahead.',
    description: 'Your publishing plans, all in one place.',
  },
};

function CreatorDashboard({ page, content, comments, pendingComments, totalViews, onNavigate, onAdd, onEdit, onDelete, onUpdateComment, onDeleteComment, onPreview }) {
  const pageInfo = pageDetails[page] || pageDetails.overview;
  const published = content.filter((item) => item.status === 'Published');
  const drafts = content.filter((item) => item.status === 'Draft');
  const scheduled = content.filter((item) => item.status === 'Scheduled');

  return (
    <main className="dashboard-layout">
      <DashboardSidebar page={page} pendingCount={pendingComments.length} onNavigate={onNavigate} />
      <section className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="breadcrumb">Studio <span>/</span> <strong>{pageInfo.label}</strong></div>
          <div className="dashboard-top-actions">
            <button className="preview-link" type="button" onClick={() => onPreview(published[0])} disabled={!published.length}><span aria-hidden="true">◉</span> Preview page</button>
            <button className="dashboard-avatar" type="button" aria-label="Mila Mokoena account">m</button>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div><span className="eyebrow"><span className="eyebrow-line" /> YOUR STUDIO, YOUR SPACE</span><h1>{pageInfo.title}</h1><p>{pageInfo.description}</p></div>
            {page !== 'comments' && page !== 'calendar' && (
              <button className="button button-dark add-content-button" type="button" onClick={onAdd}><span aria-hidden="true">＋</span> Create a story</button>
            )}
          </div>
          {page === 'overview' && (
            <DashboardOverview
              content={content}
              published={published}
              drafts={drafts}
              scheduled={scheduled}
              comments={comments}
              pendingComments={pendingComments}
              totalViews={totalViews}
              onNavigate={onNavigate}
              onAdd={onAdd}
              onEdit={onEdit}
              onPreview={onPreview}
            />
          )}
          {page === 'content' && <ContentManager content={content} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} />}
          {page === 'comments' && <CommentManager comments={comments} content={content} onUpdate={onUpdateComment} onDelete={onDeleteComment} />}
          {page === 'calendar' && <CalendarView content={content} onEdit={onEdit} onAdd={onAdd} />}
        </div>
      </section>
    </main>
  );
}

export default CreatorDashboard;
