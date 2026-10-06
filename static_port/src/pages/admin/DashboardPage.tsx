import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type Counts = {
  projects: number;
  skills: number;
  experiences: number;
  books: number;
  events: number;
  certificates: number;
  academics: number;
  research: number;
};

export function DashboardPage() {
  useRequireAuth();
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Counts>({
    projects: 0,
    skills: 0,
    experiences: 0,
    books: 0,
    events: 0,
    certificates: 0,
    academics: 0,
    research: 0
  });

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        setAdminName(parsed.name || parsed.username);
      } catch (e) {
        // ignore
      }
    }

    const fetchCounts = async () => {
      try {
        const [proj, skills, exp, books, events, certs, acad, res] = await Promise.all([
          axios.get(`${API_BASE}/projects`),
          axios.get(`${API_BASE}/skills/set`),
          axios.get(`${API_BASE}/experiences`),
          axios.get(`${API_BASE}/books`),
          axios.get(`${API_BASE}/events`),
          axios.get(`${API_BASE}/certificates`),
          axios.get(`${API_BASE}/academics`),
          axios.get(`${API_BASE}/research`)
        ]);

        const totalSkills = 
          (skills.data?.technicalSkills?.length || 0) + 
          (skills.data?.communicationSkills?.length || 0) + 
          (skills.data?.theoreticalSkills?.length || 0);

        setCounts({
          projects: Array.isArray(proj.data) ? proj.data.length : 0,
          skills: totalSkills,
          experiences: Array.isArray(exp.data) ? exp.data.length : 0,
          books: Array.isArray(books.data) ? books.data.length : 0,
          events: Array.isArray(events.data) ? events.data.length : 0,
          certificates: Array.isArray(certs.data) ? certs.data.length : 0,
          academics: Array.isArray(acad.data) ? acad.data.length : 0,
          research: Array.isArray(res.data) ? res.data.length : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard counts', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const cardItems = [
    { to: '/admin/profile', title: 'Profile Info', desc: 'Update details, biography, links, and profile image.' },
    { to: '/admin/skills', title: 'Skills Set', desc: `Manage technical, theoretical, and communication skills (${counts.skills} items).` },
    { to: '/admin/projects', title: 'Projects', desc: `Edit details, technologies, images, and links (${counts.projects} items).` },
    { to: '/admin/research', title: 'Research Papers', desc: `Manage published papers, abstract, DOI and external links (${counts.research} items).` },
    { to: '/admin/books', title: 'Books & Chapters', desc: `Edit book details, publisher and purchase links (${counts.books} items).` },
    { to: '/admin/events', title: 'Events & Talks', desc: `Track upcoming and past seminars, hackathons, and sessions (${counts.events} items).` },
    { to: '/admin/certificates', title: 'Certificates', desc: `Store and show credentials, verified badges, and PDFs (${counts.certificates} items).` },
    { to: '/admin/experiences', title: 'Experiences', desc: `Update work history, roles, key milestones, and skills (${counts.experiences} items).` },
    { to: '/admin/academics', title: 'Academics', desc: `Manage school/college education, grades and semester marksheets (${counts.academics} items).` },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Welcome back, {adminName || 'Admin'}</h1>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Portfolio Overview</h2>
            <p style={{ color: 'var(--muted)', margin: 0 }}>
              Use the links below or the sidebar menu to create, update, or remove entries on your public portfolio page.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Loading portfolio statistics...
            </div>
          ) : (
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {cardItems.map((card) => (
                <Link to={card.to} key={card.to} className="card card-link" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '180px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--accent)' }}>{card.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.4' }}>{card.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-strong)', alignSelf: 'flex-end', marginTop: '12px' }}>
                    Manage →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
