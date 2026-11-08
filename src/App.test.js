import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import { starterComments, starterContent } from './data/creatorData';

let mockContent;
let mockComments;
let mockLikes;

function toApiContent(story) {
  return {
    _id: story.id,
    title: story.title,
    description: story.description,
    category: story.category,
    type: story.type,
    status: story.status,
    publicationDate: `${story.date}T12:00:00.000Z`,
    featured: Boolean(story.featured),
    duration: story.duration,
    thumbnailUrl: story.image,
    mediaUrl: story.mediaUrl || '',
    articleContent: story.articleContent || '',
    views: story.views,
    likes: story.likes,
  };
}

function response(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function setupApiMock() {
  mockContent = starterContent.map(toApiContent);
  mockComments = starterComments.map((comment) => ({
    _id: comment.id,
    content: { _id: comment.contentId, title: starterContent.find((story) => story.id === comment.contentId).title },
    displayName: comment.name,
    text: comment.text,
    status: comment.approved ? 'Approved' : 'Pending',
    createdAt: new Date().toISOString(),
  }));
  mockLikes = new Set();
  global.fetch = jest.fn((url, options = {}) => {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.replace('/api', '');
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    if (path === '/contents' && method === 'GET') {
      return response({ items: mockContent.filter((item) => item.status === 'Published') });
    }
    if (path === '/contents/manage/all' && method === 'GET') return response({ items: mockContent });
    if (path === '/auth/login' && method === 'POST') {
      return body.email === 'creator@example.com' && body.password === 'strong-password'
        ? response({ token: 'test-token', creator: { id: 'creator-1', name: 'Mila Mokoena', email: body.email } })
        : response({ message: 'Email or password is incorrect.' }, 401);
    }
    if (path === '/auth/me') return response({ creator: { id: 'creator-1', name: 'Mila Mokoena' } });
    if (path === '/dashboard/stats') {
      return response({
        views: mockContent.reduce((sum, item) => sum + item.views, 0),
        comments: mockComments.length,
        pendingComments: mockComments.filter((item) => item.status === 'Pending').length,
      });
    }
    if (path === '/comments/dashboard') return response({ comments: mockComments });
    if (path === '/contents' && method === 'POST') {
      const item = { ...body, _id: `new-story-${Date.now()}`, views: 0, likes: 0 };
      mockContent.unshift(item);
      return response({ item }, 201);
    }
    if (path.startsWith('/contents/')) {
      const id = decodeURIComponent(path.slice('/contents/'.length));
      const itemIndex = mockContent.findIndex((story) => story._id === id);
      if (method === 'GET' && itemIndex !== -1) {
        mockContent[itemIndex].views += 1;
        return response({ item: mockContent[itemIndex] });
      }
      if (method === 'PUT' && itemIndex !== -1) {
        mockContent[itemIndex] = { ...mockContent[itemIndex], ...body };
        return response({ item: mockContent[itemIndex] });
      }
      if (method === 'DELETE') {
        mockContent = mockContent.filter((story) => story._id !== id);
        mockComments = mockComments.filter((comment) => (comment.content?._id || comment.content) !== id);
        return response(null, 204);
      }
    }
    if (path === '/comments' && method === 'POST') {
      const comment = {
        _id: `new-comment-${Date.now()}`,
        content: body.contentId,
        displayName: body.displayName,
        text: body.text,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      mockComments.push(comment);
      return response({ comment }, 201);
    }
    if (path.startsWith('/comments/') && path !== '/comments/dashboard') {
      const id = decodeURIComponent(path.slice('/comments/'.length));
      if (method === 'GET') {
        return response({ comments: mockComments.filter((comment) => comment.content._id === id && comment.status === 'Approved') });
      }
      if (method === 'PATCH') {
        const comment = mockComments.find((entry) => entry._id === id);
        comment.status = body.status;
        return response({ comment });
      }
      if (method === 'DELETE') {
        mockComments = mockComments.filter((comment) => comment._id !== id);
        return response(null, 204);
      }
    }
    if (path === '/likes' && method === 'POST') {
      mockLikes.add(`${body.contentId}:${body.viewerId}`);
      const item = mockContent.find((story) => story._id === body.contentId);
      item.likes += 1;
      return response({ liked: true, likes: item.likes });
    }
    if (path.startsWith('/likes/')) {
      const id = decodeURIComponent(path.slice('/likes/'.length));
      const viewerId = parsedUrl.searchParams.get('viewerId') || body.viewerId;
      if (method === 'GET') return response({ likes: 1, liked: mockLikes.has(`${id}:${viewerId}`) });
      if (method === 'DELETE') {
        mockLikes.delete(`${id}:${body.viewerId}`);
        const item = mockContent.find((story) => story._id === id);
        item.likes = Math.max(0, item.likes - 1);
        return response({ liked: false, likes: item.likes });
      }
    }
    return response({ message: `Unexpected test API request: ${method} ${path}` }, 404);
  });
}

async function signInAsCreator() {
  fireEvent.click(screen.getByRole('button', { name: /creator studio/i }));
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'creator@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'strong-password' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in to your studio/i }));
  await screen.findByRole('heading', { name: /your creative corner/i });
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.scrollTo = jest.fn();
  setupApiMock();
});

test('shows stories loaded from the API', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: /stories for a softer life/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /find a little inspiration/i })).toBeInTheDocument();
  expect(await screen.findAllByRole('button', { name: /open /i })).toHaveLength(4);
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/contents?limit=50'), expect.objectContaining({ headers: expect.any(Headers) }));
});

test('search and category filters update published stories', async () => {
  render(<App />);
  await screen.findAllByRole('button', { name: /open /i });

  fireEvent.click(screen.getByRole('button', { name: 'Travel' }));
  expect(screen.getAllByRole('button', { name: /open /i })).toHaveLength(1);
  expect(screen.getByRole('button', { name: /open little things i brought home from the market/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'All stories' }));
  fireEvent.change(screen.getByRole('searchbox', { name: /search stories/i }), { target: { value: 'creative' } });
  expect(screen.getAllByRole('button', { name: /open /i })).toHaveLength(1);
});

test('viewers can like a story and submit a moderated API comment', async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: /open the art of a slower morning/i }));
  const dialog = await screen.findByRole('dialog', { name: /the art of a slower morning/i });

  expect(within(dialog).getByRole('button', { name: /send a little love/i })).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: /send a little love/i }));
  expect(await within(dialog).findByRole('button', { name: /loved/i })).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: /loved/i })).toHaveTextContent('187');

  fireEvent.change(within(dialog).getByRole('textbox', { name: /your name/i }), { target: { value: 'Lerato' } });
  fireEvent.change(within(dialog).getByRole('textbox', { name: /your comment/i }), { target: { value: 'This made my morning!' } });
  fireEvent.click(within(dialog).getByRole('button', { name: /leave a note/i }));
  expect(await screen.findByRole('status')).toHaveTextContent(/awaiting approval/i);

  fireEvent.click(within(dialog).getByRole('button', { name: /close story/i }));
  await signInAsCreator();
  fireEvent.click(screen.getAllByRole('button', { name: /comments/i })[0]);
  expect(await screen.findByText('This made my morning!')).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: /approve/i }).slice(-1)[0]);
  await waitFor(() => expect(screen.getAllByRole('button', { name: /hide/i })).not.toHaveLength(0));
});

test('story dialog closes with Escape and restores focus to the story card', async () => {
  render(<App />);
  const storyButton = await screen.findByRole('button', { name: /open the art of a slower morning/i });
  storyButton.focus();
  fireEvent.click(storyButton);

  const dialog = await screen.findByRole('dialog', { name: /the art of a slower morning/i });
  expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: /close story/i }));
  const lastDialogButton = within(dialog).getByRole('button', { name: /leave a note/i });
  lastDialogButton.focus();
  fireEvent.keyDown(lastDialogButton, { key: 'Tab' });
  expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: /close story/i }));
  fireEvent.keyDown(dialog, { key: 'Escape' });

  await waitFor(() => expect(screen.queryByRole('dialog', { name: /the art of a slower morning/i })).not.toBeInTheDocument());
  expect(document.activeElement).toBe(storyButton);
});

test('story deletion requires confirmation and explains that comments and likes are removed', async () => {
  render(<App />);
  await signInAsCreator();
  fireEvent.click(screen.getAllByRole('button', { name: /my content/i })[0]);

  const storyRow = screen.getByText('The art of a slower morning').closest('article');
  fireEvent.click(within(storyRow).getByRole('button', { name: /delete the art of a slower morning/i }));
  const confirmation = await screen.findByRole('dialog', { name: /delete this story/i });
  expect(within(confirmation).getByText(/1 comment/i)).toBeInTheDocument();
  expect(within(confirmation).getByText(/likes will also be removed/i)).toBeInTheDocument();
  fireEvent.click(within(confirmation).getByRole('button', { name: /cancel/i }));
  expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/contents/slow-mornings'), expect.objectContaining({ method: 'DELETE' }));

  fireEvent.click(within(storyRow).getByRole('button', { name: /delete the art of a slower morning/i }));
  fireEvent.click(within(await screen.findByRole('dialog', { name: /delete this story/i })).getByRole('button', { name: /delete permanently/i }));
  await waitFor(() => expect(screen.queryByText('The art of a slower morning')).not.toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/contents/slow-mornings'), expect.objectContaining({ method: 'DELETE' }));
});

test('comment deletion requires confirmation', async () => {
  render(<App />);
  await signInAsCreator();
  fireEvent.click(screen.getAllByRole('button', { name: /comments/i })[0]);

  fireEvent.click(await screen.findByRole('button', { name: /delete comment by thato m\./i }));
  const confirmation = await screen.findByRole('dialog', { name: /delete this comment/i });
  expect(within(confirmation).getByText(/permanently delete the comment from thato m\./i)).toBeInTheDocument();
  fireEvent.click(within(confirmation).getByRole('button', { name: /cancel/i }));
  expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/comments/comment-1'), expect.objectContaining({ method: 'DELETE' }));

  fireEvent.click(screen.getByRole('button', { name: /delete comment by thato m\./i }));
  fireEvent.click(within(await screen.findByRole('dialog', { name: /delete this comment/i })).getByRole('button', { name: /delete permanently/i }));
  await waitFor(() => expect(screen.queryByText(/tried the no-phone first 10 minutes/i)).not.toBeInTheDocument());
});

test('shared story links open the matching story detail', async () => {
  const story = starterContent.find((item) => item.status === 'Published');
  window.history.pushState(null, '', `/#${story.id}`);
  render(<App />);

  expect(await screen.findByRole('dialog', { name: story.title })).toBeInTheDocument();
  expect(window.location.hash).toBe('');
});

test('viewer portal trusts published status and never displays drafts after creator login', async () => {
  const futureStory = {
    ...toApiContent(starterContent[0]),
    _id: 'future-published-story',
    title: 'Future published story',
    status: 'Published',
    publicationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  const draftStory = {
    ...toApiContent(starterContent[0]),
    _id: 'draft-story',
    title: 'Private draft story',
    status: 'Draft',
  };
  mockContent.push(futureStory, draftStory);
  render(<App />);
  await signInAsCreator();
  fireEvent.click(screen.getByRole('button', { name: /view my page/i }));

  await screen.findByRole('heading', { name: /find a little inspiration/i });
  expect(await screen.findByText('Future published story')).toBeInTheDocument();
  expect(screen.queryByText('Private draft story')).not.toBeInTheDocument();
});

test('creator can sign in and create a story persisted through the API', async () => {
  render(<App />);
  await signInAsCreator();

  fireEvent.click(screen.getAllByRole('button', { name: /create a story/i })[0]);
  fireEvent.change(screen.getByLabelText(/story title/i), { target: { value: 'A new little story' } });
  fireEvent.change(screen.getByLabelText(/little description/i), { target: { value: 'A thoughtful note from the studio.' } });
  fireEvent.click(screen.getByRole('button', { name: /save this story/i }));

  await waitFor(() => expect(screen.getByText('A new little story')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/contents'), expect.objectContaining({ method: 'POST' }));
  fireEvent.click(screen.getByRole('button', { name: /my content/i }));
  expect(screen.getByText('A new little story')).toBeInTheDocument();
  const storyRow = screen.getByText('A new little story').closest('article');
  fireEvent.click(within(storyRow).getByRole('button', { name: /edit/i }));
  expect(screen.getByRole('textbox', { name: /story title/i })).toHaveValue('A new little story');
});

test('publishing a new story uses the server clock instead of the browser clock', async () => {
  render(<App />);
  await signInAsCreator();
  fireEvent.click(screen.getAllByRole('button', { name: /create a story/i })[0]);
  fireEvent.change(screen.getByLabelText(/story title/i), { target: { value: 'Published right away' } });
  fireEvent.change(screen.getByLabelText(/little description/i), { target: { value: 'Ready to share immediately.' } });
  fireEvent.change(screen.getByLabelText(/story status/i), { target: { value: 'Published' } });
  fireEvent.click(screen.getByRole('button', { name: /save this story/i }));

  await waitFor(() => {
    const request = global.fetch.mock.calls.find(([url, options]) =>
      new URL(url).pathname.endsWith('/contents') && options.method === 'POST'
    );
    expect(request).toBeDefined();
    expect(JSON.parse(request[1].body)).not.toHaveProperty('publicationDate');
  });
});

test('creator overview ranks published stories by real views and likes', async () => {
  render(<App />);
  await signInAsCreator();

  const popularStories = screen.getByRole('list');
  const firstStory = within(popularStories).getAllByRole('listitem')[0];
  expect(within(firstStory).getByText('The art of a slower morning')).toBeInTheDocument();
  expect(screen.queryByText('+12.8%')).not.toBeInTheDocument();
  expect(screen.queryByText('Last 7 days')).not.toBeInTheDocument();
});

test('story form explains publication date behavior', async () => {
  render(<App />);
  await signInAsCreator();
  fireEvent.click(screen.getAllByRole('button', { name: /create a story/i })[0]);

  expect(screen.getByText(/published stories are timestamped by the server/i)).toBeInTheDocument();
});

test('story form closes with Escape and restores focus to its opener', async () => {
  render(<App />);
  await signInAsCreator();
  const createButton = screen.getAllByRole('button', { name: /create a story/i })[0];
  createButton.focus();
  fireEvent.click(createButton);

  const dialog = await screen.findByRole('dialog', { name: /make something lovely/i });
  expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: /close form/i }));
  fireEvent.keyDown(dialog, { key: 'Escape' });

  await waitFor(() => expect(screen.queryByRole('dialog', { name: /make something lovely/i })).not.toBeInTheDocument());
  expect(document.activeElement).toBe(createButton);
});

test('creator studio requires a valid login', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /creator studio/i }));
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in to your studio/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect/i);
  expect(screen.queryByRole('heading', { name: /your creative corner/i })).not.toBeInTheDocument();
});

test('signing out clears the login form before the next sign-in', async () => {
  render(<App />);
  await signInAsCreator();

  fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
  fireEvent.click(screen.getByRole('button', { name: /creator studio/i }));

  expect(await screen.findByLabelText(/email address/i)).toHaveValue('');
  expect(screen.getByLabelText(/password/i)).toHaveValue('');
  expect(screen.getByLabelText(/email address/i)).toHaveAttribute('autocomplete', 'off');
  expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'off');
});
