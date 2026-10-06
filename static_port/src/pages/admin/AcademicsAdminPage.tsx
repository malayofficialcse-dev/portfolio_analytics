import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type SemesterResult = {
  semester: string;
  gpa: number;
  marksheetUrl?: string;
  certificateUrl?: string;
  marksheetFile?: File; // local ref
  certificateFile?: File; // local ref
};

type AcademicRecord = {
  _id?: string;
  institution: string;
  degree: string;
  major: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  logoUrl?: string;
  degreeCertificateUrl?: string;
  registrationCertificateUrl?: string;
  semesterResults: SemesterResult[];
  imageUrls?: string[];
};

export function AcademicsAdminPage() {
  useRequireAuth();
  const [academics, setAcademics] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);

  // Semester results
  const [semesters, setSemesters] = useState<SemesterResult[]>([]);
  const [newSemName, setNewSemName] = useState('');
  const [newSemGpa, setNewSemGpa] = useState('');
  const [newSemMarksheet, setNewSemMarksheet] = useState<File | null>(null);
  const [newSemCert, setNewSemCert] = useState<File | null>(null);

  useEffect(() => {
    fetchAcademics();
  }, []);

  const fetchAcademics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/academics`);
      setAcademics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching academics list', err);
      setError('Failed to fetch academic history.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: AcademicRecord) => {
    setEditingId(record._id || null);
    setInstitution(record.institution);
    setDegree(record.degree);
    setMajor(record.major);
    setStartDate(record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : '');
    setEndDate(record.endDate ? new Date(record.endDate).toISOString().split('T')[0] : '');
    setLocation(record.location);
    setDescription(record.description);
    setSemesters(record.semesterResults || []);
    // Reset file selectors
    setLogoFile(null);
    setDegreeFile(null);
    setRegistrationFile(null);
    setImagesFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setInstitution('');
    setDegree('');
    setMajor('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setDescription('');
    setSemesters([]);
    setLogoFile(null);
    setDegreeFile(null);
    setRegistrationFile(null);
    setImagesFiles(null);
    setNewSemName('');
    setNewSemGpa('');
    setNewSemMarksheet(null);
    setNewSemCert(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this academic record?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/academics/${id}`, getAuthHeaders());
      setSuccess('Academic record deleted successfully.');
      fetchAcademics();
    } catch (err: any) {
      console.error('Error deleting academic record', err);
      setError(err.response?.data?.message || 'Failed to delete academic record.');
    }
  };

  const handleAddSemester = () => {
    if (!newSemName) return;
    const newSem: SemesterResult = {
      semester: newSemName,
      gpa: Number(newSemGpa) || 0,
    };
    if (newSemMarksheet) {
      newSem.marksheetFile = newSemMarksheet;
    }
    if (newSemCert) {
      newSem.certificateFile = newSemCert;
    }
    setSemesters([...semesters, newSem]);
    setNewSemName('');
    setNewSemGpa('');
    setNewSemMarksheet(null);
    setNewSemCert(null);
  };

  const handleRemoveSemester = (index: number) => {
    const list = [...semesters];
    list.splice(index, 1);
    setSemesters(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('institution', institution);
    formData.append('degree', degree);
    formData.append('major', major);
    formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);
    formData.append('location', location);
    formData.append('description', description);

    // Serialize semester results metadata (files will be sent separately)
    const semesterMeta = semesters.map(s => ({
      semester: s.semester,
      gpa: s.gpa,
      marksheetUrl: s.marksheetUrl,
      certificateUrl: s.certificateUrl
    }));
    formData.append('semesterResults', JSON.stringify(semesterMeta));

    // Append Logo
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    // Append Degree Certificate PDF
    if (degreeFile) {
      formData.append('degreeCertificate', degreeFile);
    }

    // Append Registration Certificate PDF
    if (registrationFile) {
      formData.append('registrationCertificate', registrationFile);
    }

    // Append Carousel Images
    if (imagesFiles) {
      for (let i = 0; i < imagesFiles.length; i++) {
        formData.append('images', imagesFiles[i]);
      }
    }

    // Append semester files matching fieldnames in backend: marksheet_${i} and certificate_${i}
    semesters.forEach((s, idx) => {
      if (s.marksheetFile) {
        formData.append(`marksheet_${idx}`, s.marksheetFile);
      }
      if (s.certificateFile) {
        formData.append(`certificate_${idx}`, s.certificateFile);
      }
    });

    try {
      const headersConfig = getAuthHeaders();
      const config = {
        headers: {
          ...headersConfig.headers,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editingId) {
        await axios.put(`${API_BASE}/academics/${editingId}`, formData, config);
        setSuccess('Academic record updated successfully.');
      } else {
        await axios.post(`${API_BASE}/academics`, formData, config);
        setSuccess('Academic record created successfully.');
      }

      handleCancel();
      fetchAcademics();
    } catch (err: any) {
      console.error('Error saving academic record', err);
      setError(err.response?.data?.message || 'Failed to save academic record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Academics Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Academic Record' : 'Add Academic Record'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="institution">Institution / School / College</label>
                  <input
                    type="text"
                    id="institution"
                    className="admin-input"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="degree">Degree / Course</label>
                  <input
                    type="text"
                    id="degree"
                    className="admin-input"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="major">Major / Specialization</label>
                  <input
                    type="text"
                    id="major"
                    className="admin-input"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="admin-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    className="admin-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="endDate">End Date (If completed)</label>
                  <input
                    type="date"
                    id="endDate"
                    className="admin-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    className="admin-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. West Bengal, India"
                    required
                  />
                </div>
              </div>

              {/* Semester Results Area */}
              <div style={{ padding: '16px', background: 'var(--panel-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Semester wise GPA & Marksheets</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Semester / Term</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={newSemName}
                      onChange={(e) => setNewSemName(e.target.value)}
                      placeholder="e.g. Semester 1"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={newSemGpa}
                      onChange={(e) => setNewSemGpa(e.target.value)}
                      placeholder="e.g. 9.1"
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Marksheet PDF</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="application/pdf"
                      onChange={(e) => setNewSemMarksheet(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Certificate PDF</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="application/pdf"
                      onChange={(e) => setNewSemCert(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAddSemester}>
                    Add Result
                  </button>
                </div>

                {semesters.length > 0 && (
                  <table className="admin-table" style={{ background: '#fff' }}>
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>GPA</th>
                        <th>Attached Files</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesters.map((sem, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{sem.semester}</td>
                          <td>{sem.gpa}</td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {sem.marksheetFile && '📄 Marksheet selected '}
                            {sem.certificateFile && '📄 Certificate selected'}
                            {!sem.marksheetFile && !sem.certificateFile && (sem.marksheetUrl || sem.certificateUrl ? 'Uploaded already' : 'None')}
                          </td>
                          <td>
                            <button type="button" className="admin-btn" style={{ color: '#d32f2f', background: 'none', border: 'none', padding: 0 }} onClick={() => handleRemoveSemester(idx)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="logo">Institution Logo</label>
                  <input
                    type="file"
                    id="logo"
                    className="admin-input"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="degreeCertificate">Degree Certificate PDF</label>
                  <input
                    type="file"
                    id="degreeCertificate"
                    className="admin-input"
                    accept="application/pdf"
                    onChange={(e) => setDegreeFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="registrationCertificate">Registration PDF</label>
                  <input
                    type="file"
                    id="registrationCertificate"
                    className="admin-input"
                    accept="application/pdf"
                    onChange={(e) => setRegistrationFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="images">Campus Carousel Images</label>
                  <input
                    type="file"
                    id="images"
                    className="admin-input"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImagesFiles(e.target.files)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Record' : 'Add Record')}
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
            <h2 style={{ marginTop: 0 }}>Existing Academic Records</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading academic records...</p>
            ) : academics.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No academic records added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Degree</th>
                    <th>Institution</th>
                    <th>Major</th>
                    <th>Period</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {academics.map((rec) => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600 }}>{rec.degree}</td>
                      <td>{rec.institution}</td>
                      <td>{rec.major}</td>
                      <td>
                        {rec.startDate ? new Date(rec.startDate).getFullYear() : 'N/A'} - {rec.endDate ? new Date(rec.endDate).getFullYear() : 'Present'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(rec)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(rec._id!)}
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
