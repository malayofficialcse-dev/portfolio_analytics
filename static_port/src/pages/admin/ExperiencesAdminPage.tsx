import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type ExpProject = {
  title: string;
  description: string;
  githubLink?: string;
  deployedLink?: string;
  images: string[];
  imageFiles?: FileList; // temp local reference
};

type ExpSkill = {
  name: string;
  iconUrl?: string;
  iconFile?: File; // temp local reference
};

type Experience = {
  _id?: string;
  company: string;
  role: string;
  joinDate: string;
  endDate?: string;
  isCurrent: boolean;
  documentUrls?: string[];
  stipend?: string;
  skills: ExpSkill[];
  projects: ExpProject[];
  imageUrls?: string[];
};

export function ExperiencesAdminPage() {
  useRequireAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [stipend, setStipend] = useState('');

  // Complex sub-arrays
  const [skills, setSkills] = useState<ExpSkill[]>([]);
  const [projects, setProjects] = useState<ExpProject[]>([]);

  // Main files
  const [mainImagesFiles, setMainImagesFiles] = useState<FileList | null>(null);
  const [documentsFiles, setDocumentsFiles] = useState<FileList | null>(null);

  // Quick Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillIcon, setNewSkillIcon] = useState<File | null>(null);

  // Quick Project form state
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjGit, setNewProjGit] = useState('');
  const [newProjDep, setNewProjDep] = useState('');
  const [newProjImages, setNewProjImages] = useState<FileList | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await axios.get(`${API_BASE}/experiences`);
      setExperiences(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching experiences', err);
      setError('Failed to fetch experiences list.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp._id || null);
    setCompany(exp.company);
    setRole(exp.role);
    setJoinDate(exp.joinDate ? new Date(exp.joinDate).toISOString().split('T')[0] : '');
    setEndDate(exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '');
    setIsCurrent(exp.isCurrent || false);
    setStipend(exp.stipend || '');
    setSkills(exp.skills || []);
    setProjects(exp.projects || []);
    // Reset file selections
    setMainImagesFiles(null);
    setDocumentsFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setCompany('');
    setRole('');
    setJoinDate('');
    setEndDate('');
    setIsCurrent(false);
    setStipend('');
    setSkills([]);
    setProjects([]);
    setMainImagesFiles(null);
    setDocumentsFiles(null);
    setNewSkillName('');
    setNewSkillIcon(null);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjGit('');
    setNewProjDep('');
    setNewProjImages(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/experiences/${id}`, getAuthHeaders());
      setSuccess('Experience deleted successfully.');
      fetchExperiences();
    } catch (err: any) {
      console.error('Error deleting experience', err);
      setError(err.response?.data?.message || 'Failed to delete experience.');
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName) return;
    const newSkill: ExpSkill = {
      name: newSkillName,
    };
    if (newSkillIcon) {
      newSkill.iconFile = newSkillIcon;
    }
    setSkills([...skills, newSkill]);
    setNewSkillName('');
    setNewSkillIcon(null);
  };

  const handleRemoveSkill = (index: number) => {
    const list = [...skills];
    list.splice(index, 1);
    setSkills(list);
  };

  const handleAddProject = () => {
    if (!newProjTitle || !newProjDesc) return;
    const newProj: ExpProject = {
      title: newProjTitle,
      description: newProjDesc,
      githubLink: newProjGit,
      deployedLink: newProjDep,
      images: []
    };
    if (newProjImages) {
      newProj.imageFiles = newProjImages;
    }
    setProjects([...projects, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjGit('');
    setNewProjDep('');
    setNewProjImages(null);
  };

  const handleRemoveProject = (index: number) => {
    const list = [...projects];
    list.splice(index, 1);
    setProjects(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('company', company);
    formData.append('role', role);
    formData.append('joinDate', joinDate);
    if (!isCurrent && endDate) formData.append('endDate', endDate);
    formData.append('isCurrent', String(isCurrent));
    formData.append('stipend', stipend);

    // Skills metadata structure
    const skillsMeta = skills.map(s => ({
      name: s.name,
      iconUrl: s.iconUrl
    }));
    formData.append('skills', JSON.stringify(skillsMeta));

    // Skill icon files
    skills.forEach((s, idx) => {
      if (s.iconFile) {
        formData.append(`skill_icon_${idx}`, s.iconFile);
      }
    });

    // Projects metadata structure
    const projectsMeta = projects.map(p => ({
      title: p.title,
      description: p.description,
      githubLink: p.githubLink,
      deployedLink: p.deployedLink,
      images: p.images
    }));
    formData.append('projects', JSON.stringify(projectsMeta));

    // Projects image files
    projects.forEach((p, idx) => {
      if (p.imageFiles) {
        for (let j = 0; j < p.imageFiles.length; j++) {
          formData.append(`project_${idx}_images`, p.imageFiles[j]);
        }
      }
    });

    if (mainImagesFiles) {
      for (let i = 0; i < mainImagesFiles.length; i++) {
        formData.append('images', mainImagesFiles[i]);
      }
    }

    if (documentsFiles) {
      for (let i = 0; i < documentsFiles.length; i++) {
        formData.append('documents', documentsFiles[i]);
      }
    }

    try {
      const config = getAuthHeaders();

      if (editingId) {
        await axios.put(`${API_BASE}/experiences/${editingId}`, formData, config);
        setSuccess('Experience updated successfully.');
      } else {
        await axios.post(`${API_BASE}/experiences`, formData, config);
        setSuccess('Experience created successfully.');
      }

      handleCancel();
      fetchExperiences();
    } catch (err: any) {
      console.error('Error saving experience', err);
      setError(err.response?.data?.message || 'Failed to save experience.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Experiences Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Experience' : 'Add Experience'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="company">Company / Institution</label>
                  <input
                    type="text"
                    id="company"
                    className="admin-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="role">Role / Position</label>
                  <input
                    type="text"
                    id="role"
                    className="admin-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="joinDate">Join Date</label>
                  <input
                    type="date"
                    id="joinDate"
                    className="admin-input"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    className="admin-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isCurrent}
                    required={!isCurrent}
                  />
                </div>

                <div className="admin-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="isCurrent"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                  />
                  <label htmlFor="isCurrent" style={{ cursor: 'pointer', fontWeight: 600 }}>Currently Working Here</label>
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="stipend">Stipend / Salary Info (Optional)</label>
                <input
                  type="text"
                  id="stipend"
                  className="admin-input"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. $20/hr or Unpaid"
                />
              </div>

              {/* Skills Area */}
              <div style={{ padding: '16px', background: 'var(--panel-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Skills Used In This Experience</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 3fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Skill Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Next.js, Redux"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Skill Icon File (Optional)</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="image/*"
                      onChange={(e) => setNewSkillIcon(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddSkill}>
                    Add Skill
                  </button>
                </div>

                {skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((skill, idx) => (
                      <span className="admin-badge" key={idx} style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {skill.name}
                        {skill.iconFile && ' (Icon added)'}
                        <button type="button" style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 700 }} onClick={() => handleRemoveSkill(idx)}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects Area */}
              <div style={{ padding: '16px', background: 'var(--panel-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Projects Delivered In This Experience</h4>
                
                <div className="admin-form" style={{ gap: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Project Title</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        placeholder="e.g. Admin Portal"
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>GitHub Link</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={newProjGit}
                        onChange={(e) => setNewProjGit(e.target.value)}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Project Description</label>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      placeholder="What was built?"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Deployed Link</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={newProjDep}
                        onChange={(e) => setNewProjDep(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="admin-form-group" style={{ marginBottom: 0 }}>
                      <label>Upload Project Images (Multiple)</label>
                      <input
                        type="file"
                        className="admin-input"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewProjImages(e.target.files)}
                      />
                    </div>
                  </div>

                  <button type="button" className="admin-btn admin-btn-secondary" style={{ alignSelf: 'flex-end' }} onClick={handleAddProject}>
                    Add Project
                  </button>
                </div>

                {projects.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)' }}>
                    {projects.map((proj, idx) => (
                      <li key={idx} style={{ marginBottom: '8px' }}>
                        <strong>{proj.title}</strong>: {proj.description.slice(0, 80)}... 
                        {proj.imageFiles && ` (${proj.imageFiles.length} new images attached)`}
                        <button type="button" style={{ border: 'none', background: 'none', color: '#d32f2f', cursor: 'pointer', marginLeft: '10px' }} onClick={() => handleRemoveProject(idx)}>Remove</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="images">Upload Main Experience Images / Photos</label>
                  <input
                    type="file"
                    id="images"
                    className="admin-input"
                    multiple
                    accept="image/*"
                    onChange={(e) => setMainImagesFiles(e.target.files)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="documents">Upload Documents (PDF Letter of Recommendation, Internship Certificate, etc.)</label>
                  <input
                    type="file"
                    id="documents"
                    className="admin-input"
                    multiple
                    accept="application/pdf"
                    onChange={(e) => setDocumentsFiles(e.target.files)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Experience' : 'Add Experience')}
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
            <h2 style={{ marginTop: 0 }}>Existing Experiences</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading experiences...</p>
            ) : experiences.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No experiences added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.map((exp) => (
                    <tr key={exp._id}>
                      <td style={{ fontWeight: 600 }}>{exp.company}</td>
                      <td>{exp.role}</td>
                      <td>{exp.joinDate ? new Date(exp.joinDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        {exp.isCurrent ? (
                          <span className="admin-badge admin-badge-success">Current</span>
                        ) : (
                          <span className="admin-badge admin-badge-warning" style={{ background: '#f1f1f1', color: '#666' }}>Ended</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(exp)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(exp._id!)}
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
