import { PageShell } from '@/components/PageShell';
import type { PageContent } from '@/data/siteData';

type SectionPageProps = {
  page: PageContent;
};

export function SectionPage({ page }: SectionPageProps) {
  return (
    <PageShell eyebrow={page.eyebrow} title={page.title} summary={page.summary} statLine={page.statLine}>
      {page.stats ? (
        <div className="stats-row">
          {page.stats.map((stat) => (
            <div className="stat-card" key={`${stat.label}-${stat.value}`}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {page.cards ? (
        <div className="card-grid">
          {page.cards.map((card) => (
            <article className="card" key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="note-box">
        <strong>Simple by design.</strong>
        <p>
          This page keeps spacing, borders, and typography consistent so the portfolio feels professional instead of busy.
        </p>
      </div>
    </PageShell>
  );
}
