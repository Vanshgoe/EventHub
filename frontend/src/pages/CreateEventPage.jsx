import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventApi } from '../services/api';

const emptyForm = {
  title: '',
  shortDescription: '',
  description: '',
  eventDate: '',
  eventTime: '',
  location: '',
  category: 'Technology',
  imageUrl: '',
  capacity: '',
};

const CreateEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const response = await eventApi.getById(id);
        const event = response.data;
        setFormData({
          title: event.title,
          shortDescription: event.shortDescription,
          description: event.description,
          eventDate: new Date(event.eventDate).toISOString().split('T')[0],
          eventTime: event.eventTime,
          location: event.location,
          category: event.category,
          imageUrl: event.imageUrl,
          capacity: event.capacity,
        });
      } catch (error) {
        alert(error.response?.data?.message || 'Unable to load event.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (isEdit) {
        await eventApi.update(id, payload);
        alert('Event updated successfully.');
      } else {
        const response = await eventApi.create(payload);
        alert('Event published successfully.');
        navigate(`/events/${response.data._id}`);
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container page-loading">Loading your event...</div>;
  }

  return (
    <div className="container form-shell">
      <div className="panel">
        <div className="panel-header">
          <p className="eyebrow">{isEdit ? 'Edit Event' : 'Create Event'}</p>
          <h1>{isEdit ? 'Update your event' : 'Publish your event'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-grid">
            <label>
              Event title
              <input name="title" value={formData.title} onChange={handleChange} required />
            </label>
            <label>
              Category
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Workshops">Workshops</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
                <option value="Cultural Events">Cultural Events</option>
              </select>
            </label>
            <label className="full-width">
              Short description
              <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} required rows="3" />
            </label>
            <label className="full-width">
              Full description
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" />
            </label>
            <label>
              Event date
              <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
            </label>
            <label>
              Event time
              <input type="text" name="eventTime" value={formData.eventTime} onChange={handleChange} required />
            </label>
            <label>
              Venue / location
              <input name="location" value={formData.location} onChange={handleChange} required />
            </label>
            <label>
              Maximum capacity
              <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} required />
            </label>
            <label className="full-width">
              Event poster URL
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save Changes' : 'Publish Event'}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
