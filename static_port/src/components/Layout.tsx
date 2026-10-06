import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { publicNav, adminNav } from '@/data/siteData';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';
import { analytics } from '@/analytics/analytics';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useAnalyticsTracker();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">

      {/* ══ MICROSOFT-STYLE HEADER ══ */}
      <header className="ms-topbar">
        <div className="ms-topbar__inner">
          {/* Brand */}
          <div className="ms-topbar__brand">
            {/* Four-square Windows-style logo */}
            {/* <div className="ms-logo" aria-label="Logo">
              <span style={{ background: '#f25022' }} />
              <span style={{ background: '#7fba00' }} />
              <span style={{ background: '#00a4ef' }} />
              <span style={{ background: '#ffb900' }} />
            </div> */}
            <span className="ms-topbar__name">Malay Maity</span>
          </div>

          {/* Primary Nav */}
          <nav className="ms-nav" aria-label="Primary navigation">
            {publicNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ms-nav__link${isActive ? ' ms-nav__link--active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          {/* <div className="ms-topbar__actions">
            {adminNav.slice(0, 2).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `ms-topbar__action-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div> */}

          {/* Hamburger Button */}
          <button
            className={`ms-hamburger ${mobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="ms-mobile-menu">
            <nav className="ms-mobile-nav" aria-label="Mobile navigation">
              {publicNav.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `ms-mobile-nav__link${isActive ? ' active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="ms-mobile-nav__divider" />
              {adminNav.slice(0, 2).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `ms-mobile-nav__link${isActive ? ' active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      {/* ══ MICROSOFT-STYLE FOOTER ══ */}
      <footer className="ms-footer">
        {/* Rainbow accent bar */}
        <div className="ms-footer__accent" />

        <div className="ms-footer__body">
          <div className="ms-footer__inner">

            {/* Brand & tagline */}
            <div className="ms-footer__brand-col">
              {/* <div className="ms-logo ms-logo--light">
                <span style={{ background: '#f25022' }} />
                <span style={{ background: '#7fba00' }} />
                <span style={{ background: '#00a4ef' }} />
                <span style={{ background: '#ffb900' }} />
              </div> */}
              <p className="ms-footer__name">Malay Maity</p>
              <p className="ms-footer__tagline">Software Engineer · Full-stack Developer</p>
              <p className="ms-footer__sub">Building scalable, high-quality software — one clean commit at a time.</p>
              <div className="ms-footer__socials">
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="ms-footer__social" onClick={() => analytics.trackGithubClick('footer-github')}>GH</a>
                <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="ms-footer__social" onClick={() => analytics.trackLinkedinClick()}>in</a>
                <a href="mailto:malay.official.cse@gmail.com" className="ms-footer__social" onClick={() => analytics.trackEmailClick()}>@</a>
              </div>
            </div>

            {/* Explore column */}
            <div className="ms-footer__col">
              <h3 color="black">Explore</h3>
              {publicNav.slice(0, 5).map(item => (
                <NavLink key={item.to} to={item.to} className="ms-footer__link">{item.label}</NavLink>
              ))}
            </div>

            {/* Contact column */}
            <div className="ms-footer__col">
              <h3>Contact</h3>
              <a href="mailto:malay.official.cse@gmail.com" className="ms-footer__link" onClick={() => analytics.trackEmailClick()}>Email me</a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="ms-footer__link" onClick={() => analytics.trackLinkedinClick()}>LinkedIn</a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="ms-footer__link" onClick={() => analytics.trackGithubClick('footer-contact-github')}>GitHub</a>
              <NavLink to="/projects" className="ms-footer__link ms-footer__link--dim">Projects</NavLink>
              <NavLink to="/certificates" className="ms-footer__link ms-footer__link--dim">Certificates</NavLink>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="ms-footer__bottom">
          <div className="ms-footer__bottom-inner">
            <p>© {new Date().getFullYear()} Malay Maity. All rights reserved.</p>
            <div className="ms-footer__legal">
              <a href="/">Privacy</a>
              <a href="/">Terms of use</a>
              <a href="/">Trademarks</a>
              <a href="/">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
