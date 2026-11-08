import { useRef } from 'react';
import useDialogAccessibility from '../hooks/useDialogAccessibility';

function ConfirmDialog({ title, message, onCancel, onConfirm, busy = false }) {
  const dialogRef = useRef(null);
  useDialogAccessibility(dialogRef, onCancel);

  return (
    <div className="modal-backdrop confirm-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section
        className="confirm-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        tabIndex="-1"
      >
        <span className="confirm-dialog-icon" aria-hidden="true">!</span>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="button button-outline" type="button" data-dialog-initial-focus onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete permanently'}</button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;
