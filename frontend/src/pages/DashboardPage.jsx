import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [createdResponse, registeredResponse] = await Promise.all([
          userApi.getMyEvents(),
          userApi.getMyRegistrations(),
        ]);

        setCreatedEvents(createdResponse.data);
        setRegisteredEvents(registeredResponse.data);
      } catch (error) {
        console.error('Dashboard load failed.', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (!user) {
    return <div className="container empty-state">Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return <div className="container page-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="container dashboard-page">
      <section className="dashboard-header panel">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user.name}</h1>
        </div>
        <div className="profile-email">{user.email}</div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header inline-header">
            <h2>Events created</h2>
            <Link to="/create-event" className="primary-button small-btn">Create Event</Link>
          </div>
          {createdEvents.length === 0 ? (
            <div className="empty-state small">No events yet.</div>
          ) : (
            <div className="mini-list">
              {createdEvents.map((event) => (
                <div className="mini-item" key={event._id}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.location}</p>
                  </div>
                  <Link to={`/events/${event._id}`}>View</Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header inline-header">
            <h2>Registered events</h2>
          </div>
          {registeredEvents.length === 0 ? (
            <div className="empty-state small">No registrations yet.</div>
          ) : (
            <div className="mini-list">
              {registeredEvents.map((item) => (
                <div className="mini-item" key={item._id}>
                  <div>
                    <strong>{item.event.title}</strong>
                    <p>{item.event.location}</p>
                  </div>
                  <Link to={`/events/${item.event._id}`}>View</Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
