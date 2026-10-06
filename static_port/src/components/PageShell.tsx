import type { ReactNode } from 'react';

type PageShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  statLine?: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, summary, statLine, children }: PageShellProps) {
  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{summary}</p>
        {statLine ? <p className="stat-line">{statLine}</p> : null}
      </div>
      {children}
    </section>
  );
}
