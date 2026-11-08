import { useRef } from 'react';
import { categoriesForForm } from '../data/creatorData';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

function currentLocalDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function StoryForm({ story, onClose, onSubmit }) {
  const dialogRef = useRef(null);
  useDialogAccessibility(dialogRef, onClose);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="story-form-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="story-form-title" tabIndex="-1">
        <div className="dialog-heading">
          <div><span className="eyebrow"><span className="eyebrow-line" /> A FRESH LITTLE IDEA</span><h2 id="story-form-title">{story ? 'Give it a little polish.' : 'Make something lovely.'}</h2></div>
          <button className="modal-close" type="button" data-dialog-initial-focus onClick={onClose} aria-label="Close form">×</button>
        </div>
        <form className="story-form" onSubmit={onSubmit}>
          <label>Story title<input name="title" defaultValue={story?.title || ''} placeholder="What are we calling it?" required maxLength="120" /></label>
          <label>Little description<textarea name="description" defaultValue={story?.description || ''} placeholder="What would you like people to know?" required rows="3" maxLength="400" /></label>
          <div className="form-grid">
            <label>Category<select name="category" defaultValue={story?.category || categoriesForForm[0]}>{categoriesForForm.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Format<select name="type" defaultValue={story?.type || 'Article'}>{['Video', 'Article', 'Photo story', 'Podcast', 'Image'].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Story status<select name="status" defaultValue={story?.status || 'Draft'}>{['Draft', 'Published', 'Scheduled'].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>
              Publish date and time
              <input type="datetime-local" name="publicationDateLocal" defaultValue={story?.publicationDateLocal || currentLocalDateTime()} required />
              <small className="publication-help">Scheduled stories use this time. Published stories are timestamped by the server when you save.</small>
            </label>
            <label>Length / runtime<input name="duration" defaultValue={story?.duration || ''} placeholder="e.g. 5 min read" /></label>
            <label>Cover image URL<input name="image" type="url" defaultValue={story?.image || ''} placeholder="https://..." /></label>
            <label>Media link<input name="mediaUrl" type="url" defaultValue={story?.mediaUrl || ''} placeholder="https://..." /></label>
          </div>
          <label className="story-featured-option"><input type="checkbox" name="featured" defaultChecked={story?.featured || false} /> Feature this story on the viewer home page</label>
          <label className="story-article-field">Article text (optional)<textarea name="articleContent" defaultValue={story?.articleContent || ''} placeholder="Add the article text viewers can read..." rows="5" maxLength="50000" /></label>
          <div className="dialog-actions">
            <button className="button button-outline" type="button" onClick={onClose}>Maybe later</button>
            <button className="button button-dark" type="submit">{story ? 'Save my changes' : 'Save this story'} <span aria-hidden="true">↗</span></button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StoryForm;
