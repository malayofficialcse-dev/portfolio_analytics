import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type Certificate = {
  _id?: string;
  title: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  pdfUrl?: string;
  description?: string;
  skills: string[];
};

export function CertificatesAdminPage() {
  useRequireAuth();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [description, setDescription] = useState('');
  const [skillsString, setSkillsString] = useState('');

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/certificates`);
      setCerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching certificates', err);
      setError('Failed to fetch certificates.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert._id || null);
    setTitle(cert.title);
    setIssuer(cert.issuingOrganization);
    setIssueDate(cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '');
    setExpiryDate(cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '');
    setCredentialId(cert.credentialId || '');
    setCredentialUrl(cert.credentialUrl || '');
    setDescription(cert.description || '');
    setSkillsString(cert.skills ? cert.skills.join(', ') : '');
    // Reset file selections
    setImageFile(null);
    setPdfFile(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setIssuer('');
    setIssueDate('');
    setExpiryDate('');
    setCredentialId('');
    setCredentialUrl('');
    setDescription('');
    setSkillsString('');
    setImageFile(null);
    setPdfFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/certificates/${id}`, getAuthHeaders());
      setSuccess('Certificate deleted successfully.');
      fetchCertificates();
    } catch (err: any) {
      console.error('Error deleting certificate', err);
      setError(err.response?.data?.message || 'Failed to delete certificate.');
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
    formData.append('title', title);
    formData.append('issuingOrganization', issuer);
    if (issueDate) formData.append('issueDate', issueDate);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    formData.append('credentialId', credentialId);
    formData.append('credentialUrl', credentialUrl);
    formData.append('description', description);

    skillsArray.forEach((skill) => formData.append('skills', skill));

    if (imageFile) {
      formData.append('imageUrl', imageFile);
    }

    if (pdfFile) {
      formData.append('pdfUrl', pdfFile);
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
        await axios.put(`${API_BASE}/certificates/${editingId}`, formData, config);
        setSuccess('Certificate updated successfully.');
      } else {
        await axios.post(`${API_BASE}/certificates`, formData, config);
        setSuccess('Certificate added successfully.');
      }

      handleCancel();
      fetchCertificates();
    } catch (err: any) {
      console.error('Error saving certificate', err);
      setError(err.response?.data?.message || 'Failed to save certificate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Certificates Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Certificate' : 'Add New Certificate'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="title">Certificate Title</label>
                  <input
                    type="text"
                    id="title"
                    className="admin-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="issuer">Issuing Organization</label>
                  <input
                    type="text"
                    id="issuer"
                    className="admin-input"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  className="admin-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="issueDate">Issue Date</label>
                  <input
                    type="date"
                    id="issueDate"
                    className="admin-input"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="expiryDate">Expiry Date (If applicable)</label>
                  <input
                    type="date"
                    id="expiryDate"
                    className="admin-input"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="credentialId">Credential ID</label>
                  <input
                    type="text"
                    id="credentialId"
                    className="admin-input"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="credentialUrl">Credential URL</label>
                  <input
                    type="text"
                    id="credentialUrl"
                    className="admin-input"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="skillsString">Skills Covered (comma-separated)</label>
                <input
                  type="text"
                  id="skillsString"
                  className="admin-input"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="e.g. AWS, React, Python"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="imageUrl">Certificate Image (JPG/PNG)</label>
                  <input
                    type="file"
                    id="imageUrl"
                    className="admin-input"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="pdfUrl">Certificate PDF Document</label>
                  <input
                    type="file"
                    id="pdfUrl"
                    className="admin-input"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Certificate' : 'Add Certificate')}
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
            <h2 style={{ marginTop: 0 }}>Existing Certificates</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading certificates...</p>
            ) : certs.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No certificates added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Issuer</th>
                    <th>Issue Date</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((cert) => (
                    <tr key={cert._id}>
                      <td style={{ fontWeight: 600 }}>{cert.title}</td>
                      <td>{cert.issuingOrganization}</td>
                      <td>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(cert)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(cert._id!)}
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
