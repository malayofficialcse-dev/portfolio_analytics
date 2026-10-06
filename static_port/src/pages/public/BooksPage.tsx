import { useMemo, useState } from 'react';

type PurchaseLink = {
  url: string;
  label: string;
};

type BookItem = {
  _id: string;
  title: string;
  authors?: string[];
  description: string;
  publisher?: string;
  isbn?: string;
  imageUrls?: string[];
  pdfUrls?: string[];
  type?: string;
  purchaseLinks?: PurchaseLink[];
  coverImageUrl?: string;
  createdAt?: string;
};


const formatDate = (value?: string) => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
};

const normalizeUrl = (value?: string) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
};

const typeLabel = (value?: string) => {
  if (!value) return 'Publication';
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

import { booksData } from '../../data/booksData';

export function BooksPage() {
  const [books] = useState<BookItem[]>(booksData as BookItem[]);
  const [loading] = useState(false);
  const [error] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Publications', value: String(books.length).padStart(2, '0') },
      { label: 'With PDFs', value: String(books.filter((book) => (book.pdfUrls?.length ?? 0) > 0).length).padStart(2, '0') },
      { label: 'With stores', value: String(books.filter((book) => (book.purchaseLinks?.length ?? 0) > 0).length).padStart(2, '0') },
    ],
    [books]
  );

  if (loading) {
    return (
      <section className="books-page books-page--loading">
        <h2>Loading books...</h2>
      </section>
    );
  }

  return (
    <section className="books-page">
      <div className="books-page__shell">
        <header className="books-hero">
          <div className="books-hero__copy">
            <p className="books-hero__eyebrow">Books</p>
            <h1>Books & Publications</h1>
            <p className="books-hero__lead">
              A refined publishing showcase with a professional layout for books, chapters, authors, and purchase links.
            </p>

            <div className="books-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="books-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="books-hero__panel">
            <div className="books-hero__panel-inner">
              <span className="books-pill">Academic publishing</span>
              <strong>Structured like a modern portfolio showcase.</strong>
              <p>
                Each entry highlights the cover, authors, publisher, ISBN or DOI, PDFs, and store links in a clean card layout.
              </p>
            </div>
          </div>
        </header>

        {error ? <p className="books-page__error">{error}</p> : null}

        <div className="books-grid">
          {books.map((book) => {
            const authors = (book.authors ?? []).filter(Boolean);
            const images = book.imageUrls ?? [];
            const links = book.purchaseLinks ?? [];
            const cover = book.coverImageUrl || images[0];

            return (
              <article key={book._id} className="book-card">
                <div className="book-card__media">
                  {cover ? (
                    <img src={cover} alt={book.title} className="book-card__image" loading="lazy" />
                  ) : (
                    <div className="book-card__image book-card__image--empty">Book</div>
                  )}

                  <div className="book-card__overlay">
                    <span className="book-card__badge">{typeLabel(book.type)}</span>
                    <span className="book-card__badge book-card__badge--count">
                      {images.length} image{images.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="book-card__body">
                  <div className="book-card__topline">
                    <span className="book-card__date">{formatDate(book.createdAt)}</span>
                    {book.publisher ? <span className="book-card__publisher">{book.publisher}</span> : null}
                  </div>

                  <h2 className="book-card__title">{book.title}</h2>

                  {authors.length > 0 ? (
                    <p className="book-card__authors">
                      <strong>Authors:</strong> {authors.join(', ')}
                    </p>
                  ) : null}

                  <p className="book-card__description">{book.description}</p>

                  <div className="book-card__meta">
                    {book.isbn ? (
                      <div>
                        <span>ISBN / DOI</span>
                        <strong>{book.isbn}</strong>
                      </div>
                    ) : null}

                    <div>
                      <span>Format</span>
                      <strong>{typeLabel(book.type)}</strong>
                    </div>
                  </div>

                  <div className="book-card__links">
                    {book.pdfUrls?.length ? (
                      <a
                        href={normalizeUrl(book.pdfUrls[0])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-button book-button--primary"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <span className="book-button book-button--disabled">PDF unavailable</span>
                    )}

                    {links[0] ? (
                      <a
                        href={normalizeUrl(links[0].url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="book-button book-button--secondary"
                      >
                        {links[0].label}
                      </a>
                    ) : (
                      <span className="book-button book-button--secondary book-button--disabled">
                        Purchase link
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
