import React, { useMemo, useState } from "react";
import { certificatesData } from "./data/certificatesData";


const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString();
};

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) return `https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net${url}`;
  return url;
};



const Certificates = () => {
  const [certificates] = useState(certificatesData);
  const [loading] = useState(false);

  const visibleCertificates = useMemo(() => certificates ?? [], [certificates]);

  if (loading) {
    return (
      <div className="cert-page cert-page--loading">
        <h2>Loading Certificates...</h2>
      </div>
    );
  }

  return (
    <section className="cert-page">
      <div className="cert-page__shell">
        <header className="cert-page__intro">
          <p className="cert-page__eyebrow">Certificates</p>
          <div className="cert-page__heading-row">
            <div>
              <h1>Certifications & Achievements</h1>
              <p>
                Professional certifications, workshops, publications and
                technical accomplishments earned throughout my academic and
                professional journey.
              </p>
            </div>

            <div className="cert-page__badge">
              <strong>{visibleCertificates.length}</strong>
              <span>Total cards</span>
            </div>
          </div>
        </header>

        <div className="cert-grid">
          {visibleCertificates.map((certificate) => {
            const skills = (certificate.skills ?? [])
              .map((skill) => skill.trim())
              .filter(Boolean)
              .slice(0, 4);

            return (
              <article key={certificate._id} className="cert-card">
                <div className="cert-card__media">
                  <img
                    src={resolveUrl(certificate.imageUrl)}
                    alt={certificate.title}
                    className="cert-card__image"
                    loading="lazy"
                  />
                </div>

                <div className="cert-card__body">
                  <div className="cert-card__topline">
                    <span className="cert-card__tag">Certificate</span>
                    <span className="cert-card__date">
                      {formatDate(certificate.createdAt)}
                    </span>
                  </div>

                  <h2 className="cert-card__title">{certificate.title}</h2>
                  <p className="cert-card__issuer">
                    {certificate.issuingOrganization}
                  </p>

                  {certificate.credentialId && (
                    <p className="cert-card__meta">
                      Credential ID: <span>{certificate.credentialId}</span>
                    </p>
                  )}

                  <div className="cert-card__skills">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span key={skill} className="cert-card__skill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="cert-card__skill cert-card__skill--muted">
                        No skills listed
                      </span>
                    )}
                  </div>

                  <div className="cert-card__actions">
                    {certificate.pdfUrl ? (
                      <a
                        href={resolveUrl(certificate.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cert-card__button cert-card__button--primary"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="cert-card__button cert-card__button--disabled">
                        PDF unavailable
                      </span>
                    )}

                    <a
                      href={resolveUrl(certificate.imageUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-card__button cert-card__button--secondary"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
