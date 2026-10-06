import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type EventItem = {
  _id?: string;
  name: string;
  type: string;
  description: string;
  location: string;
  date: string;
  skills: string[];
  certificateUrls?: string[];
  imageUrls?: string[];
};

export function EventsAdminPage() {
  useRequireAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [skillsString, setSkillsString] = useState('');

  // Files
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);
  const [pdfsFiles, setPdfsFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events`);
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching events', err);
      setError('Failed to fetch events list.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (eventItem: EventItem) => {
    setEditingId(eventItem._id || null);
    setName(eventItem.name);
    setEventType(eventItem.type);
    setDescription(eventItem.description);
    setLocation(eventItem.location);
    setDate(eventItem.date ? new Date(eventItem.date).toISOString().split('T')[0] : '');
    setSkillsString(eventItem.skills.join(', '));
    // Reset file inputs
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setEventType('');
    setDescription('');
    setLocation('');
    setDate('');
    setSkillsString('');
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/events/${id}`, getAuthHeaders());
      setSuccess('Event deleted successfully.');
      fetchEvents();
    } catch (err: any) {
      console.error('Error deleting event', err);
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const skillsArray = skillsString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', eventType);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', date);
    
    skillsArray.forEach((skill) => formData.append('skills', skill));

    if (imagesFiles) {
      for (let i = 0; i < imagesFiles.length; i++) {
        formData.append('images', imagesFiles[i]); // backend uploads these to Cloudinary
      }
    }

    if (pdfsFiles) {
      for (let i = 0; i < pdfsFiles.length; i++) {
        // certificateUrls multiple PDFs
        formData.append('pdfs', pdfsFiles[i]);
      }
    }

    try {
      const headersConfig = getAuthHeaders();
      const config = {
        headers: {
          ...headersConfig.headers,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${API_BASE}/events/${editingId}`, formData, config);
        setSuccess('Event updated successfully.');
      } else {
        await axios.post(`${API_BASE}/events`, formData, config);
        setSuccess('Event created successfully.');
      }

      handleCancel();
      fetchEvents();
    } catch (err: any) {
      console.error('Error saving event', err);
      setError(err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Events Editor</h1>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          {error && (
            <div style={{ padding: '12px', background: '#fdf2f2', color: '#b42318', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', background: '#e6f4ea', color: '#137333', borderRadius: '4px', marginBottom: '20px', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          {/* Form Card */}
          <div className="admin-card" style={{ marginBottom: '30px' }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="name">Event Name</label>
                  <input
                    type="text"
                    id="name"
                    className="admin-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="eventType">Event Type</label>
                  <input
                    type="text"
                    id="eventType"
                    className="admin-input"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="e.g. Hackathon, Workshop, Seminar"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="admin-textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    className="admin-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Online, New Delhi, India"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    className="admin-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="skillsString">Associated Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skillsString"
                  className="admin-input"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="e.g. Web Development, Cloud Computing"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="images">Upload Event Images / Photos</label>
                  <input
                    type="file"
                    id="images"
                    className="admin-input"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImagesFiles(e.target.files)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="pdfs">Upload Event Certificates (PDFs)</label>
                  <input
                    type="file"
                    id="pdfs"
                    className="admin-input"
                    multiple
                    accept="application/pdf"
                    onChange={(e) => setPdfsFiles(e.target.files)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Event' : 'Add Event')}
                </button>
                {editingId && (
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Card */}
          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>Existing Events</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading events...</p>
            ) : events.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No events added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((eventItem) => (
                    <tr key={eventItem._id}>
                      <td style={{ fontWeight: 600 }}>{eventItem.name}</td>
                      <td>
                        <span className="admin-badge admin-badge-success" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                          {eventItem.type}
                        </span>
                      </td>
                      <td>{eventItem.date ? new Date(eventItem.date).toLocaleDateString() : 'N/A'}</td>
                      <td>{eventItem.location}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(eventItem)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(eventItem._id!)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
