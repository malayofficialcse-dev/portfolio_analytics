import { useEffect, useMemo, useState } from 'react';

type SemesterResult = {
  _id: string;
  semester: string;
  gpa?: number;
  marksheetUrl?: string;
  certificateUrl?: string;
};

type AcademicItem = {
  _id: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  semesterResults?: SemesterResult[];
  imageUrls?: string[];
  logoUrl?: string;
  degreeCertificateUrl?: string;
  registrationCertificateUrl?: string;
  createdAt?: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
};

const normalizeUrl = (value?: string) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `${import.meta.env.VITE_BACKEND_URL || 'https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net'}${value}`;
};

const averageGpa = (items: SemesterResult[]) => {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + (item.gpa ?? 0), 0);
  return total / items.length;
};

function AcademicCarousel({ logoUrl, imageUrls, alt }: { logoUrl?: string; imageUrls?: string[]; alt: string }) {
  const images = useMemo(() => {
    const list: string[] = [];
    if (logoUrl) list.push(logoUrl);
    if (imageUrls) {
      imageUrls.forEach((img) => {
        if (img && img !== logoUrl) {
          list.push(img);
        }
      });
    }
    return list;
  }, [logoUrl, imageUrls]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return <div className="academic-card__image academic-card__image--empty">Academic</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {images.map((img, idx) => (
        <img
          key={img + '-' + idx}
          src={normalizeUrl(img)}
          alt={`${alt} - Image ${idx + 1}`}
          className="academic-card__image"
          style={{
            position: idx === 0 ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: idx === activeIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: idx === activeIndex ? 1 : 0,
          }}
          loading="lazy"
        />
      ))}
      
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '4px 8px',
            borderRadius: '999px',
          }}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                border: 'none',
                padding: 0,
                background: idx === activeIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { academicsData } from '../../data/academicsData';

export function AcademicPage() {
  const [academics] = useState<AcademicItem[]>(academicsData as AcademicItem[]);
  const [loading] = useState(false);
  const [error] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Programs', value: String(academics.length).padStart(2, '0') },
      {
        label: 'Semesters',
        value: String(academics.reduce((count, item) => count + (item.semesterResults?.length ?? 0), 0)).padStart(2, '0'),
      },
      {
        label: 'Average GPA',
        value: academics.length ? averageGpa(academics.flatMap((item) => item.semesterResults ?? [])).toFixed(2) : '0.00',
      },
    ],
    [academics]
  );

  if (loading) {
    return (
      <section className="academics-page academics-page--loading">
        <h2>Loading academics...</h2>
      </section>
    );
  }

  return (
    <section className="academics-page">
      <div className="academics-page__shell">
        <header className="academics-hero">
          <div className="academics-hero__copy">
            <p className="academics-hero__eyebrow">Academic</p>
            <h1>Academic Profile</h1>
            <p className="academics-hero__lead">
              A refined education page with program details, semester performance, supporting documents, and gallery imagery.
            </p>

            <div className="academics-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="academics-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="academics-hero__panel">
            <div className="academics-hero__panel-inner">
              <span className="academics-pill">Education timeline</span>
              <strong>Structured like a modern portfolio case study.</strong>
              <p>
                Semester results, institution identity, date ranges, and media are arranged for clarity and professional presentation.
              </p>
            </div>
          </div>
        </header>

        {error ? <p className="academics-page__error">{error}</p> : null}

        <div className="academics-grid">
          {academics.map((academic) => {
            const semesters = academic.semesterResults ?? [];
            const images = academic.imageUrls ?? [];
            const average = semesters.length ? averageGpa(semesters) : 0;

            const totalImagesCount = (academic.logoUrl ? 1 : 0) + (academic.imageUrls?.length ?? 0);

            return (
              <article key={academic._id} className="academic-card">
                <div className="academic-card__media">
                  <AcademicCarousel logoUrl={academic.logoUrl} imageUrls={academic.imageUrls} alt={academic.institution} />

                  <div className="academic-card__overlay">
                    <span className="academic-card__badge">{academic.degree}</span>
                    <span className="academic-card__badge academic-card__badge--count">
                      {totalImagesCount} image{totalImagesCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="academic-card__body">
                  <div className="academic-card__topline">
                    <span className="academic-card__date">
                      {formatDate(academic.startDate)} - {academic.endDate ? formatDate(academic.endDate) : 'Present'}
                    </span>
                    <span className="academic-card__location">{academic.location}</span>
                  </div>

                  <h2 className="academic-card__title">{academic.institution}</h2>
                  <p className="academic-card__major">{academic.degree} - {academic.major}</p>
                  <p className="academic-card__description">{academic.description}</p>

                  <div className="academic-card__metrics">
                    <div>
                      <span>Average GPA</span>
                      <strong>{average.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>Semesters</span>
                      <strong>{String(semesters.length).padStart(2, '0')}</strong>
                    </div>
                    <div>
                      <span>Duration</span>
                      <strong>{academic.endDate ? 'Completed' : 'In progress'}</strong>
                    </div>
                  </div>

                  <div className="academic-card__semester-list">
                    {semesters.map((semester) => (
                      <div key={semester._id} className="academic-semester">
                        <div className="academic-semester__top">
                          <strong>{semester.semester}</strong>
                          <span>{semester.gpa?.toFixed(2) ?? '0.00'} GPA</span>
                        </div>
                        <div className="academic-semester__bar">
                          <span style={{ width: `${Math.min(100, (semester.gpa ?? 0) / 10 * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="academic-card__links">
                    {academic.degreeCertificateUrl ? (
                      <a
                        href={normalizeUrl(academic.degreeCertificateUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="academic-button academic-button--primary"
                      >
                        Degree Certificate
                      </a>
                    ) : (
                      <span className="academic-button academic-button--disabled">Degree certificate</span>
                    )}

                    {academic.registrationCertificateUrl ? (
                      <a
                        href={normalizeUrl(academic.registrationCertificateUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="academic-button academic-button--secondary"
                      >
                        Registration Copy
                      </a>
                    ) : (
                      <span className="academic-button academic-button--secondary academic-button--disabled">
                        Registration copy
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
