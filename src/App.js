import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorLogin from './components/CreatorLogin';
import ConfirmDialog from './components/ConfirmDialog';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import StoryDialog from './components/StoryDialog';
import StoryForm from './components/StoryForm';
import ToastMessage from './components/ToastMessage';
import ViewerPortal from './pages/ViewerPortal';
import { createViewerId, fromApiComment, fromApiContent, toApiContent } from './utils/apiMappers';
import { api, clearToken, getToken, saveToken } from './services/api';
import './App.css';

function App() {
  const [content, setContent] = useState([]);
  const [publishedContent, setPublishedContent] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({});
  const [view, setView] = useState('viewer');
  const [dashboardPage, setDashboardPage] = useState('overview');
  const [selectedStory, setSelectedStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [creator, setCreator] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [dataError, setDataError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [stats, setStats] = useState(null);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const sharedStoryOpened = useRef('');

  const loadPublishedContent = useCallback(async () => {
    setIsLoading(true);
    setDataError('');
    try {
      const result = await api.getPublishedContent();
      setPublishedContent(result.items.map(fromApiContent));
    } catch (error) {
      setDataError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    const [contentResult, commentResult, statsResult] = await Promise.all([
      api.getAllContent(),
      api.getAllComments(),
      api.getDashboardStats(),
    ]);
    setContent(contentResult.items.map(fromApiContent));
    setComments(commentResult.comments.map(fromApiComment));
    setStats(statsResult);
  }, []);

  useEffect(() => {
    loadPublishedContent();
  }, [loadPublishedContent]);

  useEffect(() => {
    document.title = view === 'viewer' ? 'Mila Mokoena — Stories for a softer life' : 'Creator Studio — Mila Mokoena';
  }, [view]);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('story-search')?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;
    let active = true;
    async function restoreCreatorSession() {
      try {
        const result = await api.getCreator();
        if (!active) return;
        await loadDashboardData();
        if (!active) return;
        setCreator(result.creator);
        setView('dashboard');
      } catch {
        if (!active) return;
        clearToken();
        setCreator(null);
        setView('viewer');
      }
    }
    restoreCreatorSession();
    return () => { active = false; };
  }, [loadDashboardData]);

  const pendingComments = useMemo(() => comments.filter((comment) => !comment.approved), [comments]);
  const totalViews = stats?.views ?? content.reduce((total, item) => total + item.views, 0);
  const currentStory = selectedStory
    ? content.find((item) => item.id === selectedStory.id)
      || publishedContent.find((item) => item.id === selectedStory.id)
      || selectedStory
    : null;

  const showNotice = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }, []);

  function openDashboard(page = 'overview') {
    setMobileMenuOpen(false);
    setDashboardPage(page);
    setLoginError('');
    if (!getToken() || !creator) {
      setView('login');
      return;
    }
    setView('dashboard');
    loadDashboardData().catch((error) => {
      if (!getToken()) {
        setCreator(null);
        setLoginError('Your creator session expired. Please sign in again.');
        setView('login');
        return;
      }
      showNotice(error.message);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openViewer() {
    setView('viewer');
    setMobileMenuOpen(false);
    loadPublishedContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogin(email, password) {
    setIsSubmittingLogin(true);
    setLoginError('');
    try {
      const result = await api.login(email, password);
      saveToken(result.token);
      setCreator(result.creator);
      await loadDashboardData();
      setView('dashboard');
      setDashboardPage('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      clearToken();
      setCreator(null);
      setLoginError(error.message);
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  function handleLogout() {
    clearToken();
    setCreator(null);
    setContent([]);
    setComments([]);
    setStats(null);
    setView('viewer');
    setDashboardPage('overview');
    loadPublishedContent();
  }

  const openStory = useCallback(async (story) => {
    try {
      const storyResult = await api.getContent(story.id);
      const loadedStory = fromApiContent(storyResult.item);
      setContent((current) => current.map((item) => item.id === loadedStory.id ? loadedStory : item));
      setPublishedContent((current) => current.map((item) => item.id === loadedStory.id ? loadedStory : item));
      setSelectedStory(loadedStory);
      try {
        const [commentResult, likeResult] = await Promise.all([
          api.getContentComments(story.id),
          api.getLike(story.id, createViewerId()),
        ]);
        setComments((current) => [
          ...current.filter((comment) => comment.contentId !== loadedStory.id),
          ...commentResult.comments.map(fromApiComment),
        ]);
        setLikes((current) => ({ ...current, [loadedStory.id]: likeResult.liked }));
      } catch (error) {
        showNotice(error.message);
      }
    } catch (error) {
      showNotice(error.message);
    }
  }, [showNotice]);

  useEffect(() => {
    const sharedStoryId = window.location.hash.slice(1);
    if (!sharedStoryId || isLoading || sharedStoryOpened.current === sharedStoryId) return;
    sharedStoryOpened.current = sharedStoryId;
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    openStory({ id: sharedStoryId });
  }, [isLoading, openStory]);

  async function handleLike(storyId) {
    const viewerId = createViewerId();
    const wasLiked = Boolean(likes[storyId]);
    try {
      const result = wasLiked
        ? await api.removeLike(storyId, viewerId)
        : await api.addLike(storyId, viewerId);
      setLikes((current) => ({ ...current, [storyId]: result.liked }));
      setContent((current) => current.map((item) => item.id === storyId ? { ...item, likes: result.likes } : item));
      setPublishedContent((current) => current.map((item) => item.id === storyId ? { ...item, likes: result.likes } : item));
    } catch (error) {
      showNotice(error.message);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!currentStory || !nameDraft.trim() || commentDraft.trim().length < 3) return;
    try {
      const result = await api.createComment({
        contentId: currentStory.id,
        viewerId: createViewerId(),
        displayName: nameDraft.trim(),
        text: commentDraft.trim(),
      });
      setComments((current) => [...current, fromApiComment(result.comment)]);
      setCommentDraft('');
      showNotice('Thanks for sharing — your comment is awaiting approval.');
    } catch (error) {
      showNotice(error.message);
    }
  }

  async function saveStory(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const savedStory = {
      id: editingStory?.id,
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      type: values.type,
      status: values.status,
      publicationDateLocal: values.publicationDateLocal,
      featured: values.featured === 'on',
      duration: values.duration.trim() || values.type,
      image: values.image.trim() || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
      mediaUrl: values.mediaUrl.trim(),
      articleContent: values.articleContent.trim(),
    };

    try {
      const result = editingStory
        ? await api.updateContent(editingStory.id, toApiContent(savedStory))
        : await api.createContent(toApiContent(savedStory));
      const persistedStory = fromApiContent(result.item);
      setContent((current) => editingStory
        ? current.map((item) => item.id === editingStory.id
          ? persistedStory
          : persistedStory.featured ? { ...item, featured: false } : item)
        : [persistedStory, ...current.map((item) => persistedStory.featured ? { ...item, featured: false } : item)]);
      setShowForm(false);
      setEditingStory(null);
      showNotice(editingStory ? 'Your story has been updated.' : 'Your new story is ready.');
      loadPublishedContent();
    } catch (error) {
      showNotice(error.message);
    }
  }

  function requestStoryDeletion(storyId) {
    const story = content.find((item) => item.id === storyId);
    if (!story) return;
    const commentCount = comments.filter((comment) => comment.contentId === storyId).length;
    setPendingDeletion({ type: 'story', id: storyId, title: story.title, commentCount });
  }

  function requestCommentDeletion(commentId) {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) return;
    setPendingDeletion({ type: 'comment', id: commentId, title: comment.name });
  }

  async function confirmDeletion() {
    if (!pendingDeletion || isDeleting) return;
    setIsDeleting(true);
    try {
      if (pendingDeletion.type === 'story') {
        await api.deleteContent(pendingDeletion.id);
        setContent((current) => current.filter((item) => item.id !== pendingDeletion.id));
        setPublishedContent((current) => current.filter((item) => item.id !== pendingDeletion.id));
        setComments((current) => current.filter((comment) => comment.contentId !== pendingDeletion.id));
        setSelectedStory((current) => current?.id === pendingDeletion.id ? null : current);
        showNotice('Story and its comments removed.');
      } else {
        await api.deleteComment(pendingDeletion.id);
        setComments((current) => current.filter((comment) => comment.id !== pendingDeletion.id));
        showNotice('Comment removed.');
      }
      setPendingDeletion(null);
    } catch (error) {
      showNotice(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function updateComment(commentId, updates) {
    try {
      const status = updates.approved ? 'Approved' : 'Hidden';
      const result = await api.moderateComment(commentId, status);
      const updatedComment = fromApiComment(result.comment);
      setComments((current) => current.map((comment) => comment.id === commentId ? updatedComment : comment));
    } catch (error) {
      showNotice(error.message);
    }
  }

  function shareStory(story) {
    const url = `${window.location.origin}${window.location.pathname}#${story.id}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showNotice('Story link copied to clipboard.')).catch(() => showNotice(url));
    } else {
      showNotice(url);
    }
  }

  function startCreateStory() {
    setEditingStory(null);
    setShowForm(true);
  }

  function startEditStory(story) {
    setEditingStory(story);
    setShowForm(true);
  }

  return (
    <div className="creator-app">
      <SiteHeader
        view={view}
        creatorName={creator?.name}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((open) => !open)}
        onOpenViewer={openViewer}
        onOpenDashboard={() => openDashboard()}
        onLogout={handleLogout}
      />
      {view === 'viewer' && (
        <ViewerPortal
          content={publishedContent}
          likes={likes}
          loading={isLoading}
          error={dataError}
          onRetry={loadPublishedContent}
          onOpenStory={openStory}
          onLikeStory={handleLike}
          onShareStory={shareStory}
          onNotice={showNotice}
        />
      )}
      {view === 'login' && (
        <CreatorLogin
          onLogin={handleLogin}
          onBack={openViewer}
          error={loginError}
          isSubmitting={isSubmittingLogin}
        />
      )}
      {view === 'dashboard' && (
        <CreatorDashboard
          page={dashboardPage}
          content={content}
          comments={comments}
          pendingComments={pendingComments}
          totalViews={totalViews}
          onNavigate={setDashboardPage}
          onAdd={startCreateStory}
          onEdit={startEditStory}
          onDelete={requestStoryDeletion}
          onUpdateComment={updateComment}
          onDeleteComment={requestCommentDeletion}
          onPreview={setSelectedStory}
        />
      )}
      <SiteFooter onOpenViewer={openViewer} />
      {currentStory && (
        <StoryDialog
          story={currentStory}
          comments={comments.filter((comment) => comment.contentId === currentStory.id && comment.approved)}
          liked={Boolean(likes[currentStory.id])}
          nameDraft={nameDraft}
          commentDraft={commentDraft}
          onNameChange={setNameDraft}
          onCommentChange={setCommentDraft}
          onClose={() => setSelectedStory(null)}
          onLike={() => handleLike(currentStory.id)}
          onShare={() => shareStory(currentStory)}
          onSubmit={handleCommentSubmit}
        />
      )}
      {showForm && <StoryForm story={editingStory} onClose={() => { setShowForm(false); setEditingStory(null); }} onSubmit={saveStory} />}
      {pendingDeletion && (
        <ConfirmDialog
          title={pendingDeletion.type === 'story' ? 'Delete this story?' : 'Delete this comment?'}
          message={pendingDeletion.type === 'story'
            ? `Delete “${pendingDeletion.title}” and its ${pendingDeletion.commentCount} ${pendingDeletion.commentCount === 1 ? 'comment' : 'comments'}? Its likes will also be removed. This cannot be undone.`
            : `Permanently delete the comment from ${pendingDeletion.title}? This cannot be undone.`}
          onCancel={() => setPendingDeletion(null)}
          onConfirm={confirmDeletion}
          busy={isDeleting}
        />
      )}
      <ToastMessage message={notice} />
    </div>
  );
}

export default App;
