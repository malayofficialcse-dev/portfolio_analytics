import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type Project = {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrls?: string[];
  pdfUrls?: string[];
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
};

export function ProjectsAdminPage() {
  useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techString, setTechString] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);
  const [pdfsFiles, setPdfsFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`);
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching projects', err);
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project._id || null);
    setTitle(project.title);
    setDescription(project.description);
    setTechString(project.technologies.join(', '));
    setProjectUrl(project.projectUrl || '');
    setGithubUrl(project.githubUrl || '');
    setFeatured(project.featured);
    // Reset file selectors
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setTechString('');
    setProjectUrl('');
    setGithubUrl('');
    setFeatured(false);
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/projects/${id}`, getAuthHeaders());
      setSuccess('Project deleted successfully.');
      fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project', err);
      setError(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const techArray = techString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('projectUrl', projectUrl);
    formData.append('githubUrl', githubUrl);
    formData.append('featured', String(featured));
    
    techArray.forEach((tech) => {
      formData.append('technologies[]', tech);
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
        await axios.put(`${API_BASE}/projects/${editingId}`, formData, config);
        setSuccess('Project updated successfully.');
      } else {
        await axios.post(`${API_BASE}/projects`, formData, config);
        setSuccess('Project created successfully.');
      }

      handleCancel();
      fetchProjects();
    } catch (err: any) {
      console.error('Error saving project', err);
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Projects Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="title">Project Title</label>
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

              <div className="admin-form-group">
                <label htmlFor="techString">Technologies (comma-separated)</label>
                <input
                  type="text"
                  id="techString"
                  className="admin-input"
                  value={techString}
                  onChange={(e) => setTechString(e.target.value)}
                  placeholder="e.g. React, Node.js, MongoDB, TypeScript"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="projectUrl">Live Demo URL</label>
                  <input
                    type="text"
                    id="projectUrl"
                    className="admin-input"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="githubUrl">GitHub Repository URL</label>
                  <input
                    type="text"
                    id="githubUrl"
                    className="admin-input"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="images">Upload Images (Max 50 files)</label>
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
                  <label htmlFor="pdfs">Upload PDFs (Max 20 files)</label>
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

              <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <label htmlFor="featured" style={{ cursor: 'pointer' }}>Feature this project on the homepage</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Project' : 'Create Project')}
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
            <h2 style={{ marginTop: 0 }}>Existing Projects</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading projects...</p>
            ) : projects.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No projects added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Technologies</th>
                    <th>Featured</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr key={proj._id}>
                      <td style={{ fontWeight: 600 }}>{proj.title}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {proj.technologies.map((t, i) => (
                            <span className="admin-badge admin-badge-success" key={i} style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {proj.featured ? (
                          <span className="admin-badge admin-badge-success">Featured</span>
                        ) : (
                          <span className="admin-badge admin-badge-warning" style={{ background: '#f1f1f1', color: '#666' }}>Standard</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(proj)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(proj._id!)}
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
