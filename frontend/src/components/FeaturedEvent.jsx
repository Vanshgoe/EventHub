import { Link } from 'react-router-dom';

const FeaturedEvent = ({ event }) => {
  if (!event) return null;

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section className="featured-event">
      <div className="featured-image-wrap">
        <img src={event.imageUrl} alt={event.title} className="featured-image" />
      </div>
      <div className="featured-content">
        <span className="pill">Featured Event</span>
        <h2>{event.title}</h2>
        <div className="meta-row">
          <span>{formattedDate}</span>
          <span>{event.location}</span>
        </div>
        <p>{event.shortDescription}</p>
        <Link className="primary-button" to={`/events/${event._id}`}>
          View Event
        </Link>
      </div>
    </section>
  );
};

export default FeaturedEvent;
