import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="lead">The route does not exist in this React client.</p>
      </div>
      <Link to="/" className="button">
        Go home
      </Link>
    </section>
  );
}
