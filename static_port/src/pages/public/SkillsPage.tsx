import { useMemo, useState } from 'react';
import { skillsData as rawSkillsData } from '../../data/skillsData';

type CommunicationSkill = {
  _id: string;
  language: string;
  level: number;
  readLevel?: number;
  writeLevel?: number;
  speakLevel?: number;
};

type TechnicalSkill = {
  _id: string;
  name: string;
  level: number;
  category?: string;
  iconUrl?: string;
};

type TheoreticalSkill = {
  _id: string;
  name: string;
  level: number;
  category?: string;
  iconUrl?: string;
};

type SkillsRecord = {
  _id: string;
  communicationSkills?: CommunicationSkill[];
  technicalSkills?: TechnicalSkill[];
  theoreticalSkills?: TheoreticalSkill[];
  createdAt?: string;
  updatedAt?: string;
};



const clamp = (value: number) => Math.max(0, Math.min(100, value));

const formatCount = (count: number) => String(count).padStart(2, '0');

const categoryLabel = (value?: string) => {
  if (!value) return 'General';
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};



export function SkillsPage() {
  const [skillsData] = useState<SkillsRecord | null>((rawSkillsData?.[0] as SkillsRecord) ?? null);
  const [loading] = useState(false);
  const [error] = useState('');

  const communicationSkills = skillsData?.communicationSkills ?? [];
  const technicalSkills = skillsData?.technicalSkills ?? [];
  const theoreticalSkills = skillsData?.theoreticalSkills ?? [];

  const summaryStats = useMemo(
    () => [
      { label: 'Communication', value: formatCount(communicationSkills.length) },
      { label: 'Technical', value: formatCount(technicalSkills.length) },
      { label: 'Theoretical', value: formatCount(theoreticalSkills.length) },
    ],
    [communicationSkills.length, technicalSkills.length, theoreticalSkills.length]
  );

  const sortedTechnical = [...technicalSkills].sort((a, b) => b.level - a.level);
  const sortedTheoretical = [...theoreticalSkills].sort((a, b) => b.level - a.level);

  if (loading) {
    return (
      <section className="skills-page skills-page--loading">
        <h2>Loading skills...</h2>
      </section>
    );
  }

  return (
    <section className="skills-page">
      <div className="skills-page__shell">
        <header className="skills-hero">
          <div className="skills-hero__copy">
            <p className="skills-hero__eyebrow">Skills</p>
            <h1>Professional Skills Overview</h1>
            <p className="skills-hero__lead">
              A polished breakdown of communication, technical, and theoretical skills presented in a clean, Microsoft-style layout.
            </p>

            <div className="skills-hero__stats">
              {summaryStats.map((stat) => (
                <div key={stat.label} className="skills-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="skills-hero__panel">
            <div className="skills-hero__panel-inner">
              <span className="skills-pill">Built for full-stack work</span>
              <strong>Readable, measurable, and easy to scan.</strong>
              <p>
                Each skill item shows progress, category context, and visual hierarchy so the page feels professional rather than crowded.
              </p>
            </div>
          </div>
        </header>

        {error ? <p className="skills-page__error">{error}</p> : null}

        <div className="skills-section">
          <div className="skills-section__header">
            <h2>Communication Skills</h2>
            <p>Language and communication confidence at a glance.</p>
          </div>

          <div className="skills-comm-grid">
            {communicationSkills.map((item) => (
              <article key={item._id} className="skills-comm-card">
                <div className="skills-comm-card__topline">
                  <strong>{item.language}</strong>
                  <span>{clamp(item.level)}%</span>
                </div>

                <div className="skills-progress">
                  <span style={{ width: `${clamp(item.level)}%` }} />
                </div>

                <div className="skills-comm-card__metrics">
                  <div>
                    <span>Read</span>
                    <strong>{clamp(item.readLevel ?? item.level)}%</strong>
                  </div>
                  <div>
                    <span>Write</span>
                    <strong>{clamp(item.writeLevel ?? item.level)}%</strong>
                  </div>
                  <div>
                    <span>Speak</span>
                    <strong>{clamp(item.speakLevel ?? item.level)}%</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="skills-grid">
          <section className="skills-card skills-card--featured">
            <div className="skills-section__header">
              <h2>Technical Skills</h2>
              <p>Stack, tools, and implementation strengths.</p>
            </div>

            <div className="skills-technical-list">
              {sortedTechnical.length > 0 ? (
                sortedTechnical.map((item) => (
                  <article key={item._id} className="skills-tech-row">
                    <div className="skills-tech-row__icon">
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.name} loading="lazy" />
                      ) : (
                        <span>{item.name.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="skills-tech-row__content">
                      <div className="skills-tech-row__title">
                        <strong>{item.name.trim()}</strong>
                        <span>{categoryLabel(item.category)}</span>
                      </div>

                      <div className="skills-progress skills-progress--small">
                        <span style={{ width: `${clamp(item.level)}%` }} />
                      </div>
                    </div>

                    <div className="skills-tech-row__score">{clamp(item.level)}%</div>
                  </article>
                ))
              ) : (
                <p className="skills-empty">No technical skills available.</p>
              )}
            </div>
          </section>

          <section className="skills-card">
            <div className="skills-section__header">
              <h2>Theoretical Skills</h2>
              <p>Core computer science and engineering fundamentals.</p>
            </div>

            <div className="skills-theory-grid">
              {sortedTheoretical.length > 0 ? (
                sortedTheoretical.map((item) => (
                  <article key={item._id} className="skills-theory-card">
                    <div className="skills-theory-card__top">
                      <div className="skills-theory-card__icon">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.name} loading="lazy" />
                        ) : (
                          <span>{item.name.slice(0, 1).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong>{item.name.trim()}</strong>
                        <span>{categoryLabel(item.category)}</span>
                      </div>
                    </div>

                    <div className="skills-progress">
                      <span style={{ width: `${clamp(item.level)}%` }} />
                    </div>
                    <p>{clamp(item.level)}% proficiency</p>
                  </article>
                ))
              ) : (
                <p className="skills-empty">No theoretical skills available.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
