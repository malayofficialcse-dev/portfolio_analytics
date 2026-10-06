import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type CommunicationSkill = {
  _id?: string;
  language: string;
  level: number;
  readLevel?: number;
  writeLevel?: number;
  speakLevel?: number;
};

type TechnicalSkill = {
  _id?: string;
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'deployment';
  iconUrl?: string;
};

type TheoreticalSkill = {
  _id?: string;
  name: string;
  level: number;
  category: 'cn' | 'os' | 'dbms' | 'oops' | 'dsa' | 'other';
  iconUrl?: string;
};

type SkillSet = {
  communicationSkills: CommunicationSkill[];
  technicalSkills: TechnicalSkill[];
  theoreticalSkills: TheoreticalSkill[];
};

export function SkillsAdminPage() {
  useRequireAuth();
  const [skills, setSkills] = useState<SkillSet>({
    communicationSkills: [],
    technicalSkills: [],
    theoreticalSkills: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Add Technical Skill form state
  const [techName, setTechName] = useState('');
  const [techLevel, setTechLevel] = useState(80);
  const [techCat, setTechCat] = useState<'frontend' | 'backend' | 'database' | 'devops' | 'deployment'>('frontend');
  const [techIcon, setTechIcon] = useState<File | null>(null);

  // Add Theoretical Skill form state
  const [theoName, setTheoName] = useState('');
  const [theoLevel, setTheoLevel] = useState(80);
  const [theoCat, setTheoCat] = useState<'cn' | 'os' | 'dbms' | 'oops' | 'dsa' | 'other'>('dsa');
  const [theoIcon, setTheoIcon] = useState<File | null>(null);

  // Add Communication Skill form state
  const [commLang, setCommLang] = useState('');
  const [commLevel, setCommLevel] = useState(80);
  const [commRead, setCommRead] = useState(80);
  const [commWrite, setCommWrite] = useState(80);
  const [commSpeak, setCommSpeak] = useState(80);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await axios.get(`${API_BASE}/skills/set`);
      if (res.data) {
        setSkills({
          communicationSkills: res.data.communicationSkills || [],
          technicalSkills: res.data.technicalSkills || [],
          theoreticalSkills: res.data.theoreticalSkills || []
        });
      }
    } catch (err) {
      console.error('Error fetching skills set', err);
      setMessage({ text: 'Failed to load skills.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async (updatedSkills: SkillSet) => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.put(`${API_BASE}/skills/set`, updatedSkills, getAuthHeaders());
      if (res.data?.skillSet) {
        setSkills({
          communicationSkills: res.data.skillSet.communicationSkills || [],
          technicalSkills: res.data.skillSet.technicalSkills || [],
          theoreticalSkills: res.data.skillSet.theoreticalSkills || []
        });
        setMessage({ text: 'Skills set updated successfully!', type: 'success' });
      }
    } catch (err: any) {
      console.error('Error saving skills set', err);
      setMessage({ text: err.response?.data?.message || 'Failed to save skills set.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const uploadIcon = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('icon', file);

    const headersConfig = getAuthHeaders();
    const res = await axios.post(`${API_BASE}/skills/upload-icon`, formData, {
      headers: {
        ...headersConfig.headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.url;
  };

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName) return;

    try {
      setSaving(true);
      let iconUrl = '';
      if (techIcon) {
        iconUrl = await uploadIcon(techIcon);
      }

      const newTech: TechnicalSkill = {
        name: techName,
        level: techLevel,
        category: techCat,
        iconUrl
      };

      const updated = {
        ...skills,
        technicalSkills: [...skills.technicalSkills, newTech]
      };
      await saveSkills(updated);

      // Reset
      setTechName('');
      setTechLevel(80);
      setTechIcon(null);
    } catch (err: any) {
      setMessage({ text: 'Failed to upload icon and add technical skill.', type: 'danger' });
      setSaving(false);
    }
  };

  const handleAddTheo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theoName) return;

    try {
      setSaving(true);
      let iconUrl = '';
      if (theoIcon) {
        iconUrl = await uploadIcon(theoIcon);
      }

      const newTheo: TheoreticalSkill = {
        name: theoName,
        level: theoLevel,
        category: theoCat,
        iconUrl
      };

      const updated = {
        ...skills,
        theoreticalSkills: [...skills.theoreticalSkills, newTheo]
      };
      await saveSkills(updated);

      // Reset
      setTheoName('');
      setTheoLevel(80);
      setTheoIcon(null);
    } catch (err) {
      setMessage({ text: 'Failed to upload icon and add theoretical skill.', type: 'danger' });
      setSaving(false);
    }
  };

  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commLang) return;

    const newComm: CommunicationSkill = {
      language: commLang,
      level: commLevel,
      readLevel: commRead,
      writeLevel: commWrite,
      speakLevel: commSpeak
    };

    const updated = {
      ...skills,
      communicationSkills: [...skills.communicationSkills, newComm]
    };
    await saveSkills(updated);

    // Reset
    setCommLang('');
    setCommLevel(80);
    setCommRead(80);
    setCommWrite(80);
    setCommSpeak(80);
  };

  const handleDeleteTech = (index: number) => {
    const list = [...skills.technicalSkills];
    list.splice(index, 1);
    saveSkills({ ...skills, technicalSkills: list });
  };

  const handleDeleteTheo = (index: number) => {
    const list = [...skills.theoreticalSkills];
    list.splice(index, 1);
    saveSkills({ ...skills, theoreticalSkills: list });
  };

  const handleDeleteComm = (index: number) => {
    const list = [...skills.communicationSkills];
    list.splice(index, 1);
    saveSkills({ ...skills, communicationSkills: list });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Skills Set Editor</h1>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          {message.text && (
            <div style={{
              padding: '12px',
              background: message.type === 'success' ? '#e6f4ea' : '#fdf2f2',
              color: message.type === 'success' ? '#137333' : '#b42318',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Loading skills set...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

              {/* TECHNICAL SKILLS */}
              <div className="admin-card">
                <h2 style={{ marginTop: 0 }}>Technical Skills</h2>
                
                {/* Form */}
                <form onSubmit={handleAddTech} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '12px', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Skill Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={techName}
                      onChange={(e) => setTechName(e.target.value)}
                      placeholder="e.g. React, Node.js"
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Level (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={techLevel}
                      onChange={(e) => setTechLevel(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Category</label>
                    <select
                      className="admin-select"
                      value={techCat}
                      onChange={(e: any) => setTechCat(e.target.value)}
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="database">Database</option>
                      <option value="devops">DevOps</option>
                      <option value="deployment">Deployment</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Icon File (Optional)</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="image/*"
                      onChange={(e) => setTechIcon(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                    Add
                  </button>
                </form>

                {/* Table */}
                {skills.technicalSkills.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No technical skills added yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Category</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.technicalSkills.map((s, idx) => (
                        <tr key={s._id || idx}>
                          <td>
                            {s.iconUrl ? (
                              <img src={s.iconUrl} alt={s.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>None</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.level}%</td>
                          <td style={{ textTransform: 'capitalize' }}>{s.category}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                              onClick={() => handleDeleteTech(idx)}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* THEORETICAL SKILLS */}
              <div className="admin-card">
                <h2 style={{ marginTop: 0 }}>Theoretical Skills</h2>

                {/* Form */}
                <form onSubmit={handleAddTheo} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '12px', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Skill Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={theoName}
                      onChange={(e) => setTheoName(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Level (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={theoLevel}
                      onChange={(e) => setTheoLevel(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Category</label>
                    <select
                      className="admin-select"
                      value={theoCat}
                      onChange={(e: any) => setTheoCat(e.target.value)}
                    >
                      <option value="dsa">DSA</option>
                      <option value="dbms">DBMS</option>
                      <option value="os">OS</option>
                      <option value="cn">CN</option>
                      <option value="oops">OOPs</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Icon File (Optional)</label>
                    <input
                      type="file"
                      className="admin-input"
                      accept="image/*"
                      onChange={(e) => setTheoIcon(e.target.files?.[0] || null)}
                    />
                  </div>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                    Add
                  </button>
                </form>

                {/* Table */}
                {skills.theoreticalSkills.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No theoretical skills added yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Category</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.theoreticalSkills.map((s, idx) => (
                        <tr key={s._id || idx}>
                          <td>
                            {s.iconUrl ? (
                              <img src={s.iconUrl} alt={s.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>None</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td>{s.level}%</td>
                          <td style={{ textTransform: 'uppercase' }}>{s.category}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                              onClick={() => handleDeleteTheo(idx)}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* COMMUNICATION SKILLS */}
              <div className="admin-card">
                <h2 style={{ marginTop: 0 }}>Communication Skills</h2>

                {/* Form */}
                <form onSubmit={handleAddComm} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Language</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={commLang}
                      onChange={(e) => setCommLang(e.target.value)}
                      placeholder="e.g. English, Hindi"
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Overall (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={commLevel}
                      onChange={(e) => setCommLevel(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Read (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={commRead}
                      onChange={(e) => setCommRead(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Write (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={commWrite}
                      onChange={(e) => setCommWrite(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Speak (%)</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={commSpeak}
                      onChange={(e) => setCommSpeak(Number(e.target.value))}
                      min={0}
                      max={100}
                      required
                    />
                  </div>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                    Add
                  </button>
                </form>

                {/* Table */}
                {skills.communicationSkills.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No communication skills added yet.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Language</th>
                        <th>Overall</th>
                        <th>Read</th>
                        <th>Write</th>
                        <th>Speak</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.communicationSkills.map((s, idx) => (
                        <tr key={s._id || idx}>
                          <td style={{ fontWeight: 600 }}>{s.language}</td>
                          <td>{s.level}%</td>
                          <td>{s.readLevel || 0}%</td>
                          <td>{s.writeLevel || 0}%</td>
                          <td>{s.speakLevel || 0}%</td>
                          <td>
                            <button
                              type="button"
                              className="admin-btn admin-btn-danger"
                              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                              onClick={() => handleDeleteComm(idx)}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
