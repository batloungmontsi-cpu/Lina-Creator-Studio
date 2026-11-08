import StatusTag from './StatusTag';

function CalendarView({ content, onEdit, onAdd }) {
  const upcoming = [...content]
    .filter((item) => item.status === 'Scheduled' || item.status === 'Draft')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section className="calendar-layout">
      <article className="calendar-card">
        <div className="calendar-card-heading">
          <div><span className="panel-kicker">YOUR NEXT CHAPTER</span><h2>Coming up</h2></div>
          <span className="calendar-mark">✳</span>
        </div>
        {upcoming.length ? upcoming.map((story) => (
          <button className="calendar-story" type="button" key={story.id} onClick={() => onEdit(story)}>
            <span className="calendar-date">
              <strong>{new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { day: '2-digit' })}</strong>
              <small>{new Date(`${story.date}T12:00:00`).toLocaleDateString('en', { month: 'short' })}</small>
            </span>
            <img src={story.image} alt="" />
            <span className="calendar-story-copy"><strong>{story.title}</strong><small>{story.category} · {story.type}</small></span>
            <StatusTag status={story.status} /><span aria-hidden="true">↗</span>
          </button>
        )) : <div className="calendar-empty"><p>A quiet calendar is a lovely place for a new idea.</p></div>}
        <button className="button button-dark calendar-add" type="button" onClick={onAdd}>＋ Plan a story</button>
      </article>
      <aside className="calendar-note">
        <span aria-hidden="true">☼</span><span className="panel-kicker">A NOTE TO YOUR FUTURE SELF</span>
        <h2>Progress, not pressure.</h2>
        <p>Your schedule is a guide, not a rule. Leave a little room for the unexpected good stuff.</p>
      </aside>
    </section>
  );
}

export default CalendarView;
