function ToastMessage({ message }) {
  if (!message) return null;

  return <div className="toast-message" role="status"><span aria-hidden="true">✳</span>{message}</div>;
}

export default ToastMessage;
