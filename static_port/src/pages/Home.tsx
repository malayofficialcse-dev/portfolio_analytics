import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import React from 'react';
import { analytics } from '../analytics/analytics';
import { profileData } from '../data/profileData';
import { projectsData } from '../data/projectsData';
import { booksData } from '../data/booksData';
import { certificatesData } from '../data/certificatesData';
import { researchPapersData } from '../data/researchPapersData';
import { experiencesData } from '../data/experiencesData';
import { skillsData as rawSkillsData } from '../data/skillsData';
import { quickLinksData } from '../data/quickLinksData';
import {
  SiPython,
  SiMysql,

} from "react-icons/si";

import { FaJava } from "react-icons/fa";
import {
  FaGithub,
  FaLinkedin,
  FaDocker,

} from "react-icons/fa";
// import {
//   SiDocker,
//   SiKubernetes,
//   SiTerraform,
//   SiRedis,
//   SiApachekafka
// } from "react-icons/si";
import {
  SiGooglescholar,
  SiResearchgate,
  SiOrcid,
  SiLeetcode,
  SiGeeksforgeeks,
} from "react-icons/si";
import {
  SiMongodb,
  SiDocker,
  SiKubernetes,
  SiApachekafka,
  SiTerraform,
  SiReact,
  SiNodedotjs,
  SiGithub,
  SiGit,
  SiLinux,
  SiTypescript,
} from "react-icons/si";
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';

/* ─── Type definitions ──────────────────────────────────────────── */

type ProfileData = {
  _id?: string;
  name?: string;
  title?: string;
  bio?: string;
  description?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  resume?: string;
};

type ProjectItem = {
  _id: string;
  title: string;
  description?: string;
  imageUrls?: string[];
  tags?: string[];
  liveUrl?: string;
  githubUrl?: string;
};

type BookItem = {
  _id: string;
  title: string;
  authors?: string[];
  description?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  type?: string;
  publisher?: string;
};

type CertItem = {
  _id: string;
  title: string;
  issuer?: string;
  issuingOrganization?: string;
  imageUrl?: string;
  imageUrls?: string[];
  issueDate?: string;
  credentialUrl?: string;
};

type ResearchPaper = {
  _id: string;
  title: string;
  abstract?: string;
  imageUrls?: string[];
  journal?: string;
  conference?: string;
  keywords?: string[];
  publicationDate?: string;
};

type ExperienceItem = {
  _id: string;
  company: string;
  role: string;
  joinDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  imageUrls?: string[];
  skills?: { _id: string; name: string; iconUrl?: string }[];
};

type TechnicalSkill = {
  _id: string;
  name: string;
  level: number;
  category?: string;
  iconUrl?: string;
};

type SkillsRecord = {
  technicalSkills?: TechnicalSkill[];
};


/* ─── Helpers ───────────────────────────────────────────────────── */

const fmtLink = (v?: string) => (v ? (v.startsWith('http') ? v : `https://${v}`) : '');
const clamp = (n: number) => Math.max(0, Math.min(100, n));

/* ─── Reusable carousel hook ────────────────────────────────────── */

function useCarousel(count: number, interval = 4000) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || count === 0) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % count), interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, count, interval]);

  const prev = () => setIdx(i => (i - 1 + count) % count);
  const next = () => setIdx(i => (i + 1) % count);

  return { idx, setIdx, prev, next, paused, setPaused };
}

/* ─── Carousel UI ───────────────────────────────────────────────── */

function CarouselDots({ count, idx, setIdx }: { count: number; idx: number; setIdx: (i: number) => void }) {
  return (
    <div className="hc-dots">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          className={`hc-dot${i === idx ? ' active' : ''}`}
          onClick={() => setIdx(i)}
          aria-label={`Slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ─── Quick nav links ───────────────────────────────────────────── */

// const quickLinks = [
//   { to: '/projects', icon: '', label: 'GitHub' },
//   { to: '/skills', icon: '⚙️', label: 'LinkedIn' },
//   { to: '/certificates', icon: '🏆', label: 'Google Scholar' },
//   { to: '/research', icon: '🔬', label: 'Research Gate' },
//   { to: '/books', icon: '📚', label: 'Orcid' },
//   { to: '/experiences', icon: '💼', label: 'DockerHub' },
//   { to: '/events', icon: '📅', label: 'Leetcode' },
//   { to: '/academic', icon: '🎓', label: 'GeeksforGeeks' },
// ];

const renderIcon = (iconName: string) => {
  const FaIcon = (FaIcons as any)[iconName];
  if (FaIcon) return <FaIcon />;
  
  const SiIcon = (SiIcons as any)[iconName];
  if (SiIcon) return <SiIcon />;
  
  return <FaIcons.FaGlobe />;
};
/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export function Home() {

  // const glassCard = {
  //   position: "absolute",
  //   width: "120px",
  //   height: "120px",
  //   borderRadius: "30px",
  //   background: "rgba(255,255,255,.45)",
  //   backdropFilter: "blur(18px)",
  //   WebkitBackdropFilter: "blur(18px)",
  //   border: "1px solid rgba(255,255,255,.55)",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   boxShadow:
  //     "0 15px 40px rgba(0,0,0,.08), inset 0 1px 1px rgba(255,255,255,.5)",
  //   transition: ".45s",
  //   cursor: "pointer",
  // };


  const glassCard: React.CSSProperties = {
    position: "absolute",
    width: "125px",
    height: "125px",

    background:
      "linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.42))",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow:
      "0 18px 45px rgba(0,0,0,.10), inset 0 2px 2px rgba(255,255,255,.6)",
    transition: ".45s ease",
    cursor: "pointer",
  };

  // const floatAnimation = `
  // @keyframes float{
  // 0%{transform:translateY(0px) rotate(0deg);}
  // 50%{transform:translateY(-18px) rotate(2deg);}
  // 100%{transform:translateY(0px) rotate(0deg);}
  // }

  // @keyframes glow{
  // 0%{opacity:.25;}
  // 50%{opacity:.55;}
  // 100%{opacity:.25;}
  // }
  // `;


  const floatAnimation = `

@keyframes float{

0%{

transform:translateY(0px) rotate(0deg);

}

25%{

transform:translateY(-8px) rotate(2deg);

}

50%{

transform:translateY(-16px) rotate(-2deg);

}

75%{

transform:translateY(-8px) rotate(1deg);

}

100%{

transform:translateY(0px) rotate(0deg);

}

}

@keyframes glow{

0%{

opacity:.15;

}

50%{

opacity:.4;

}

100%{

opacity:.15;

}

}
`;
  const heroRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    heroRef.current.style.backgroundPosition = `${50 + x * 6}% ${50 + y * 6}%`;
  };
  /* profile */
  const [profile] = useState<ProfileData | null>(profileData as ProfileData | null);
  const [profileLoading] = useState(false);

  /* section data — loaded from static data files */
  const [projects] = useState<ProjectItem[]>(projectsData as ProjectItem[]);
  const [books] = useState<BookItem[]>(booksData as BookItem[]);
  const [certs] = useState<CertItem[]>(certificatesData as CertItem[]);
  const [research] = useState<ResearchPaper[]>(researchPapersData as ResearchPaper[]);
  const [experiences] = useState<ExperienceItem[]>(experiencesData as ExperienceItem[]);
  const [skills] = useState<TechnicalSkill[]>((rawSkillsData?.[0] as any)?.technicalSkills ?? []);
  const [quickLinks] = useState<any[]>(quickLinksData ?? []);

  /* hero slide */
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  /* carousels */
  const projCar = useCarousel(Math.max(projects.length, 1), 5000);
  const bookCar = useCarousel(Math.max(books.length, 1), 6000);
  const certCar = useCarousel(Math.max(certs.length, 1), 5500);
  const resCar = useCarousel(Math.max(research.length, 1), 6500);
  const expCar = useCarousel(Math.max(experiences.length, 1), 5800);

  /* hero auto-rotate */
  useEffect(() => {
    if (heroPaused) return;
    const id = setInterval(() => setHeroSlide(s => (s + 1) % 2), 4000);
    return () => clearInterval(id);
  }, [heroPaused]);

  const name = profile?.name ?? 'Malay Maity';
  const title = profile?.title ?? 'Software Engineer';
  const bio = profile?.bio ?? 'Developer skilled in building efficient, scalable applications and solving real-world problems through clean and reliable code.';

  const profileLinks = useMemo(() => [
    { label: 'Email', href: profile?.email ? `mailto:${profile.email}` : '', value: profile?.email },
    { label: 'GitHub', href: fmtLink(profile?.github), value: profile?.github },
    { label: 'LinkedIn', href: fmtLink(profile?.linkedin), value: profile?.linkedin },
    { label: 'Website', href: fmtLink(profile?.website), value: profile?.website },
  ].filter(i => Boolean(i.value)), [profile]);

  const topSkills = useMemo(() => [...skills].sort((a, b) => b.level - a.level).slice(0, 12), [skills]);

  const heroSlides = [
    {
      eyebrow: 'Portfolio · Full-Stack Engineer',
      heading: name,
      sub: title,
      body: bio,
      cta: { label: 'View Projects', to: '/projects' },
      ctaAlt: { label: 'Download Resume', to: profile?.resume ? fmtLink(profile.resume) : '/certificates' },
      bg: 'linear-gradient(135deg, #f7fbff 0%, #e2efff 50%, #d5e7fb 100%)',
      light: true,
    },
    {
      eyebrow: 'Malay Maity',
      heading: 'Full Stack Software Engineer',
      sub: profile?.location ?? 'Kolkata, West Bengal',
      body: 'Full Stack Software Engineer passionate about designing scalable, cloud-native applications using React, Node.js, Microsoft Azure, Kubernetes, Docker and modern DevOps practices. I enjoy transforming complex business requirements into secure, maintainable, high-performance software solutions.',
      cta: { label: 'Get in touch', to: profile?.email ? (`mailto:${profile.email}` as any) : '/admin/login' },
      ctaAlt: { label: 'Explore skills', to: '/skills' },
      bg: 'linear-gradient(135deg, #f3f7ff 0%, #dbe8f9 50%, #c9dff4 100%)',
      light: true,
    },
  ];

  const cur = heroSlides[heroSlide];

  if (profileLoading) {
    return (
      <div className="ms-loading">
        <span className="ms-loading__spinner" />
        <p>Loading…</p>
      </div>
    );
  }



  const resolveUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_BACKEND_URL || 'https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net';
    if (url.startsWith('/uploads')) return `${base}${url}`;
    return url;
  };

  /* ─── helpers for image fallbacks ── */
  const projImg = (p: ProjectItem) => resolveUrl(p.imageUrls?.[0]);
  const bookImg = (b: BookItem) => resolveUrl(b.coverImageUrl || b.imageUrls?.[0]);
  const certImg = (c: CertItem) => resolveUrl(c.imageUrl || c.imageUrls?.[0]);
  const resImg = (r: ResearchPaper) => resolveUrl(r.imageUrls?.[0]);
  const expImg = (e: ExperienceItem) => resolveUrl(e.imageUrls?.[0]);

  const isLight = cur.light === true;

  return (
    <div className="ms-home">

      {/* ══════════ HERO BANNER ══════════ */}
      <section
        className={`ms-hero${isLight ? ' ms-hero--light' : ''}`}
        style={{ background: cur.bg }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {/* animated particles */}
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className="hero-particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className="ms-hero__inner">
          <div className="ms-hero__copy" key={heroSlide}>
            <p className="ms-hero__eyebrow">{cur.eyebrow}</p>
            <h1 className="ms-hero__heading">{cur.heading}</h1>
            <p className="ms-hero__sub">{cur.sub}</p>
            <p className="ms-hero__body">{cur.body}</p>

            <div className="ms-hero__summary">
              <div className="ms-hero__summary-item">
                <strong>{projects.length}</strong>
                <span>projects delivered</span>
              </div>
              <div className="ms-hero__summary-item">
                <strong>{experiences.length}</strong>
                <span>professional experiences</span>
              </div>
              <div className="ms-hero__summary-item">
                <strong>{skills.length}</strong>
                <span>technical skills</span>
              </div>
              <div className="ms-hero__summary-item">
                <strong>{certs.length}</strong>
                <span>certifications earned</span>
              </div>
            </div>

            <div className="ms-hero__tags">
              {(topSkills.slice(0, 6)).map(skill => (
                <span key={skill._id ?? skill.name} className="ms-hero__tag">
                  {skill.name}
                </span>
              ))}
            </div>

            <div className="ms-hero__actions">
              <Link
                to={cur.cta.to}
                className="ms-btn ms-btn--primary"
                onClick={() => {
                  if (cur.cta.label === 'View Projects') analytics.trackEvent('PAGE_VIEW', 'Hero View Projects');
                }}
              >
                {cur.cta.label}
              </Link>
              <Link
                to={cur.ctaAlt.to}
                className={isLight ? 'ms-btn ms-btn--outline-dark' : 'ms-btn ms-btn--ghost'}
                onClick={() => {
                  if (cur.ctaAlt.label.includes('Resume')) {
                    analytics.trackResumeDownload(cur.ctaAlt.to);
                  }
                }}
              >
                {cur.ctaAlt.label}
              </Link>
            </div>

            {/* <div className="ms-hero__techs">
              <div className="ms-tech">
                <SiKubernetes />
              </div>

              <div className="ms-tech">
                <SiDocker />
              </div>

              <div className="ms-tech">
                <SiTerraform />
              </div>

              <div className="ms-tech">
                <SiRedis />
              </div>

              <div className="ms-tech">
                <SiApachekafka />
              </div>
            </div> */}

            {/* <div className="hero-floating-tech kubernetes">
              <SiKubernetes />
            </div>

            <div className="hero-floating-tech docker">
              <SiDocker />
            </div>

            <div className="hero-floating-tech terraform">
              <SiTerraform />
            </div>

            <div className="hero-floating-tech redis">
              <SiRedis />
            </div>

            <div className="hero-floating-tech kafka">
              <SiApachekafka />
            </div> */}
          </div>

          <div className="ms-hero__visual" key={`v-${heroSlide}`}>
            {profile?.profileImage
              ? (
                <div className="hero-photo-frame">
                  <img src={resolveUrl(profile.profileImage)} alt={name} className="ms-hero__photo" />
                  <div className="hero-photo-badge">
                    <span className="hero-badge-dot" />
                    Available for collaboration
                  </div>
                </div>
              )
              : (
                <div className="ms-hero__stats-panel">
                  <div className="ms-hero__stat"><span>Focus</span><strong>Full-stack Dev</strong></div>
                  <div className="ms-hero__stat"><span>Style</span><strong>Clean & Reliable</strong></div>
                  <div className="ms-hero__stat"><span>Approach</span><strong>User-first UI</strong></div>
                  <div className="ms-hero__stat"><span>Location</span><strong>{profile?.location ?? 'West Bengal, IN'}</strong></div>
                </div>
              )
            }
          </div>
        </div>

        {/* slide controls */}
        <div className="ms-hero__controls">
          <button className="ms-hero__arrow" onClick={() => setHeroSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)}>‹</button>
          {heroSlides.map((_, i) => (
            <button key={i} className={`ms-hero__dot ${i === heroSlide ? 'active' : ''}`} onClick={() => setHeroSlide(i)} />
          ))}
          <button className="ms-hero__arrow" onClick={() => setHeroSlide(s => (s + 1) % heroSlides.length)}>›</button>
        </div>
      </section>

      {/* ══════════ QUICK NAV ══════════ */}


      <style>{floatAnimation}</style>

      {/* <div
  style={{
    position: "relative",
    width: "100%",
    height: "420px",
    overflow: "hidden",
    borderRadius: "40px",
    background:
      "radial-gradient(circle at top,#eef7ff 0%,#d7ecff 35%,#f7fbff 100%)",
  }}
> */}

        <section className="ms-quick" style={{ borderTop: "1px solid #e5e7eb" }}>
        <div className="ms-quick__inner">
          {quickLinks.map(item => {
            const isExternal = item.link.startsWith('http') || item.link.startsWith('//');
            const iconComponent = renderIcon(item.icon);

            if (isExternal) {
              return (
                <a key={item._id || item.link} href={item.link} target="_blank" rel="noopener noreferrer" className="ms-quick__item">
                  <span className="ms-quick__icon">{iconComponent}</span>
                  <span className="ms-quick__subtitle">{item.text}</span>
                </a>
              );
            }

            return (
              <Link key={item._id || item.link} to={item.link} className="ms-quick__item">
                <span className="ms-quick__icon">{iconComponent}</span>
                <span className="ms-quick__subtitle">{item.text}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      {/* <section className="home-stats-strip">
        <div className="home-stats-strip__inner">
          <div className="home-stat-item">
            <strong>{projects.length || '—'}</strong>
            <span>Projects Built</span>
          </div>
          <div className="home-stat-item">
            <strong>{certs.length || '—'}</strong>
            <span>Certifications</span>
          </div>
          <div className="home-stat-item">
            <strong>{research.length || '—'}</strong>
            <span>Research Papers</span>
          </div>
          <div className="home-stat-item">
            <strong>{books.length || '—'}</strong>
            <span>Publications</span>
          </div>
          <div className="home-stat-item">
            <strong>{experiences.length || '—'}</strong>
            <span>Work Experiences</span>
          </div>
          <div className="home-stat-item">
            <strong>{skills.length || '—'}</strong>
            <span>Technical Skills</span>
          </div>
        </div>
      </section> */}

      {/* ══════════ PROJECTS CAROUSEL ══════════ */}
      {projects.length > 0 && (
        <section className="home-carousel-section home-carousel-section--dark">
          <div className="home-carousel-section__header">
            <div className="home-carousel-section__label">Open Source</div>
            <h2 className="home-carousel-section__title">Projects &amp; Builds</h2>
            <p className="home-carousel-section__sub">Explore full-stack web apps, CLI tools, and research prototypes.</p>
            <Link to="/projects" className="home-carousel-section__link">View all projects →</Link>
          </div>

          <div
            className="home-carousel"
            onMouseEnter={() => projCar.setPaused(true)}
            onMouseLeave={() => projCar.setPaused(false)}
          >
            <button className="hc-arrow hc-arrow--left" onClick={projCar.prev} aria-label="Previous">‹</button>

            <div className="hc-track">
              {projects.map((p, i) => (
                <div
                  key={p._id}
                  className={`hc-slide ${i === projCar.idx ? 'active' : ''}`}
                  aria-hidden={i !== projCar.idx}
                >
                  <div className="hc-card">
                    <div className="hc-card__media">
                      {projImg(p)
                        ? <img src={projImg(p)} alt={p.title} loading="lazy" />
                        : <div className="hc-card__placeholder"><span>Project</span></div>
                      }
                      <div className="hc-card__overlay-badge">Project #{String(i + 1).padStart(2, '0')}</div>
                    </div>
                    <div className="hc-card__body">
                      <h3 className="hc-card__title">{p.title}</h3>
                      {p.description && <p className="hc-card__text">{p.description.slice(0, 140)}{p.description.length > 140 ? '…' : ''}</p>}
                      {p.tags && p.tags.length > 0 && (
                        <div className="hc-card__chips">
                          {p.tags.slice(0, 4).map(t => <span key={t} className="hc-chip">{t}</span>)}
                        </div>
                      )}
                      <div className="hc-card__actions">
                        <Link to="/projects" className="hc-card__btn hc-card__btn--primary">View Project</Link>
                        {p.githubUrl && <a href={fmtLink(p.githubUrl)} target="_blank" rel="noopener noreferrer" className="hc-card__btn hc-card__btn--ghost">GitHub</a>}
                        {p.liveUrl && <a href={fmtLink(p.liveUrl)} target="_blank" rel="noopener noreferrer" className="hc-card__btn hc-card__btn--ghost">Live Demo</a>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="hc-arrow hc-arrow--right" onClick={projCar.next} aria-label="Next">›</button>
          </div>

          <CarouselDots count={projects.length} idx={projCar.idx} setIdx={projCar.setIdx} />
        </section>
      )}



      {/* <section className="home-stats-strip">
        <div className="home-stats-strip__inner">
          <div className="home-stat-item">
            <strong>{projects.length || '—'}</strong>
            <span>Projects Built</span>
          </div>
          <div className="home-stat-item">
            <strong>{certs.length || '—'}</strong>
            <span>Certifications</span>
          </div>
          <div className="home-stat-item">
            <strong>{research.length || '—'}</strong>
            <span>Research Papers</span>
          </div>
          <div className="home-stat-item">
            <strong>{books.length || '—'}</strong>
            <span>Publications</span>
          </div>
          <div className="home-stat-item">
            <strong>{experiences.length || '—'}</strong>
            <span>Work Experiences</span>
          </div>
          <div className="home-stat-item">
            <strong>{skills.length || '—'}</strong>
            <span>Technical Skills</span>
          </div>
        </div>
      </section> */}


      <div
        ref={heroRef}
        className="ms-hero-container"
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          width: "100%",
          height: "520px",
          overflow: "hidden",
          borderRadius: "1px",
          background:
            "radial-gradient(circle at center,#eef7ff,#cde8ff,#b4d9ff)",
          backgroundSize: "120% 120%",
          transition: "background-position .2s linear"
        }}
      >

        {
          Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 8 + Math.random() * 10,
                height: 8 + Math.random() * 10,
                borderRadius: "50%",
                background: "rgba(255,255,255,.45)",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: "blur(2px)",
                animation: `float ${6 + i}s ease-in-out infinite`
              }}
            />
          ))
        }

        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            background: "#2F80FF",
            borderRadius: "50%",
            filter: "blur(170px)",
            opacity: .16,
            top: -260,
            right: -200,
            animation: "glow 8s infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "#0078D4",
            filter: "blur(180px)",
            opacity: .14,
            left: "35%",
            top: "25%"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 550,
            height: 550,
            background: "#00B7FF",
            borderRadius: "50%",
            filter: "blur(150px)",
            opacity: .12,
            left: -180,
            bottom: -200,
            animation: "glow 10s infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(255,255,255,.45)",
            backdropFilter: "blur(40px)",
            top: 110,
            left: "40%",
            filter: "blur(2px)"
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,.35)",
            bottom: 120,
            left: 140
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,.35)",
            right: 180,
            bottom: 150
          }}
        />

        <div
          className="hero-card hero-card-mongodb"
          style={{
            ...glassCard,
            left: "8%",
            top: "18%",
            animation: "float 7s ease-in-out infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) rotateX(12deg) rotateY(-12deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiMongodb
            size={62}
            color="#13AA52"
          />

        </div>

        <div
          className="hero-card hero-card-kafka"
          style={{
            ...glassCard,
            left: "28%",
            top: "8%",
            animation: "float 6s ease-in-out infinite",
            animationDelay: ".8s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) rotateY(12deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiApachekafka
            size={60}
            color="#000000"
          />

        </div>

        <div
          className="hero-card hero-card-docker"
          style={{
            ...glassCard,
            right: "25%",
            top: "12%",
            animation: "float 7.5s ease-in-out infinite",
            animationDelay: "1.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) rotateY(-10deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiDocker
            size={62}
            color="#2496ED"
          />

        </div>

        <div
          className="hero-card hero-card-kubernetes"
          style={{
            ...glassCard,
            right: "8%",
            top: "22%",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "1.6s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) rotateX(-12deg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiKubernetes
            size={64}
            color="#326CE5"
          />

        </div>

        <div
          className="hero-center-circle"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(35px)",
            border: "1px solid rgba(255,255,255,.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 35px 80px rgba(0,120,255,.18)"
          }}
        >

          <div
            style={{
              textAlign: "center"
            }}
          >

            <h1
              style={{
                margin: 0,
                fontSize: "70px",
                fontWeight: 800,
                color: "#0078D4"
              }}
            >
              {"</>"}
            </h1>

            <p
              style={{
                marginTop: 8,
                fontSize: 18,
                fontWeight: 600,
                color: "#555"
              }}
            >
              Cloud • DevOps • Full Stack
            </p>

          </div>

        </div>

        <div
          className="hero-card hero-card-typescript"
          style={{
            ...glassCard,
            right: "42%",
            top: "4%",
            width: "110px",
            height: "110px",
            animation: "float 6.8s ease-in-out infinite",
            animationDelay: "1.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-10px) rotateX(10deg) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiTypescript size={58} color="#3178C6" />
        </div>

        <div
          className="hero-card hero-card-github"
          style={{
            ...glassCard,
            left: "42%",
            top: "3%",
            width: "110px",
            height: "110px",
            animation: "float 7.8s ease-in-out infinite",
            animationDelay: ".8s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-10px) rotateY(10deg) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiGithub size={58} color="#181717" />
        </div>

        <div
          className="hero-card hero-card-linux"
          style={{
            ...glassCard,
            right: "12%",
            bottom: "18%",
            width: "130px",
            height: "130px",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-10px) rotateX(-10deg) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiLinux size={70} color="#111" />
        </div>

        <div
          className="hero-card hero-card-nodejs"
          style={{
            ...glassCard,
            right: "28%",
            bottom: "8%",
            width: "125px",
            height: "125px",
            animation: "float 7s ease-in-out infinite",
            animationDelay: "2.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-12px) rotateY(-12deg) scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiNodedotjs size={68} color="#339933" />
        </div>

        <div
          className="hero-card hero-card-react"
          style={{
            ...glassCard,
            left: "28%",
            bottom: "8%",
            width: "125px",
            height: "125px",
            animation: "float 6.5s ease-in-out infinite",
            animationDelay: "1.5s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-10px) rotateY(12deg) scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiReact size={68} color="#61DAFB" />
        </div>
        <div
          className="hero-card hero-card-terraform"
          style={{
            ...glassCard,
            left: "12%",
            bottom: "18%",
            width: "130px",
            height: "130px",
            animation: "float 7.5s ease-in-out infinite",
            animationDelay: "2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "translateY(-12px) rotateX(10deg) rotateY(-10deg) scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          <SiTerraform size={68} color="#7B42BC" />
        </div>

        <div
          className="hero-card hero-card-python"
          style={{
            ...glassCard,
            left: "5%",
            top: "48%",
            animation: "float 8s ease-in-out infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiPython
            size={65}
            color="#3776AB"
          />

        </div>

        <div
          className="hero-card hero-card-java"
          style={{
            ...glassCard,
            right: "5%",
            top: "48%",
            animation: "float 7s ease-in-out infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <FaJava
            size={65}
            color="#ff0000"
          />

        </div>

        <div
          className="hero-card hero-card-git"
          style={{
            ...glassCard,
            left: "40%",
            bottom: "3%",
            animation: "float 7.5s ease-in-out infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiGit
            size={65}
            color="#F05032"
          />

        </div>

        <div
          className="hero-card hero-card-mysql"
          style={{
            ...glassCard,
            right: "40%",
            bottom: "3%",
            animation: "float 8.5s ease-in-out infinite"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px) scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >

          <SiMysql
            size={65}
            color="#00758F"
          />

        </div>


      </div>



      {/* ══════════ TECHNICAL SKILLS ══════════ */}
      {topSkills.length > 0 && (
        <section className="home-skills-section">
          <div className="home-skills-section__inner">
            <div className="home-skills-section__header">
              <div className="home-carousel-section__label" style={{ color: '#0078d4' }}>Stack</div>
              <h2 className="home-skills-section__title">Technical Skills</h2>
              <p className="home-skills-section__sub">React · Node.js · TypeScript · Python · MongoDB · Azure · and more</p>
              <Link to="/skills" className="home-carousel-section__link" style={{ color: '#0078d4' }}>Full skills overview →</Link>
            </div>

            <div className="home-skills-grid">
              {topSkills.map(skill => (
                <div key={skill._id} className="home-skill-card">
                  <div className="home-skill-card__icon">
                    {skill.iconUrl
                      ? <img src={skill.iconUrl} alt={skill.name} loading="lazy" />
                      : <span>{skill.name.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div className="home-skill-card__info">
                    <div className="home-skill-card__topline">
                      <strong>{skill.name}</strong>
                      {/* <span>{clamp(skill.level)}%</span> */}
                    </div>
                    {/* <div className="home-skill-bar">
                      <div className="home-skill-bar__fill" style={{ width: `${clamp(skill.level)}%` }} />
                    </div> */}
                    {skill.category && <p className="home-skill-card__cat">{skill.category.replace(/[-_]/g, ' ')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      <section className="home-stats-strip">
        <div className="home-stats-strip__inner">
          <div className="home-stat-item">
            <strong>{projects.length || '—'}</strong>
            <span>Projects Built</span>
          </div>
          <div className="home-stat-item">
            <strong>{certs.length || '—'}</strong>
            <span>Certifications</span>
          </div>
          <div className="home-stat-item">
            <strong>{research.length || '—'}</strong>
            <span>Research Papers</span>
          </div>
          <div className="home-stat-item">
            <strong>{books.length || '—'}</strong>
            <span>Publications</span>
          </div>
          <div className="home-stat-item">
            <strong>{experiences.length || '—'}</strong>
            <span>Work Experiences</span>
          </div>
          <div className="home-stat-item">
            <strong>{skills.length || '—'}</strong>
            <span>Technical Skills</span>
          </div>
        </div>
      </section>

      {/* ══════════ CERTIFICATES CAROUSEL ══════════ */}
      {certs.length > 0 && (
        <section className="home-carousel-section home-carousel-section--light">
          <div className="home-carousel-section__header">
            <div className="home-carousel-section__label" style={{ color: '#c55a11' }}>Achievements</div>
            <h2 className="home-carousel-section__title" style={{ color: '#1a1a1a' }}>Certifications</h2>
            <p className="home-carousel-section__sub" style={{ color: '#555' }}>Industry-recognised credentials and completed courses.</p>
            <Link to="/certificates" className="home-carousel-section__link" style={{ color: '#c55a11' }}>Browse all certificates →</Link>
          </div>

          <div
            className="home-carousel"
            onMouseEnter={() => certCar.setPaused(true)}
            onMouseLeave={() => certCar.setPaused(false)}
          >
            <button className="hc-arrow hc-arrow--left hc-arrow--dark" onClick={certCar.prev} aria-label="Previous">‹</button>

            <div className="hc-track">
              {certs.map((c, i) => (
                <div
                  key={c._id}
                  className={`hc-slide ${i === certCar.idx ? 'active' : ''}`}
                  aria-hidden={i !== certCar.idx}
                >
                  <div className="hc-card hc-card--light">
                    <div className="hc-card__media">
                      {certImg(c)
                        ? <img src={certImg(c)} alt={c.title} loading="lazy" />
                        : <div className="hc-card__placeholder hc-card__placeholder--light">🏆<span>Certificate</span></div>
                      }
                      {(c.issuer || c.issuingOrganization) && <div className="hc-card__overlay-badge">{c.issuer || c.issuingOrganization}</div>}
                    </div>
                    <div className="hc-card__body">
                      <h3 className="hc-card__title" style={{ color: '#1a1a1a' }}>{c.title}</h3>
                      {(c.issuer || c.issuingOrganization) && <p className="hc-card__text" style={{ color: '#555' }}>Issued by {c.issuer || c.issuingOrganization}</p>}
                      {c.issueDate && <p className="hc-card__meta-text">{new Date(c.issueDate).toLocaleDateString()}</p>}
                      <div className="hc-card__actions">
                        <Link to="/certificates" className="hc-card__btn hc-card__btn--accent">View Certificate</Link>
                        {c.credentialUrl && (
                          <a href={fmtLink(c.credentialUrl)} target="_blank" rel="noopener noreferrer" className="hc-card__btn hc-card__btn--ghost-dark">Verify</a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="hc-arrow hc-arrow--right hc-arrow--dark" onClick={certCar.next} aria-label="Next">›</button>
          </div>

          <CarouselDots count={certs.length} idx={certCar.idx} setIdx={certCar.setIdx} />
        </section>
      )}

      {/* ══════════ RESEARCH CAROUSEL ══════════ */}
      {research.length > 0 && (
        <section className="home-carousel-section home-carousel-section--purple">
          <div className="home-carousel-section__header">
            <div className="home-carousel-section__label" style={{ color: '#c4b5fd' }}>Academic</div>
            <h2 className="home-carousel-section__title">Research &amp; Papers</h2>
            <p className="home-carousel-section__sub">Published work spanning AI, distributed systems, and web engineering.</p>
            <Link to="/research" className="home-carousel-section__link" style={{ color: '#c4b5fd' }}>Read all papers →</Link>
          </div>

          <div
            className="home-carousel"
            onMouseEnter={() => resCar.setPaused(true)}
            onMouseLeave={() => resCar.setPaused(false)}
          >
            <button className="hc-arrow hc-arrow--left" onClick={resCar.prev} aria-label="Previous">‹</button>

            <div className="hc-track">
              {research.map((r, i) => {
                const src = r.journal || r.conference || 'Research';
                return (
                  <div
                    key={r._id}
                    className={`hc-slide ${i === resCar.idx ? 'active' : ''}`}
                    aria-hidden={i !== resCar.idx}
                  >
                    <div className="hc-card">
                      <div className="hc-card__media">
                        {resImg(r)
                          ? <img src={resImg(r)} alt={r.title} loading="lazy" />
                          : <div className="hc-card__placeholder hc-card__placeholder--purple">🔬<span>Research</span></div>
                        }
                        <div className="hc-card__overlay-badge">{src}</div>
                      </div>
                      <div className="hc-card__body">
                        <h3 className="hc-card__title">{r.title}</h3>
                        {r.abstract && <p className="hc-card__text">{r.abstract.slice(0, 160)}{r.abstract.length > 160 ? '…' : ''}</p>}
                        {r.keywords && r.keywords.length > 0 && (
                          <div className="hc-card__chips">
                            {r.keywords.slice(0, 4).map(k => <span key={k} className="hc-chip hc-chip--purple">{k}</span>)}
                          </div>
                        )}
                        <div className="hc-card__actions">
                          <Link to="/research" className="hc-card__btn hc-card__btn--purple">Read Paper</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="hc-arrow hc-arrow--right" onClick={resCar.next} aria-label="Next">›</button>
          </div>

          <CarouselDots count={research.length} idx={resCar.idx} setIdx={resCar.setIdx} />
        </section>
      )}

      {/* ══════════ BOOKS CAROUSEL ══════════ */}
      {books.length > 0 && (
        <section className="home-carousel-section home-carousel-section--light">
          <div className="home-carousel-section__header">
            <div className="home-carousel-section__label" style={{ color: '#107c41' }}>Publications</div>
            <h2 className="home-carousel-section__title" style={{ color: '#1a1a1a' }}>Books &amp; Publications</h2>
            <p className="home-carousel-section__sub" style={{ color: '#555' }}>Academic publications and learning resources.</p>
            <Link to="/books" className="home-carousel-section__link" style={{ color: '#107c41' }}>See all publications →</Link>
          </div>

          <div
            className="home-carousel"
            onMouseEnter={() => bookCar.setPaused(true)}
            onMouseLeave={() => bookCar.setPaused(false)}
          >
            <button className="hc-arrow hc-arrow--left hc-arrow--dark" onClick={bookCar.prev} aria-label="Previous">‹</button>

            <div className="hc-track">
              {books.map((b, i) => (
                <div
                  key={b._id}
                  className={`hc-slide ${i === bookCar.idx ? 'active' : ''}`}
                  aria-hidden={i !== bookCar.idx}
                >
                  <div className="hc-card hc-card--light">
                    <div className="hc-card__media hc-card__media--book">
                      {bookImg(b)
                        ? <img src={bookImg(b)} alt={b.title} loading="lazy" />
                        : <div className="hc-card__placeholder hc-card__placeholder--green">📚<span>Book</span></div>
                      }
                      {b.type && <div className="hc-card__overlay-badge">{b.type.replace(/[-_]/g, ' ')}</div>}
                    </div>
                    <div className="hc-card__body">
                      <h3 className="hc-card__title" style={{ color: '#1a1a1a' }}>{b.title}</h3>
                      {b.authors && b.authors.length > 0 && (
                        <p className="hc-card__meta-text" style={{ color: '#107c41' }}>
                          <strong>Authors:</strong> {b.authors.join(', ')}
                        </p>
                      )}
                      {b.description && <p className="hc-card__text" style={{ color: '#555' }}>{b.description.slice(0, 130)}{b.description.length > 130 ? '…' : ''}</p>}
                      {b.publisher && <p className="hc-card__meta-text"><strong>Publisher:</strong> {b.publisher}</p>}
                      <div className="hc-card__actions">
                        <Link to="/books" className="hc-card__btn hc-card__btn--green">View Book</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="hc-arrow hc-arrow--right hc-arrow--dark" onClick={bookCar.next} aria-label="Next">›</button>
          </div>

          <CarouselDots count={books.length} idx={bookCar.idx} setIdx={bookCar.setIdx} />
        </section>
      )}

      {/* ══════════ EXPERIENCE CAROUSEL ══════════ */}
      {experiences.length > 0 && (
        <section className="home-carousel-section home-carousel-section--dark">
          <div className="home-carousel-section__header">
            <div className="home-carousel-section__label" style={{ color: '#ffb900' }}>Professional</div>
            <h2 className="home-carousel-section__title">Work Experience</h2>
            <p className="home-carousel-section__sub">Roles, internships, and professional contributions.</p>
            <Link to="/experiences" className="home-carousel-section__link" style={{ color: '#ffb900' }}>Full timeline →</Link>
          </div>

          <div
            className="home-carousel"
            onMouseEnter={() => expCar.setPaused(true)}
            onMouseLeave={() => expCar.setPaused(false)}
          >
            <button className="hc-arrow hc-arrow--left" onClick={expCar.prev} aria-label="Previous">‹</button>

            <div className="hc-track">
              {experiences.map((e, i) => (
                <div
                  key={e._id}
                  className={`hc-slide ${i === expCar.idx ? 'active' : ''}`}
                  aria-hidden={i !== expCar.idx}
                >
                  <div className="hc-card">
                    <div className="hc-card__media">
                      {expImg(e)
                        ? <img src={expImg(e)} alt={e.company} loading="lazy" />
                        : <div className="hc-card__placeholder hc-card__placeholder--yellow">💼<span>Experience</span></div>
                      }
                      <div className="hc-card__overlay-badge">{e.isCurrent ? '🟢 Current' : 'Past role'}</div>
                    </div>
                    <div className="hc-card__body">
                      <h3 className="hc-card__title">{e.role}</h3>
                      <p className="hc-card__meta-text" style={{ color: '#ffb900' }}>{e.company}</p>
                      {e.joinDate && (
                        <p className="hc-card__text">
                          {new Date(e.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          {' – '}
                          {e.isCurrent ? 'Present' : (e.endDate ? new Date(e.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present')}
                        </p>
                      )}
                      {e.skills && e.skills.length > 0 && (
                        <div className="hc-card__chips">
                          {e.skills.slice(0, 4).map(s => <span key={s._id} className="hc-chip hc-chip--yellow">{s.name}</span>)}
                        </div>
                      )}
                      <div className="hc-card__actions">
                        <Link to="/experiences" className="hc-card__btn hc-card__btn--yellow">View Experience</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="hc-arrow hc-arrow--right" onClick={expCar.next} aria-label="Next">›</button>
          </div>

          <CarouselDots count={experiences.length} idx={expCar.idx} setIdx={expCar.setIdx} />
        </section>
      )}





      {/* ══════════ PROFILE STRIP ══════════ */}
      {/* <section className="ms-profile-strip">
        <div className="ms-profile-strip__inner">
          <div className="ms-profile-strip__photo">
            {profile?.profileImage
              ? <img src={profile.profileImage} alt={name} />
              : <div className="ms-profile-strip__mono">{name.split(' ').map(p => p[0]).join('').slice(0, 2)}</div>
            }
          </div>
          <div className="ms-profile-strip__copy">
            <p className="ms-profile-strip__eyebrow">About me</p>
            <h2 className="ms-profile-strip__name">{name}</h2>
            <p className="ms-profile-strip__title">{title}</p>
            <p className="ms-profile-strip__bio">{profile?.description ?? bio}</p>
            <div className="ms-profile-strip__links">
              {profileLinks.map(item => (
                <a key={item.label} href={item.href}
                  target={item.label === 'Email' ? undefined : '_blank'}
                  rel={item.label === 'Email' ? undefined : 'noopener noreferrer'}
                  className="ms-pill"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section> */}




      {/* ══════════ CTA BAND ══════════ */}
      <section className="ms-cta-band">
        <div className="ms-cta-band__inner">
          <h2>Ready to collaborate?</h2>
          <p>Open to full-time roles, freelance projects, and research collaborations.</p>
          <div className="ms-cta-band__actions">
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="ms-btn ms-btn--primary">Send an email</a>
            )}
            {profile?.linkedin && (
              <a href={fmtLink(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn--ghost">
                Connect on LinkedIn
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
