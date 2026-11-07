import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const date = new Date(event.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="event-card">
      <img src={event.imageUrl} alt={event.title} className="event-card-image" />
      <div className="event-card-body">
        <span className="pill">{event.category}</span>
        <h3>{event.title}</h3>
        <div className="meta-row">
          <span>{date}</span>
          <span>{event.location}</span>
        </div>
        <p>{event.shortDescription}</p>
        <Link className="secondary-button" to={`/events/${event._id}`}>
          View Details
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
