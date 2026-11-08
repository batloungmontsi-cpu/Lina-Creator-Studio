import { useState } from 'react';

function CreatorLogin({ onLogin, onBack, error, isSubmitting }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    onLogin(email.trim(), password);
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <span className="login-mark" aria-hidden="true">m.</span>
        <span className="eyebrow"><span className="eyebrow-line" /> A LITTLE SPACE, JUST FOR YOU</span>
        <h1 id="login-title">Welcome back.</h1>
        <p>Sign in to your creator studio to manage your stories and community.</p>
        <form className="login-form" autoComplete="off" onSubmit={handleSubmit}>
          <label htmlFor="creator-email">Email address</label>
          <input id="creator-email" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength="254" />
          <label htmlFor="creator-password">Password</label>
          <input id="creator-password" type="password" autoComplete="off" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in to your studio'} <span aria-hidden="true">↗</span></button>
        </form>
        <button className="login-back-link" type="button" onClick={onBack}>← Back to Mila’s stories</button>
      </section>
    </main>
  );
}

export default CreatorLogin;
