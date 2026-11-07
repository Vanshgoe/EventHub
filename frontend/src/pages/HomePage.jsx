import { useEffect, useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import FeaturedEvent from '../components/FeaturedEvent';
import { eventApi } from '../services/api';

const categories = ['All', 'Technology', 'Music', 'Workshops', 'Education', 'Sports', 'Cultural Events'];

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await eventApi.list({ keyword, category: selectedCategory });
      setEvents(response.data);
    } catch (error) {
      console.error('Unable to load events.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [keyword, selectedCategory]);

  const featuredEvent = useMemo(() => events[0], [events]);

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Discover events worth experiencing</p>
          <h1>Discover events worth experiencing.</h1>
          <p className="hero-text">
            Find interesting events, connect with people and create experiences worth remembering.
          </p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title or location"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </section>

      <FeaturedEvent event={featuredEvent} />

      <section className="section-header">
        <div>
          <p className="eyebrow">Upcoming events</p>
          <h2>Explore events</h2>
        </div>
      </section>

      <div className="filter-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? 'chip active' : 'chip'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">No events match your search or filter.</div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
