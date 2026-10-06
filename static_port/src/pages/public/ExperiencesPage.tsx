import { useEffect, useMemo, useState } from 'react';

type ExperienceSkill = {
  _id: string;
  name: string;
  iconUrl?: string;
};

type ExperienceItem = {
  _id: string;
  company: string;
  role: string;
  joinDate: string;
  endDate?: string;
  isCurrent?: boolean;
  documentUrls?: string[];
  skills?: ExperienceSkill[];
  projects?: Array<unknown>;
  imageUrls?: string[];
  createdAt?: string;
};



const formatDate = (value?: string) => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
};

const API_BASE = 'https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net';

const formatShortMonth = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const normalizeUrl = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${API_BASE}${value}`;
};

const getDuration = (joinDate?: string, endDate?: string, current?: boolean) => {
  if (!joinDate) return '';
  const start = new Date(joinDate);
  const end = current || !endDate ? new Date() : new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months <= 0) return 'Less than 1 month';
  if (months === 1) return '1 month';
  return `${months} months`;
};

const ExperienceCard = ({ experience }: { experience: ExperienceItem }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = useMemo(
    () => (experience.imageUrls ?? []).map((img) => normalizeUrl(img)).filter(Boolean),
    [experience.imageUrls]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const image = images[activeIndex];
  const skills = (experience.skills ?? []).filter(Boolean);
  const docs = experience.documentUrls ?? [];
  const duration = getDuration(experience.joinDate, experience.endDate, experience.isCurrent);

  return (
    <article key={experience._id} className="experience-card">
      <div className="experience-card__media">
        {image ? (
          <>
            <img src={image} alt={experience.company} className="experience-card__image" loading="lazy" />
            {images.length > 1 ? (
              <div className="experience-card__carousel-indicators">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`experience-card__carousel-dot ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="experience-card__image experience-card__image--empty">Experience</div>
        )}

        <div className="experience-card__overlay">
          <span className="experience-card__badge">{experience.isCurrent ? 'Current role' : 'Past role'}</span>
          <span className="experience-card__badge experience-card__badge--count">
            {skills.length} skill{skills.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="experience-card__body">
        <div className="experience-card__topline">
          <span className="experience-card__date">
            {formatShortMonth(experience.joinDate)} {experience.endDate || experience.isCurrent ? ` - ${experience.isCurrent ? 'Present' : formatShortMonth(experience.endDate)}` : ''}
          </span>
          {duration ? <span className="experience-card__duration">{duration}</span> : null}
        </div>

        <h2 className="experience-card__role">{experience.role}</h2>
        <p className="experience-card__company">{experience.company.trim()}</p>
        <p className="experience-card__summary">
          {experience.isCurrent
            ? 'Current position with ongoing responsibilities and active delivery.'
            : 'Completed role with documented experience and project deliverables.'}
        </p>

        <div className="experience-card__skills">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <span key={skill._id} className="experience-chip">
                {skill.iconUrl ? (
                  <img src={normalizeUrl(skill.iconUrl)} alt={skill.name} />
                ) : null}
                {skill.name.trim()}
              </span>
            ))
          ) : (
            <span className="experience-chip experience-chip--muted">No skills listed</span>
          )}
        </div>

        <div className="experience-card__meta">
          <div>
            <span>Started</span>
            <strong>{formatDate(experience.joinDate)}</strong>
          </div>
          <div>
            <span>Ended</span>
            <strong>{experience.isCurrent ? 'Present' : formatDate(experience.endDate)}</strong>
          </div>
          <div>
            <span>Projects</span>
            <strong>{String(experience.projects?.length ?? 0).padStart(2, '0')}</strong>
          </div>
        </div>

        <div className="experience-card__links">
          {docs[0] ? (
            <a
              href={normalizeUrl(docs[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="experience-button experience-button--primary"
            >
              Open Document
            </a>
          ) : (
            <span className="experience-button experience-button--disabled">No document</span>
          )}

          {docs[1] ? (
            <a
              href={normalizeUrl(docs[1])}
              target="_blank"
              rel="noopener noreferrer"
              className="experience-button experience-button--secondary"
            >
              View More
            </a>
          ) : (
            <span className="experience-button experience-button--secondary experience-button--disabled">
              Additional file
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

import { experiencesData } from '../../data/experiencesData';

export function ExperiencesPage() {
  const [experiences] = useState<ExperienceItem[]>(experiencesData as ExperienceItem[]);
  const [loading] = useState(false);
  const [error] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Roles', value: String(experiences.length).padStart(2, '0') },
      { label: 'Current', value: String(experiences.filter((item) => item.isCurrent).length).padStart(2, '0') },
      {
        label: 'Docs',
        value: String(experiences.reduce((count, item) => count + (item.documentUrls?.length ?? 0), 0)).padStart(2, '0'),
      },
    ],
    [experiences]
  );

  if (loading) {
    return (
      <section className="experiences-page experiences-page--loading">
        <h2>Loading experiences...</h2>
      </section>
    );
  }

  return (
    <section className="experiences-page">
      <div className="experiences-page__shell">
        <header className="experiences-hero">
          <div className="experiences-hero__copy">
            <p className="experiences-hero__eyebrow">Experiences</p>
            <h1>Work Experience & Internships</h1>
            <p className="experiences-hero__lead">
              A refined professional timeline that highlights roles, dates, core skills, documents, and project context in a clear card layout.
            </p>

            <div className="experiences-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="experiences-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="experiences-hero__panel">
            <div className="experiences-hero__panel-inner">
              <span className="experiences-pill">Professional timeline</span>
              <strong>Simple, structured, and easy to scan.</strong>
              <p>
                Every role shows dates, duration, skills, supporting documents, and visual emphasis for the current position.
              </p>
            </div>
          </div>
        </header>

        {error ? <p className="experiences-page__error">{error}</p> : null}

        <div className="experiences-grid">
          {experiences.map((experience) => (
            <ExperienceCard key={experience._id} experience={experience} />
          ))}
        </div>
      </div>
    </section>
  );
}
