import { useMemo, useState } from 'react';
import AboutCreator from '../components/AboutCreator';
import FeaturedStory from '../components/FeaturedStory';
import HeroSection from '../components/HeroSection';
import NewsletterSignup from '../components/NewsletterSignup';
import StoryLibrary from '../components/StoryLibrary';

function ViewerPortal({ content, likes, loading, error, onRetry, onOpenStory, onLikeStory, onShareStory, onNotice }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All stories');
  const [sortOrder, setSortOrder] = useState('newest');
  const publishedContent = useMemo(() => content.filter((item) => item.status === 'Published'), [content]);
  const featuredStory = publishedContent.find((item) => item.featured) || publishedContent[0];
  const visibleStories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return publishedContent
      .filter((item) => category === 'All stories' || item.category === category)
      .filter((item) => !normalizedSearch || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => sortOrder === 'newest' ? new Date(b.date) - new Date(a.date) : b.views - a.views);
  }, [category, publishedContent, search, sortOrder]);

  return (
    <main>
      <HeroSection />
      {error && <div className="portal-error" role="alert"><p>{error}</p><button className="button button-outline" type="button" onClick={onRetry}>Try again</button></div>}
      {loading && <div className="portal-loading" role="status">Gathering the latest stories…</div>}
      <FeaturedStory story={featuredStory} onOpen={() => onOpenStory(featuredStory)} />
      <StoryLibrary
        stories={visibleStories}
        loading={loading}
        error={error}
        category={category}
        search={search}
        sortOrder={sortOrder}
        likes={likes}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
        onSortChange={setSortOrder}
        onOpenStory={onOpenStory}
        onLikeStory={onLikeStory}
        onShareStory={onShareStory}
      />
      <AboutCreator onMoreAbout={() => onNotice('A little more about Mila — coming soon!')} />
      <NewsletterSignup onSubscribe={() => onNotice('You’re on the list — see you Sunday!')} />
    </main>
  );
}

export default ViewerPortal;
