import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventApi, userApi } from '../services/api';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitState, setSubmitState] = useState('idle');

  const loadRegistrationData = async () => {
    if (!user) return;
    try {
      const response = await userApi.getMyRegistrations();
      setRegisteredIds(response.data.map((item) => item.event?._id).filter(Boolean));
    } catch (error) {
      console.error('Registration fetch failed.', error);
    }
  };

  const refreshEvent = async () => {
    try {
      const response = await eventApi.getById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Unable to fetch event.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvent();
    loadRegistrationData();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (event.availableSeats <= 0 || new Date(event.eventDate) < new Date()) {
      return;
    }

    try {
      setSubmitState('registering');
      await eventApi.register(id);
      await refreshEvent();
      await loadRegistrationData();
      alert('Registration successful!');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitState('idle');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;

    try {
      await eventApi.delete(id);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to delete this event.');
    }
  };

  if (loading) {
    return <div className="container page-loading">Loading event details...</div>;
  }

  if (!event) {
    return <div className="container empty-state">Event not found.</div>;
  }

  const isOwner = user && event.organizer?._id === user._id;
  const isRegistered = registeredIds.includes(event._id);
  const eventDate = new Date(event.eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="container detail-page">
      <img src={event.imageUrl} alt={event.title} className="detail-image" />

      <div className="detail-header">
        <div>
          <span className="pill">{event.category}</span>
          <h1>{event.title}</h1>
        </div>
        <div className="detail-actions">
          {isOwner ? (
            <>
              <Link className="secondary-button" to={`/edit-event/${event._id}`}>
                Edit Event
              </Link>
              <button type="button" className="danger-button" onClick={handleDelete}>
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={handleRegister}
              disabled={submitState === 'registering' || isRegistered || event.availableSeats <= 0 || new Date(event.eventDate) < new Date()}
            >
              {submitState === 'registering'
                ? 'Registering...'
                : isRegistered
                  ? 'Registered'
                  : user
                    ? event.availableSeats <= 0 || new Date(event.eventDate) < new Date()
                      ? 'Registration Closed'
                      : 'Register Now'
                    : 'Register Now'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <p>{event.description}</p>
        </div>

        <aside className="detail-side">
          <div className="info-box">
            <h3>Event Details</h3>
            <ul>
              <li><strong>Date:</strong> {eventDate}</li>
              <li><strong>Time:</strong> {event.eventTime}</li>
              <li><strong>Location:</strong> {event.location}</li>
              <li><strong>Organizer:</strong> {event.organizer?.name || 'EventHub Host'}</li>
              <li><strong>Total Capacity:</strong> {event.capacity}</li>
              <li><strong>Available Seats:</strong> {event.availableSeats}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetailsPage;
