import { useMemo, useState } from 'react';
import { researchPapersData } from '../../data/researchPapersData';

type ResearchLink = {
  url: string;
  label: string;
  logoUrl?: string;
};

type ResearchPaper = {
  _id: string;
  title: string;
  authors?: string[];
  abstract: string;
  journal?: string;
  conference?: string;
  publicationDate?: string;
  doi?: string;
  pdfUrls?: string[];
  imageUrls?: string[];
  externalLinks?: ResearchLink[];
  keywords?: string[];
  createdAt?: string;
};



const formatDate = (value?: string) => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
};

const formatUrl = (value?: string) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
};



export function ResearchPage() {
  const [papers] = useState<ResearchPaper[]>(researchPapersData as ResearchPaper[]);
  const [loading] = useState(false);
  const [error] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Total papers', value: String(papers.length).padStart(2, '0') },
      { label: 'With PDFs', value: String(papers.filter((paper) => (paper.pdfUrls?.length ?? 0) > 0).length).padStart(2, '0') },
      { label: 'With links', value: String(papers.filter((paper) => (paper.externalLinks?.length ?? 0) > 0).length).padStart(2, '0') },
    ],
    [papers]
  );

  if (loading) {
    return (
      <section className="research-page research-page--loading">
        <h2>Loading research...</h2>
      </section>
    );
  }

  return (
    <section className="research-page">
      <div className="research-page__shell">
        <header className="research-hero">
          <div className="research-hero__copy">
            <p className="research-hero__eyebrow">Research</p>
            <h1>Research Papers & Notes</h1>
            <p className="research-hero__lead">
              A clean, professional overview of research work with the same polished visual language used across the portfolio.
            </p>

            <div className="research-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="research-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="research-hero__panel">
            <div className="research-hero__panel-inner">
              <span className="research-pill">Academic + technical writing</span>
              <strong>Readable, structured, and presentation-friendly.</strong>
              <p>
                Each item shows authors, abstract, source, keywords, links, and downloadable files when available.
              </p>
            </div>
          </div>
        </header>

        {error ? <p className="research-page__error">{error}</p> : null}

        <div className="research-grid">
          {papers.map((paper) => {
            const authors = (paper.authors ?? []).filter(Boolean);
            const keywords = (paper.keywords ?? []).filter(Boolean).slice(0, 6);
            const images = paper.imageUrls ?? [];
            const links = paper.externalLinks ?? [];
            const sourceLabel = paper.journal || paper.conference || 'Unlisted source';

            return (
              <article key={paper._id} className="research-card">
                <div className="research-card__media">
                  {images[0] ? (
                    <img src={images[0]} alt={paper.title} className="research-card__image" loading="lazy" />
                  ) : (
                    <div className="research-card__image research-card__image--empty">Research</div>
                  )}

                  <div className="research-card__overlay">
                    <span className="research-card__badge">{sourceLabel}</span>
                    <span className="research-card__badge research-card__badge--count">
                      {images.length} image{images.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="research-card__body">
                  <div className="research-card__topline">
                    <span className="research-card__date">{formatDate(paper.publicationDate || paper.createdAt)}</span>
                    {paper.doi ? (
                      <span className="research-card__doi">DOI: {paper.doi}</span>
                    ) : null}
                  </div>

                  <h2 className="research-card__title">{paper.title}</h2>

                  {authors.length > 0 ? (
                    <p className="research-card__authors">
                      <strong>Authors:</strong> {authors.join(', ')}
                    </p>
                  ) : null}

                  <p className="research-card__abstract">{paper.abstract}</p>

                  <div className="research-card__chips">
                    {keywords.length > 0 ? (
                      keywords.map((keyword) => (
                        <span key={keyword} className="research-chip">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="research-chip research-chip--muted">No keywords</span>
                    )}
                  </div>

                  <div className="research-card__links">
                    {paper.pdfUrls?.length ? (
                      <a
                        href={formatUrl(paper.pdfUrls[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="research-button research-button--primary"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <span className="research-button research-button--disabled">PDF unavailable</span>
                    )}

                    {links[0] ? (
                      <a
                        href={formatUrl(links[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="research-button research-button--secondary"
                      >
                        {links[0].label}
                      </a>
                    ) : (
                      <span className="research-button research-button--secondary research-button--disabled">
                        External link
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
