import { NavLink, useNavigate } from 'react-router-dom';

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const menuGroups = [
    {
      label: 'Visitor Analytics',
      items: [
        { to: '/admin/analytics', label: '📊 Global Overview' },
        { to: '/admin/analytics?tab=pages', label: '📄 Page-Wise Analytics' },
        { to: '/admin/analytics#realtime', label: '🔴 Live Visitors' },
        { to: '/admin/analytics#traffic', label: '📈 Traffic Trends' },
        { to: '/admin/analytics#projects', label: '💼 Project Engagement' },
        { to: '/admin/analytics#sources', label: '🌐 Traffic Sources' },
        { to: '/admin/analytics#devices', label: '📱 Devices & Platforms' },
        { to: '/admin/analytics#activity', label: '⚡ Live Activity' },
      ],
    },
    {
      label: 'Portfolio Content',
      items: [
        { to: '/admin/dashboard', label: '📋 Content Summary' },
        { to: '/admin/profile', label: '👤 Profile Info' },
        { to: '/admin/skills', label: '⚡ Skills Set' },
        { to: '/admin/projects', label: '💻 Projects' },
        { to: '/admin/research', label: '📑 Research Papers' },
        { to: '/admin/books', label: '📚 Books/Chapters' },
        { to: '/admin/events', label: '🎤 Events/Talks' },
        { to: '/admin/certificates', label: '📜 Certificates' },
        { to: '/admin/experiences', label: '💼 Experiences' },
        { to: '/admin/academics', label: '🎓 Academics' },
        { to: '/admin/quick-links', label: '🔗 Quick Links' },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {menuGroups.map((group) => (
        <div key={group.label} className="admin-sidebar-group">
          <div className="admin-sidebar-group-label">{group.label}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/analytics' || item.to === '/admin/dashboard'}
              className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
      <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '16px 0' }} />
      <button
        onClick={handleLogout}
        className="admin-btn admin-btn-danger"
        style={{ width: '100%', marginTop: 'auto', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </aside>
  );
}
