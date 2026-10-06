import { useEffect, useMemo, useState } from 'react';

type EventItem = {
  _id: string;
  name: string;
  type?: string;
  description: string;
  location?: string;
  date?: string;
  skills?: string[];
  certificateUrls?: string[];
  imageUrls?: string[];
  createdAt?: string;
};



const formatDate = (value?: string) => {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not available' : date.toLocaleDateString();
};

const normalizeUrl = (value?: string) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://mmport-b2fzejc8h9cwfffb.centralindia-01.azurewebsites.net${value}`;
};

const carouselDelay = 3000;

const EventCard = ({ event }: { event: EventItem }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = useMemo(
    () => (event.imageUrls ?? []).map((url) => normalizeUrl(url)).filter(Boolean),
    [event.imageUrls]
  );

  useEffect(() => {
    setActiveImageIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (!images.length) return undefined;
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, carouselDelay);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const activeImage = images[activeImageIndex];

  return (
    <article className="event-card">
      <div className="event-card__media">
        {activeImage ? (
          <img src={activeImage} alt={event.name} className="event-card__image" loading="lazy" />
        ) : (
          <div className="event-card__image event-card__image--empty">Events</div>
        )}

        <div className="event-card__overlay">
          <span className="event-card__badge">{event.type?.trim() || 'Event'}</span>
          <span className="event-card__badge event-card__badge--count">
            {(images.length ?? 0)} image{images.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="event-card__body">
        <div className="event-card__topline">
          <span className="event-card__date">{formatDate(event.date || event.createdAt)}</span>
          {event.location ? <span className="event-card__location">{event.location}</span> : null}
        </div>

        <h2 className="event-card__title">{event.name}</h2>
        <p className="event-card__description">{event.description}</p>

        <div className="event-card__chips">
          {(event.skills ?? []).length > 0 ? (
            event.skills!.map((skill) => (
              <span key={skill} className="event-chip">
                {skill}
              </span>
            ))
          ) : (
            <span className="event-chip event-chip--muted">No skills listed</span>
          )}
        </div>

        {images.length > 0 ? (
          <div className="event-card__gallery">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`event-gallery-thumb ${index === activeImageIndex ? 'event-gallery-thumb--active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={image} alt={`${event.name} preview ${index + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="event-card__links">
          {event.certificateUrls?.length ? (
            <a
              href={normalizeUrl(event.certificateUrls[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="event-button event-button--primary"
            >
              View Certificate
            </a>
          ) : (
            <span className="event-button event-button--disabled">Certificate unavailable</span>
          )}

          <span className="event-button event-button--secondary">{activeImage ? 'Carousel active' : 'No carousel image'}</span>
        </div>
      </div>
    </article>
  );
};

import { eventsData } from '../../data/eventsData';

export function EventsPage() {
  const [events] = useState<EventItem[]>(eventsData as EventItem[]);
  const [loading] = useState(false);
  const [error] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Events', value: String(events.length).padStart(2, '0') },
      { label: 'Certificates', value: String(events.reduce((count, item) => count + (item.certificateUrls?.length ?? 0), 0)).padStart(2, '0') },
      { label: 'Skills', value: String(events.reduce((count, item) => count + (item.skills?.length ?? 0), 0)).padStart(2, '0') },
    ],
    [events]
  );

  if (loading) {
    return (
      <section className="events-page events-page--loading">
        <h2>Loading events...</h2>
      </section>
    );
  }

  const previewEvent = events[0];

  return (
    <section className="events-page">
      <div className="events-page__shell">
        <header className="events-hero">
          <div className="events-hero__copy">
            <p className="events-hero__eyebrow">Events</p>
            <h1>Events & Highlights</h1>
            <p className="events-hero__lead">
              A clean showcase of hackathons, meetups, and public moments with an auto-rotating image carousel every 3 seconds.
            </p>

            <div className="events-hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="events-stat">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="events-hero__panel">
            <div className="events-hero__panel-inner">
              <span className="events-pill">Carousel preview</span>
              <strong>{previewEvent?.name || 'No events available'}</strong>
              <p>{previewEvent?.description || 'Event details will appear here.'}</p>
            </div>
          </div>
        </header>

        {error ? <p className="events-page__error">{error}</p> : null}

        <div className="events-page__list">
          {events.length > 0 ? (
            events.map((event) => <EventCard key={event._id} event={event} />)
          ) : (
            <p className="events-page__empty">No events available.</p>
          )}
        </div>
      </div>
    </section>
  );
}
