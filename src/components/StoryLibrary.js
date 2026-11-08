import { categories } from '../data/creatorData';
import StoryCard from './StoryCard';

function StoryLibrary({ stories, loading, error, category, search, sortOrder, likes, onCategoryChange, onSearchChange, onSortChange, onOpenStory, onLikeStory, onShareStory }) {
  function resetFilters() {
    onSearchChange('');
    onCategoryChange('All stories');
  }

  return (
    <section className="stories-section" id="stories" aria-labelledby="stories-title">
      <div className="stories-heading">
        <div><span className="eyebrow"><span className="eyebrow-line" /> THE STORY LIBRARY</span><h2 id="stories-title">Find a little <em>inspiration.</em></h2></div>
        <p>Thoughtful reads, small discoveries, and honest conversations for wherever life finds you.</p>
      </div>
      <div className="story-toolbar">
        <div className="category-pills" role="group" aria-label="Filter stories by category">
          {categories.map((item) => (
            <button className={`category-pill ${category === item ? 'is-active' : ''}`} key={item} type="button" aria-pressed={category === item} onClick={() => onCategoryChange(item)}>{item}</button>
          ))}
        </div>
        <div className="story-controls">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input id="story-search" aria-label="Search stories" type="search" placeholder="Find a story..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
            <kbd>⌘ K</kbd>
          </label>
          <label className="sort-field">
            <span className="visually-hidden">Sort stories</span>
            <select value={sortOrder} onChange={(event) => onSortChange(event.target.value)}>
              <option value="newest">Latest first</option><option value="popular">Most loved</option>
            </select>
          </label>
        </div>
      </div>
      {loading ? null : error ? (
        <div className="empty-state"><span aria-hidden="true">!</span><h3>Stories could not load</h3><p>Check your connection to the creator API, then try again.</p></div>
      ) : stories.length ? (
        <div className="story-grid">
          {stories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              liked={Boolean(likes[story.id])}
              onOpen={() => onOpenStory(story)}
              onLike={() => onLikeStory(story.id)}
              onShare={() => onShareStory(story)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">✳</span><h3>No stories just yet</h3>
          <p>Try a different search or category. Your next favourite might be hiding there.</p>
          <button className="text-link" type="button" onClick={resetFilters}>Show me everything <span aria-hidden="true">↗</span></button>
        </div>
      )}
    </section>
  );
}

export default StoryLibrary;
