import Content from '../models/Content.js';

export function publicationDateForUpdate(status, existingStatus, publicationDate, now = new Date()) {
  if (status === 'Published' && existingStatus !== 'Published' && publicationDate === undefined) {
    return now;
  }
  return publicationDate;
}

export function validatePublication(status, publicationDate, dateRequired = false, now = new Date()) {
  if (status === 'Scheduled') {
    if (dateRequired && publicationDate === undefined) {
      return 'A future publication date and time are required for scheduled content.';
    }
    const scheduledDate = new Date(publicationDate);
    if (!Number.isFinite(scheduledDate.getTime()) || scheduledDate <= now) {
      return 'Scheduled content must have a future publication date and time.';
    }
  }

  if (status === 'Published' && publicationDate !== undefined) {
    const publishedDate = new Date(publicationDate);
    if (!Number.isFinite(publishedDate.getTime()) || publishedDate > now) {
      return 'Published content cannot have a future publication date and time.';
    }
  }

  return null;
}

export function publishDueContent(now = new Date()) {
  return Content.updateMany(
    { status: 'Scheduled', publicationDate: { $lte: now } },
    { $set: { status: 'Published' } },
  );
}
