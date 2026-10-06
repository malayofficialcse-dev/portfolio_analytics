import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type QuickLinkItem = {
  _id?: string;
  name: string;
  icon: string;
  text: string;
  link: string;
  order: number;
};

const POPULAR_ICONS = [
  { name: 'GitHub (FaGithub)', value: 'FaGithub' },
  { name: 'LinkedIn (FaLinkedin)', value: 'FaLinkedin' },
  { name: 'Google Scholar (SiGooglescholar)', value: 'SiGooglescholar' },
  { name: 'Research Gate (SiResearchgate)', value: 'SiResearchgate' },
  { name: 'ORCID (SiOrcid)', value: 'SiOrcid' },
  { name: 'DockerHub (FaDocker)', value: 'FaDocker' },
  { name: 'LeetCode (SiLeetcode)', value: 'SiLeetcode' },
  { name: 'GeeksforGeeks (SiGeeksforgeeks)', value: 'SiGeeksforgeeks' },
  { name: 'Website/Globe (FaGlobe)', value: 'FaGlobe' },
  { name: 'Envelope/Email (FaEnvelope)', value: 'FaEnvelope' },
  { name: 'Twitter/X (FaTwitter)', value: 'FaTwitter' },
];

export function QuickLinksAdminPage() {
  useRequireAuth();
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('FaGithub');
  const [customIcon, setCustomIcon] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [order, setOrder] = useState('0');

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/quick-links`);
      setQuickLinks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching quick links', err);
      setError('Failed to fetch quick links.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: QuickLinkItem) => {
    setEditingId(item._id || null);
    setName(item.name);
    
    // Check if the icon is in POPULAR_ICONS
    const isPopular = POPULAR_ICONS.some(pi => pi.value === item.icon);
    if (isPopular) {
      setIcon(item.icon);
      setCustomIcon('');
    } else {
      setIcon('custom');
      setCustomIcon(item.icon);
    }
    
    setText(item.text);
    setLink(item.link);
    setOrder(String(item.order));
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setIcon('FaGithub');
    setCustomIcon('');
    setText('');
    setLink('');
    setOrder('0');
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quick link?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/quick-links/${id}`, getAuthHeaders());
      setSuccess('Quick link deleted successfully.');
      fetchQuickLinks();
    } catch (err: any) {
      console.error('Error deleting quick link', err);
      setError(err.response?.data?.message || 'Failed to delete quick link.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const activeIcon = icon === 'custom' ? customIcon : icon;

    if (!activeIcon) {
      setError('Please provide or select an icon.');
      setSaving(false);
      return;
    }

    const payload = {
      name,
      icon: activeIcon,
      text,
      link,
      order: Number(order) || 0,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/quick-links/${editingId}`, payload, getAuthHeaders());
        setSuccess('Quick link updated successfully.');
      } else {
        await axios.post(`${API_BASE}/quick-links`, payload, getAuthHeaders());
        setSuccess('Quick link created successfully.');
      }
      handleCancel();
      fetchQuickLinks();
    } catch (err: any) {
      console.error('Error saving quick link', err);
      setError(err.response?.data?.message || 'Failed to save quick link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Control Panel</h1>
        <p style={{ color: 'var(--muted)' }}>Manage quick redirection links on home page</p>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          {error && <div className="admin-alert admin-alert-danger">{error}</div>}
          {success && <div className="admin-alert admin-alert-success">{success}</div>}

          {/* Form Card */}
          <div className="admin-card">
            <h2 style={{ marginTop: 0 }}>
              {editingId ? 'Edit Quick Link' : 'Add New Quick Link'}
            </h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="name">Link Name / Title</label>
                  <input
                    type="text"
                    id="name"
                    className="admin-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GitHub"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="order">Display Order</label>
                  <input
                    type="number"
                    id="order"
                    className="admin-input"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    placeholder="e.g. 0"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="icon">React Icon</label>
                  <select
                    id="icon"
                    className="admin-input"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                  >
                    {POPULAR_ICONS.map((pi) => (
                      <option key={pi.value} value={pi.value}>
                        {pi.name}
                      </option>
                    ))}
                    <option value="custom">-- Custom React Icon Name --</option>
                  </select>
                </div>

                {icon === 'custom' && (
                  <div className="admin-form-group">
                    <label htmlFor="customIcon">Custom Icon Component Name</label>
                    <input
                      type="text"
                      id="customIcon"
                      className="admin-input"
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      placeholder="e.g. FaTwitter, SiMedium, etc."
                      required
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="text">Subtitle / Text</label>
                  <input
                    type="text"
                    id="text"
                    className="admin-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. 900+ Contributions"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="link">Redirect URL / Path</label>
                  <input
                    type="text"
                    id="link"
                    className="admin-input"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. https://github.com/username or /projects"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Link' : 'Add Link')}
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
            <h2 style={{ marginTop: 0 }}>Existing Quick Links</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading quick links...</p>
            ) : quickLinks.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No quick links added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Name</th>
                    <th>Icon</th>
                    <th>Subtitle/Text</th>
                    <th>Link Destination</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quickLinks.map((item) => (
                    <tr key={item._id}>
                      <td>{item.order}</td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td><code>{item.icon}</code></td>
                      <td>{item.text}</td>
                      <td style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                        <a href={item.link.startsWith('http') ? item.link : '#'} target="_blank" rel="noopener noreferrer">
                          {item.link}
                        </a>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(item._id!)}
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
