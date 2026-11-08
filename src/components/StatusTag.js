function StatusTag({ status }) {
  return <span className={`status-tag status-${status.toLowerCase()}`}><span />{status}</span>;
}

export default StatusTag;
