import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { publicationDateForUpdate, validatePublication } from '../src/utils/contentPublishing.js';
import { demoComments, demoStories } from '../src/scripts/demoStories.js';

process.env.CORS_ORIGINS = 'http://localhost:3000';
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await mongoose.disconnect();
});

test('health endpoint reports unavailable until MongoDB connects', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: 'unavailable', database: 'disconnected' });
});

test('creator dashboard stats require authentication', async () => {
  const response = await fetch(`${baseUrl}/api/dashboard/stats`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Creator authentication is required.' });
});

test('unknown API routes return a not-found response', async () => {
  const response = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).message, /route not found/i);
});

test('content detail rejects invalid IDs without a server error', async () => {
  const response = await fetch(`${baseUrl}/api/contents/not-a-content-id`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'Content ID is invalid.' });
});

test('comment and like reads reject invalid content IDs without a server error', async () => {
  const [commentsResponse, likesResponse] = await Promise.all([
    fetch(`${baseUrl}/api/comments/not-a-content-id`),
    fetch(`${baseUrl}/api/likes/not-a-content-id`),
  ]);
  assert.equal(commentsResponse.status, 400);
  assert.deepEqual(await commentsResponse.json(), { message: 'Content ID is invalid.' });
  assert.equal(likesResponse.status, 400);
  assert.deepEqual(await likesResponse.json(), { message: 'Content ID is invalid.' });
});

test('requests from origins outside the allowlist are rejected', async () => {
  const response = await fetch(`${baseUrl}/api/health`, { headers: { Origin: 'https://not-allowed.example' } });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { message: 'This origin is not allowed.' });
});

test('scheduled content requires a future publication date and time', () => {
  const now = new Date('2026-01-01T10:00:00.000Z');
  assert.equal(validatePublication('Scheduled', undefined, true, now), 'A future publication date and time are required for scheduled content.');
  assert.equal(validatePublication('Scheduled', '2026-01-01T09:00:00.000Z', false, now), 'Scheduled content must have a future publication date and time.');
  assert.equal(validatePublication('Scheduled', '2026-01-01T11:00:00.000Z', false, now), null);
});

test('published content cannot be dated in the future', () => {
  const now = new Date('2026-01-01T10:00:00.000Z');
  assert.equal(validatePublication('Published', '2026-01-01T11:00:00.000Z', false, now), 'Published content cannot have a future publication date and time.');
  assert.equal(validatePublication('Published', '2026-01-01T09:00:00.000Z', false, now), null);
});

test('newly published or scheduled content uses the server clock when no date is provided', () => {
  const now = new Date('2026-01-01T10:00:00.000Z');
  assert.equal(publicationDateForUpdate('Published', 'Draft', undefined, now), now);
  assert.equal(publicationDateForUpdate('Published', 'Scheduled', undefined, now), now);
  assert.equal(publicationDateForUpdate('Published', 'Published', undefined, now), undefined);
  assert.equal(publicationDateForUpdate('Scheduled', 'Draft', undefined, now), undefined);
});

test('demo seed contains clearly labelled published sample stories only', () => {
  assert.equal(demoStories.length, 7);
  assert.ok(demoStories.every((story) => story.title.startsWith('Sample:')));
  assert.ok(demoStories.every((story) => story.status === 'Published'));
  assert.ok(demoStories.every((story) => ['Video', 'Article', 'Photo story', 'Podcast', 'Image'].includes(story.type)));
});

test('demo seed includes labelled comments for approved and pending moderation states', () => {
  assert.equal(demoComments.length, 4);
  assert.ok(demoComments.every((comment) => comment.displayName.startsWith('Sample viewer - ')));
  assert.ok(demoComments.every((comment) => comment.text.startsWith('Sample comment: ')));
  assert.deepEqual(new Set(demoComments.map((comment) => comment.status)), new Set(['Approved', 'Pending']));
  assert.ok(demoComments.every((comment) => demoStories.some((story) => story.title === comment.storyTitle)));
});
