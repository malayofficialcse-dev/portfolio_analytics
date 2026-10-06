import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type ExternalLink = {
  url: string;
  label: string;
  logoUrl?: string;
  logoFile?: File;
};

type ResearchPaper = {
  _id?: string;
  title: string;
  authors: string[];
  abstract: string;
  journal?: string;
  conference?: string;
  publicationDate?: string;
  doi?: string;
  pdfUrls?: string[];
  imageUrls?: string[];
  externalLinks: ExternalLink[];
  keywords: string[];
};

export function ResearchAdminPage() {
  useRequireAuth();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [authorsString, setAuthorsString] = useState('');
  const [abstract, setAbstract] = useState('');
  const [journal, setJournal] = useState('');
  const [conference, setConference] = useState('');
  const [pubDate, setPubDate] = useState('');
  const [doi, setDoi] = useState('');
  const [keywordsString, setKeywordsString] = useState('');
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  
  // Files
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);
  const [pdfsFiles, setPdfsFiles] = useState<FileList | null>(null);

  // External link form helpers
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkLogo, setNewLinkLogo] = useState<File | null>(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/research`);
      setPapers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching research papers', err);
      setError('Failed to fetch research papers.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (paper: ResearchPaper) => {
    setEditingId(paper._id || null);
    setTitle(paper.title);
    setAuthorsString(paper.authors.join(', '));
    setAbstract(paper.abstract);
    setJournal(paper.journal || '');
    setConference(paper.conference || '');
    setPubDate(paper.publicationDate ? new Date(paper.publicationDate).toISOString().split('T')[0] : '');
    setDoi(paper.doi || '');
    setKeywordsString(paper.keywords.join(', '));
    setExternalLinks(paper.externalLinks || []);
    // Reset file inputs
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setAuthorsString('');
    setAbstract('');
    setJournal('');
    setConference('');
    setPubDate('');
    setDoi('');
    setKeywordsString('');
    setExternalLinks([]);
    setImagesFiles(null);
    setPdfsFiles(null);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setNewLinkLogo(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/research/${id}`, getAuthHeaders());
      setSuccess('Research paper deleted successfully.');
      fetchPapers();
    } catch (err: any) {
      console.error('Error deleting research paper', err);
      setError(err.response?.data?.message || 'Failed to delete research paper.');
    }
  };

  const handleAddLink = () => {
    if (!newLinkUrl || !newLinkLabel) return;
    const newLink: ExternalLink = {
      url: newLinkUrl,
      label: newLinkLabel
    };
    if (newLinkLogo) {
      newLink.logoFile = newLinkLogo;
    }
    setExternalLinks([...externalLinks, newLink]);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setNewLinkLogo(null);
  };

  const handleRemoveLink = (index: number) => {
    const list = [...externalLinks];
    list.splice(index, 1);
    setExternalLinks(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const authorsArray = authorsString
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const keywordsArray = keywordsString
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('journal', journal);
    formData.append('conference', conference);
    if (pubDate) formData.append('publicationDate', pubDate);
    formData.append('doi', doi);

    authorsArray.forEach((author) => formData.append('authors', author));
    keywordsArray.forEach((keyword) => formData.append('keywords', keyword));

    // Serialize links metadata without logoFile property to prevent circular or size issues
    const linksMetadata = externalLinks.map((link) => ({
      url: link.url,
      label: link.label,
      logoUrl: link.logoUrl
    }));
    formData.append('externalLinks', JSON.stringify(linksMetadata));

    // Append link logos
    externalLinks.forEach((link, idx) => {
      if (link.logoFile) {
        formData.append(`linkLogo_${idx}`, link.logoFile);
      }
    });

    if (imagesFiles) {
      for (let i = 0; i < imagesFiles.length; i++) {
        formData.append('images', imagesFiles[i]);
      }
    }

    if (pdfsFiles) {
      for (let i = 0; i < pdfsFiles.length; i++) {
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
        await axios.put(`${API_BASE}/research/${editingId}`, formData, config);
        setSuccess('Research paper updated successfully.');
      } else {
        await axios.post(`${API_BASE}/research`, formData, config);
        setSuccess('Research paper created successfully.');
      }

      handleCancel();
      fetchPapers();
    } catch (err: any) {
      console.error('Error saving research paper', err);
      setError(err.response?.data?.message || 'Failed to save research paper.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Research Papers Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Research Paper' : 'Add Research Paper'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="title">Paper Title</label>
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
                <label htmlFor="authorsString">Authors (comma-separated)</label>
                <input
                  type="text"
                  id="authorsString"
                  className="admin-input"
                  value={authorsString}
                  onChange={(e) => setAuthorsString(e.target.value)}
                  placeholder="e.g. Malay Maity, John Doe"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="abstract">Abstract</label>
                <textarea
                  id="abstract"
                  className="admin-textarea"
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="journal">Journal Name</label>
                  <input
                    type="text"
                    id="journal"
                    className="admin-input"
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="conference">Conference Name</label>
                  <input
                    type="text"
                    id="conference"
                    className="admin-input"
                    value={conference}
                    onChange={(e) => setConference(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="pubDate">Publication Date</label>
                  <input
                    type="date"
                    id="pubDate"
                    className="admin-input"
                    value={pubDate}
                    onChange={(e) => setPubDate(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="doi">DOI Reference</label>
                  <input
                    type="text"
                    id="doi"
                    className="admin-input"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="e.g. 10.1000/xyz123"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="keywordsString">Keywords (comma-separated)</label>
                <input
                  type="text"
                  id="keywordsString"
                  className="admin-input"
                  value={keywordsString}
                  onChange={(e) => setKeywordsString(e.target.value)}
                  placeholder="e.g. Machine Learning, Cloud Security"
                />
              </div>

              {/* External Links Section */}
              <div style={{ padding: '16px', background: 'var(--panel-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>External Citation Links</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Link Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="e.g. Publisher Site, IEEE Xplore"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Link URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Logo Icon (Optional)</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="image/*"
                      onChange={(e) => setNewLinkLogo(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddLink}>
                    Add Link
                  </button>
                </div>

                {externalLinks.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)' }}>
                    {externalLinks.map((link, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>
                        <strong>{link.label}</strong>: {link.url}
                        {link.logoFile && ' (New logo selected)'}
                        <button
                          type="button"
                          className="admin-btn"
                          style={{ color: '#d32f2f', background: 'none', border: 'none', padding: '0 8px', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => handleRemoveLink(idx)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="images">Upload Figures / Images</label>
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
                  <label htmlFor="pdfs">Upload Paper PDFs</label>
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
                  {saving ? 'Saving...' : (editingId ? 'Update Paper' : 'Add Paper')}
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
            <h2 style={{ marginTop: 0 }}>Existing Research Papers</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading papers...</p>
            ) : papers.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No papers added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Authors</th>
                    <th>Date</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((paper) => (
                    <tr key={paper._id}>
                      <td style={{ fontWeight: 600 }}>{paper.title}</td>
                      <td>{paper.authors.join(', ')}</td>
                      <td>{paper.publicationDate ? new Date(paper.publicationDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(paper)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(paper._id!)}
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
