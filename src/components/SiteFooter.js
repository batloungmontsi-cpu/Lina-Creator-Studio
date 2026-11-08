function SiteFooter({ onOpenViewer }) {
  return (
    <footer className="site-footer">
      <button className="footer-brand" type="button" onClick={onOpenViewer}>m.</button>
      <span>Made slowly, with love. © {new Date().getFullYear()} Mila Mokoena.</span>
      <button type="button" className="footer-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to the top ↑</button>
    </footer>
  );
}

export default SiteFooter;
