export function fromApiContent(item) {
  const publicationDate = item.publicationDate || item.date || item.createdAt || new Date().toISOString();
  const parsedPublicationDate = new Date(publicationDate);
  const localPublicationDate = new Date(parsedPublicationDate.getTime() - parsedPublicationDate.getTimezoneOffset() * 60000);
  return {
    id: String(item._id || item.id),
    title: item.title,
    description: item.description,
    category: item.category,
    type: item.type,
    status: item.status,
    date: `${parsedPublicationDate.getFullYear()}-${String(parsedPublicationDate.getMonth() + 1).padStart(2, '0')}-${String(parsedPublicationDate.getDate()).padStart(2, '0')}`,
    publicationDate: parsedPublicationDate.toISOString(),
    publicationDateLocal: localPublicationDate.toISOString().slice(0, 16),
    featured: Boolean(item.featured),
    duration: item.duration || item.type,
    image: item.thumbnailUrl || item.image || '',
    mediaUrl: item.mediaUrl || '',
    articleContent: item.articleContent || '',
    views: Number(item.views) || 0,
    likes: Number(item.likes) || 0,
  };
}

export function toApiContent(item) {
  return {
    title: item.title,
    description: item.description,
    category: item.category,
    type: item.type,
    status: item.status,
    ...(item.status !== 'Published' && item.publicationDateLocal
      ? { publicationDate: new Date(item.publicationDateLocal).toISOString() }
      : item.status !== 'Published' && item.date
        ? { publicationDate: new Date(`${item.date}T12:00:00`).toISOString() }
        : {}),
    featured: Boolean(item.featured),
    duration: item.duration,
    thumbnailUrl: item.image,
    mediaUrl: item.mediaUrl || '',
    articleContent: item.articleContent || '',
  };
}

export function fromApiComment(comment) {
  const content = comment.content;
  return {
    id: String(comment._id || comment.id),
    contentId: String(content?._id || content?.id || content),
    contentTitle: typeof content === 'object' ? content.title : '',
    name: comment.displayName || comment.name || 'Viewer',
    text: comment.text,
    date: comment.createdAt
      ? new Date(comment.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      : comment.date || 'Just now',
    approved: comment.status === 'Approved' || comment.approved === true,
    status: comment.status || (comment.approved ? 'Approved' : 'Pending'),
  };
}

export function createViewerId() {
  const storageKey = 'mila-studio-viewer-id';
  let viewerId = window.localStorage.getItem(storageKey);
  if (!viewerId) {
    viewerId = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `viewer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(storageKey, viewerId);
  }
  return viewerId;
}
