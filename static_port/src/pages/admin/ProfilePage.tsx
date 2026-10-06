import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type ProfileData = {
  name: string;
  title: string;
  bio: string;
  description: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  resume?: string;
};

export function ProfilePage() {
  useRequireAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    title: '',
    bio: '',
    description: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    resume: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile`);
        if (res.data) {
          setProfile({
            name: res.data.name || '',
            title: res.data.title || '',
            bio: res.data.bio || '',
            description: res.data.description || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            location: res.data.location || '',
            website: res.data.website || '',
            github: res.data.github || '',
            linkedin: res.data.linkedin || '',
            twitter: res.data.twitter || '',
            resume: res.data.resume || '',
            profileImage: res.data.profileImage || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile', err);
        setMessage({ text: 'Failed to load profile details.', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => {
        if (val !== undefined && key !== 'profileImage') {
          formData.append(key, val);
        }
      });

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }

      const headersConfig = getAuthHeaders();
      const res = await axios.put(`${API_BASE}/profile`, formData, {
        headers: {
          ...headersConfig.headers,
          'Content-Type': 'multipart/form-data',
        }
      });

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      if (res.data.profile) {
        setProfile(prev => ({
          ...prev,
          profileImage: res.data.profile.profileImage || prev.profileImage
        }));
      }
    } catch (err: any) {
      console.error('Error updating profile', err);
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Profile Info</h1>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Loading profile details...
            </div>
          ) : (
            <div className="admin-card">
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Identity & Biography</h2>

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

              <form onSubmit={handleSubmit} className="admin-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className="admin-input"
                      value={profile.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="title">Professional Title</label>
                    <input
                      type="text"
                      id="title"
                      className="admin-input"
                      value={profile.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="bio">Short Biography (Bio)</label>
                  <input
                    type="text"
                    id="bio"
                    className="admin-input"
                    value={profile.bio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="description">Detailed Description</label>
                  <textarea
                    id="description"
                    className="admin-textarea"
                    rows={6}
                    value={profile.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '10px 0' }} />
                <h3>Contact & Links</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="admin-input"
                      value={profile.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      className="admin-input"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      className="admin-input"
                      value={profile.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="website">Website Link</label>
                    <input
                      type="text"
                      id="website"
                      className="admin-input"
                      value={profile.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="github">GitHub Profile (URL or Username)</label>
                    <input
                      type="text"
                      id="github"
                      className="admin-input"
                      value={profile.github}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="linkedin">LinkedIn Profile (URL)</label>
                    <input
                      type="text"
                      id="linkedin"
                      className="admin-input"
                      value={profile.linkedin}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="twitter">Twitter/X Link</label>
                    <input
                      type="text"
                      id="twitter"
                      className="admin-input"
                      value={profile.twitter}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="resume">Resume Drive/Cloud Link</label>
                    <input
                      type="text"
                      id="resume"
                      className="admin-input"
                      value={profile.resume}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '10px 0' }} />
                <h3>Media Assets</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {profile.profileImage && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--line-strong)' }}>
                      <img src={profile.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="admin-form-group" style={{ flex: 1 }}>
                    <label htmlFor="profileImage">Upload New Profile Image</label>
                    <input
                      type="file"
                      id="profileImage"
                      className="admin-input"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                    {saving ? 'Saving changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
