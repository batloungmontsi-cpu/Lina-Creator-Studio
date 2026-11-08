function NewsletterSignup({ onSubscribe }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSubscribe();
    event.currentTarget.reset();
  }

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-title">
      <span className="newsletter-spark" aria-hidden="true">✳</span>
      <div>
        <span className="eyebrow">A GOOD THING IN YOUR INBOX</span>
        <h2 id="newsletter-title">A softer note for your Sunday.</h2>
        <p>New stories, small joys, and a gentle nudge to slow down. No noise, ever.</p>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="newsletter-email">Your email address</label>
        <input id="newsletter-email" type="email" placeholder="Your email address" required />
        <button type="submit" aria-label="Subscribe to the newsletter">Count me in <span aria-hidden="true">↗</span></button>
        <small>By subscribing, you agree to receive the occasional note from Mila.</small>
      </form>
    </section>
  );
}

export default NewsletterSignup;
