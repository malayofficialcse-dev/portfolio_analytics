import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useRequireAuth } from '@/utils/adminUtils';
import { analyticsAdminApi } from '@/services/analyticsApi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';

const COLORS = ['#0078d4', '#00a4ef', '#7fba00', '#ffb900', '#f25022', '#8764b8', '#00b7c3', '#e3008c', '#107c41', '#d83b01'];
const RANGES = ['1d', '7d', '30d', '90d'] as const;

type Range = typeof RANGES[number];

const PAGE_META: Record<string, { title: string; icon: string }> = {
  '/': { title: 'Home', icon: '🏠' },
  '/projects': { title: 'Projects', icon: '💼' },
  '/skills': { title: 'Skills', icon: '⚡' },
  '/experiences': { title: 'Experiences', icon: '💼' },
  '/experience': { title: 'Experiences', icon: '💼' },
  '/research': { title: 'Research', icon: '📑' },
  '/books': { title: 'Books', icon: '📚' },
  '/events': { title: 'Events', icon: '🎤' },
  '/certificates': { title: 'Certificates', icon: '📜' },
  '/cert': { title: 'Certificates', icon: '📜' },
  '/academic': { title: 'Academics', icon: '🎓' },
  '/admin/analytics': { title: 'Admin Analytics', icon: '📊' },
  '/admin/login': { title: 'Admin Login', icon: '🔒' },
  '/admin/dashboard': { title: 'Admin Dashboard', icon: '⚙️' },
  '/admin/profile': { title: 'Admin Profile', icon: '👤' },
};

function getPageInfo(path: string) {
  if (PAGE_META[path]) return PAGE_META[path];
  if (path.startsWith('/admin')) return { title: `Admin: ${path.replace('/admin/', '')}`, icon: '🛠️' };
  return { title: path, icon: '📄' };
}

function StatCard({ label, value, sub, color = '#0078d4' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="anal-stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="anal-stat-value" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="anal-stat-label">{label}</div>
      {sub && <div className="anal-stat-sub">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="anal-section-title">{children}</h2>;
}

function LoadingBar() {
  return <div className="anal-loading"><div className="anal-loading-inner" /></div>;
}

export function AnalyticsDashboard() {
  useRequireAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'pages'>('overview');
  const [range, setRange] = useState<Range>('30d');
  const [pageViewMode, setPageViewMode] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pages' || location.hash === '#pages') {
      setActiveTab('pages');
    } else if (tabParam === 'overview') {
      setActiveTab('overview');
    }
  }, [searchParams, location.hash]);

  const [overview, setOverview] = useState<any>(null);
  const [traffic, setTraffic] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [sources, setSources] = useState<any>(null);
  const [devices, setDevices] = useState<any>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminName, setAdminName] = useState('');

  // Per-page drilldown state
  const [selectedPage, setSelectedPage] = useState<string>('/projects');
  const [pageDetail, setPageDetail] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const a = localStorage.getItem('admin');
    if (a) {
      try {
        const p = JSON.parse(a);
        setAdminName(p.name || p.username || 'Admin');
      } catch { }
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, tr, pg, proj, src, dev, rt, act] = await Promise.all([
        analyticsAdminApi.getOverview(range),
        analyticsAdminApi.getTraffic(range),
        analyticsAdminApi.getPages(range),
        analyticsAdminApi.getProjects(range),
        analyticsAdminApi.getSources(range),
        analyticsAdminApi.getDevices(range),
        analyticsAdminApi.getRealtime(),
        analyticsAdminApi.getRecentActivity(25),
      ]);
      setOverview(ov.data);
      setTraffic(tr.data || []);
      setPages(pg.data || []);
      setProjects((proj.data || []).slice(0, 6));
      setSources(src.data);
      setDevices(dev.data);
      setRealtime(rt.data);
      setRecentActivity(act.data || []);

      if (pg.data && pg.data.length > 0 && !selectedPage) {
        setSelectedPage(pg.data[0].path);
      }
    } catch (e: any) {
      setError('Failed to load analytics. Make sure the analytics server is running.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch page detail whenever selectedPage or range changes
  const fetchPageDetail = useCallback(async (path: string) => {
    if (!path) return;
    setPageLoading(true);
    try {
      const res = await analyticsAdminApi.getPageDetail(path, range);
      setPageDetail(res.data);
    } catch (err) {
      console.error('Failed to load page detail:', err);
    } finally {
      setPageLoading(false);
    }
  }, [range]);

  useEffect(() => {
    if (selectedPage) {
      fetchPageDetail(selectedPage);
    }
  }, [selectedPage, fetchPageDetail]);

  // Auto-refresh realtime every 30s
  useEffect(() => {
    const t = setInterval(() => {
      analyticsAdminApi.getRealtime().then(r => setRealtime(r.data)).catch(() => { });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSelectPageDrilldown = (path: string) => {
    setSelectedPage(path);
    setActiveTab('pages');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Visualizations datasets for Global Overview
  const pagesBarData = useMemo(() => {
    return pages.slice(0, 8).map((p) => {
      const meta = getPageInfo(p.path);
      return {
        name: `${meta.icon} ${meta.title}`,
        path: p.path,
        views: p.views,
        uniques: p.uniqueVisitors,
      };
    });
  }, [pages]);

  const pagesPieData = useMemo(() => {
    return pages.slice(0, 7).map((p) => {
      const meta = getPageInfo(p.path);
      return {
        name: `${meta.title} (${p.path})`,
        value: p.views,
        path: p.path,
      };
    });
  }, [pages]);

  const projectsBarData = useMemo(() => {
    return projects.map((p) => ({
      name: p.project.length > 14 ? p.project.slice(0, 12) + '…' : p.project,
      fullName: p.project,
      views: p.views || 0,
      githubClicks: p.githubClicks || 0,
      demoClicks: p.demoClicks || 0,
    }));
  }, [projects]);

  const devicesPieData = useMemo(() => {
    return (devices?.devices || []).map((d: any) => ({
      name: (d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Desktop'),
      value: d.count,
    }));
  }, [devices]);

  const browsersBarData = useMemo(() => {
    return (devices?.browsers || []).slice(0, 5).map((b: any) => ({
      name: b._id || 'Unknown',
      count: b.count,
    }));
  }, [devices]);

  // Comparative pages data for bar chart on Page tab
  const comparativePagesData = useMemo(() => {
    return pages.slice(0, 10).map((p) => ({
      name: p.path === '/' ? 'Home' : p.path.replace('/', ''),
      fullPath: p.path,
      views: p.views,
      uniques: p.uniqueVisitors,
      isCurrent: p.path === selectedPage,
    }));
  }, [pages, selectedPage]);

  const eventLabel: Record<string, string> = {
    RESUME_DOWNLOAD: ' Downloaded Resume',
    GITHUB_CLICK: ' Clicked GitHub',
    LINKEDIN_CLICK: ' Clicked LinkedIn',
    PROJECT_VIEW: ' Viewed Project',
    PROJECT_CLICK: ' Clicked Project',
    LIVE_DEMO_CLICK: 'Clicked Live Demo',
    EMAIL_CLICK: ' Clicked Email',
    PAGE_VIEW: ' Visited Page',
    RESEARCH_CLICK: ' Viewed Research',
    CERTIFICATE_CLICK: ' Viewed Certificate',
  };

  return (
    <div className="admin-container anal-dashboard">
      {/* Top Header */}
      <div className="anal-header">
        <div>
          <h1 className="anal-greeting">{greeting()}, {adminName || 'Admin'} 👋</h1>
          <p className="anal-subtext">Real-time Visitor Intelligence & Visual Charts Dashboard</p>
        </div>
        <div className="anal-range-picker">
          {RANGES.map((r) => (
            <button
              key={r}
              className={`anal-range-btn${range === r ? ' active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r === '1d' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-layout">
        <AdminSidebar />

        <div className="admin-main">
          {error && (
            <div className="anal-error">
              <span>⚠️ {error}</span>
              <button onClick={fetchData} className="anal-retry-btn">Retry</button>
            </div>
          )}

          {/* Navigation View Switcher Tabs */}
          <div className="anal-view-tabs">
            <button
              className={`anal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Global Overview (Charts)
            </button>
            <button
              className={`anal-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
              onClick={() => setActiveTab('pages')}
            >
              Page-Wise Analytics & Visualizations
            </button>
          </div>

          {/* Live Visitors Banner */}
          {realtime && (
            <div className="anal-live-banner">
              <span className="anal-live-dot" />
              <span><strong>{realtime.activeCount}</strong> visitor{realtime.activeCount !== 1 ? 's' : ''} online right now</span>
              {realtime.activeSessions?.slice(0, 4).map((s: any) => (
                <span key={s.sessionId} className="anal-live-visitor">
                  ID {s.visitorId.slice(0, 6)} · {s.currentPage}
                </span>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: GLOBAL OVERVIEW (ALL CHARTS VISUALIZATION)           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards Grid */}
              <div className="anal-grid-4">
                <StatCard label="Total Visitors" value={overview?.totalVisitors ?? 0} color="#0078d4" />
                <StatCard label="Unique Visitors" value={overview?.uniqueVisitors ?? 0} color="#00a4ef" />
                <StatCard label="Total Sessions" value={overview?.totalSessions ?? 0} color="#ffb900" />
                <StatCard label="Total Page Views" value={overview?.totalPageViews ?? 0} color="#7fba00" />
                <StatCard label="Active Now" value={overview?.activeNow ?? 0} color="#22c55e" />
                <StatCard label="Resume Downloads" value={overview?.resumeDownloads ?? 0} color="#f25022" />
                <StatCard label="Project Views" value={overview?.projectViews ?? 0} color="#8764b8" />
              </div>

              {/* Chart 1: Main Traffic Trend Over Time (Area Chart) */}
              <div className="anal-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <SectionTitle> Visitor Traffic Trend Over Time</SectionTitle>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Daily breakdown ({range})</span>
                </div>
                {loading ? <LoadingBar /> : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={traffic} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0078d4" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gPageViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7fba00" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7fba00" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffb900" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#ffb900" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="visitors" stroke="#0078d4" fill="url(#gVisitors)" strokeWidth={2} name="Visitors" />
                      <Area type="monotone" dataKey="pageViews" stroke="#7fba00" fill="url(#gPageViews)" strokeWidth={2} name="Page Views" />
                      <Area type="monotone" dataKey="sessions" stroke="#ffb900" fill="url(#gSessions)" strokeWidth={2} name="Sessions" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chart 2 & 3: Top Pages - BAR CHART & PIE CHART VISUALIZATION */}
              <div className="anal-two-col">
                {/* Horizontal Bar Chart of Top Pages */}
                <div className="anal-col-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <SectionTitle> Top Pages by Views (Bar Chart)</SectionTitle>
                    <button onClick={() => setActiveTab('pages')} className="anal-link-btn">
                      Page Details →
                    </button>
                  </div>
                  {loading ? <LoadingBar /> : (
                    pagesBarData.length === 0 ? (
                      <p className="anal-empty">No page data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={pagesBarData}
                          layout="vertical"
                          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                          onClick={(data) => {
                            if (data && data.activePayload && data.activePayload[0]) {
                              handleSelectPageDrilldown(data.activePayload[0].payload.path);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              `${value} ${name === 'views' ? 'Page Views' : 'Unique Visitors'}`,
                              name === 'views' ? 'Total Views' : 'Unique Visitors',
                            ]}
                          />
                          <Legend />
                          <Bar dataKey="views" name="Page Views" fill="#0078d4" radius={[0, 4, 4, 0]}>
                            {pagesBarData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                            ))}
                          </Bar>
                          <Bar dataKey="uniques" name="Unique Visitors" fill="#7fba00" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  )}
                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', margin: '8px 0 0' }}>
                    💡 Tip: Click on any bar to inspect that page's deep analytics
                  </p>
                </div>

                {/* Donut/Pie Chart of Page Traffic Share */}
                <div className="anal-col-card">
                  <SectionTitle>Page Traffic Distribution (Pie Chart)</SectionTitle>
                  {loading ? <LoadingBar /> : (
                    pagesPieData.length === 0 ? (
                      <p className="anal-empty">No page distribution data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pagesPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: any) => {
                              const short = name.split(' ')[0];
                              return `${short} ${Math.round((percent || 0) * 100)}%`;
                            }}
                            labelLine={false}
                            onClick={(entry) => {
                              if (entry && entry.path) handleSelectPageDrilldown(entry.path);
                            }}
                          >
                            {pagesPieData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} cursor="pointer" />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} views`, 'Hits']} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>
              </div>

              {/* Chart 4 & 5: Projects Bar Chart & Traffic Sources Pie Chart */}
              <div className="anal-two-col">
                {/* Projects Engagement Bar Chart */}
                <div className="anal-col-card">
                  <SectionTitle>Project Engagement (Grouped Bar Chart)</SectionTitle>
                  {loading ? <LoadingBar /> : (
                    projectsBarData.length === 0 ? (
                      <p className="anal-empty">No project interaction data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={projectsBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" name="Project Views" fill="#0078d4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="githubClicks" name="GitHub Clicks" fill="#107c41" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="demoClicks" name="Live Demo Clicks" fill="#ffb900" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>

                {/* Traffic Sources Pie Chart */}
                <div className="anal-col-card">
                  <SectionTitle>Traffic Sources (Pie Chart)</SectionTitle>
                  {loading ? <LoadingBar /> : (
                    sources?.referrers?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={sources.referrers.map((r: any) => ({
                              name: r._id ? (r._id.replace(/^https?:\/\//, '').split('/')[0]) : 'Direct',
                              value: r.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            innerRadius={45}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: any) => `${name} ${Math.round((percent || 0) * 100)}%`}
                            labelLine={false}
                          >
                            {sources.referrers.map((_: any, index: number) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} sessions`, 'Visitors']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="anal-empty">No source data yet.</p>
                    )
                  )}
                </div>
              </div>

              {/* Chart 6 & 7: Devices Pie Chart & Browsers Bar Chart */}
              <div className="anal-two-col">
                {/* Devices Pie Chart */}
                <div className="anal-col-card">
                  <SectionTitle>Devices Distribution (Pie Chart)</SectionTitle>
                  {loading ? <LoadingBar /> : (
                    devicesPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={devicesPieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={85}
                            innerRadius={40}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: any) => `${name} ${Math.round((percent || 0) * 100)}%`}
                            labelLine={false}
                          >
                            {devicesPieData.map((_: any, index: number) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`${value} sessions`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="anal-empty">No device data yet.</p>
                    )
                  )}
                </div>

                {/* Browsers Bar Chart */}
                <div className="anal-col-card">
                  <SectionTitle>Browsers Distribution (Bar Chart)</SectionTitle>
                  {loading ? <LoadingBar /> : (
                    browsersBarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={browsersBarData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="count" name="Sessions" fill="#0078d4" radius={[0, 4, 4, 0]}>
                            {browsersBarData.map((_: any, i: number) => (
                              <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="anal-empty">No browser data yet.</p>
                    )
                  )}
                </div>
              </div>

              {/* Recent Activity Live Stream */}
              <div className="anal-chart-card">
                <SectionTitle>Recent Live Activity Stream</SectionTitle>
                {loading ? <LoadingBar /> : (
                  recentActivity.length === 0 ? (
                    <p className="anal-empty">No recent activity.</p>
                  ) : (
                    <div className="anal-activity-list">
                      {recentActivity.map((e: any) => (
                        <div key={e._id} className="anal-activity-item">
                          <span className="anal-activity-time">{formatTime(e.timestamp)}</span>
                          <span className="anal-activity-visitor">Visitor {e.visitorId?.slice(0, 6)}</span>
                          <span className="anal-activity-event">
                            {eventLabel[e.eventType] || e.eventType}
                            {e.target ? ` · ${e.target}` : ''}
                          </span>
                          <span className="anal-activity-page">{e.page}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: PER-PAGE WISE ANALYTICS                             */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'pages' && (
            <div className="anal-page-wise-view">
              {/* Page Selection Bar */}
              <div className="anal-page-selector-card">
                <div className="anal-selector-header">
                  <div>
                    <h3 className="anal-sub-heading">Select Portfolio Section to Inspect:</h3>
                    <p className="anal-hint">Choose any page below to visualize its traffic, engagement, bounce rate, and user interactions.</p>
                  </div>
                  <div className="anal-page-dropdown-wrap">
                    <label htmlFor="page-select" className="anal-dropdown-label">All Discovered URLs:</label>
                    <select
                      id="page-select"
                      className="anal-select"
                      value={selectedPage}
                      onChange={(e) => setSelectedPage(e.target.value)}
                    >
                      {pages.map((p) => {
                        const m = getPageInfo(p.path);
                        return (
                          <option key={p.path} value={p.path}>
                            {m.icon} {m.title} ({p.path}) - {p.views} views
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Quick Chips for Major Portfolio Pages */}
                <div className="anal-page-chips">
                  {Object.entries(PAGE_META).slice(0, 10).map(([path, meta]) => {
                    const match = pages.find((p) => p.path === path);
                    const views = match ? match.views : 0;
                    return (
                      <button
                        key={path}
                        className={`anal-page-chip ${selectedPage === path ? 'active' : ''}`}
                        onClick={() => setSelectedPage(path)}
                      >
                        <span className="chip-icon">{meta.icon}</span>
                        <span className="chip-title">{meta.title}</span>
                        <span className="chip-badge">{views} views</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {pageLoading ? <LoadingBar /> : pageDetail && (
                <>
                  {/* Selected Page Hero Header */}
                  <div className="anal-page-hero">
                    <div className="anal-page-hero-info">
                      <span className="hero-icon">{getPageInfo(pageDetail.path).icon}</span>
                      <div>
                        <h2 className="hero-title">{getPageInfo(pageDetail.path).title}</h2>
                        <span className="hero-path">URL: <code>{pageDetail.path}</code></span>
                      </div>
                    </div>
                    <div className="hero-share-pill">
                      Share of Portfolio Traffic: <strong>{overview?.totalPageViews ? Math.round((pageDetail.views / overview.totalPageViews) * 100) : 0}%</strong>
                    </div>
                  </div>

                  {/* Per-Page KPI Cards Grid */}
                  <div className="anal-grid-4">
                    <StatCard label="Page Views" value={pageDetail.views ?? 0} sub="Total hits on this page" color="#0078d4" />
                    <StatCard label="Unique Visitors" value={pageDetail.uniqueVisitors ?? 0} sub="Unique individuals reached" color="#00a4ef" />
                    <StatCard label="Avg Duration" value={`${pageDetail.avgDuration ?? 0}s`} sub="Time spent exploring" color="#7fba00" />
                    <StatCard label="Bounce Rate" value={`${pageDetail.bounceRate ?? 0}%`} sub="Single-page sessions" color="#ffb900" />
                    <StatCard label="Exit Rate" value={`${pageDetail.exitRate ?? 0}%`} sub="Exited from this page" color="#f25022" />
                    <StatCard label="Page Events" value={pageDetail.events?.reduce((acc: number, e: any) => acc + e.count, 0) ?? 0} sub="Clicks & downloads recorded" color="#8764b8" />
                  </div>

                  {/* Per-Page Visualizations Row 1: Trend over time & Comparative chart */}
                  <div className="anal-two-col">
                    {/* Traffic trend for this page (Area Chart) */}
                    <div className="anal-col-card">
                      <SectionTitle>Traffic Trend for {pageDetail.path} (Area Chart)</SectionTitle>
                      {pageDetail.trafficTrend?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={pageDetail.trafficTrend}>
                            <defs>
                              <linearGradient id="gPageViewsDetail" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0078d4" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="views" stroke="#0078d4" fill="url(#gPageViewsDetail)" name="Page Views" strokeWidth={2} />
                            <Area type="monotone" dataKey="uniqueVisitors" stroke="#7fba00" fill="#7fba00" name="Unique Visitors" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="anal-empty">No trend data recorded for this page in selected range.</p>
                      )}
                    </div>

                    {/* How this page ranks vs other pages (Bar Chart) */}
                    <div className="anal-col-card">
                      <SectionTitle>Page Views vs Other Sections (Bar Chart)</SectionTitle>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={comparativePagesData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                          <Tooltip />
                          <Bar dataKey="views" name="Views">
                            {comparativePagesData.map((entry, idx) => (
                              <Cell
                                key={idx}
                                fill={entry.isCurrent ? '#0078d4' : '#cbd5e1'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="anal-chart-legend">
                        <span className="legend-dot current" /> Selected Page ({selectedPage})
                        <span className="legend-dot other" /> Other Portfolio Pages
                      </div>
                    </div>
                  </div>

                  {/* Per-Page Visualizations Row 2: Referrers & Interactive Events */}
                  <div className="anal-two-col">
                    {/* Where users came from to reach this page */}
                    <div className="anal-col-card">
                      <SectionTitle>Referrer Sources to {pageDetail.path}</SectionTitle>
                      {pageDetail.referrers?.length > 0 ? (
                        <div className="anal-table-wrap">
                          <table className="anal-table">
                            <thead>
                              <tr>
                                <th>Referrer Source</th>
                                <th style={{ textAlign: 'right' }}>Hits</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pageDetail.referrers.map((r: any, idx: number) => (
                                <tr key={idx}>
                                  <td>
                                    <span className="anal-url-source">
                                      {r._id.startsWith('http') ? r._id.replace(/^https?:\/\//, '') : r._id}
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="anal-table-badge">{r.count}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="anal-empty">No external referrer recorded for this page.</p>
                      )}
                    </div>

                    {/* Events & clicks recorded on this page */}
                    <div className="anal-col-card">
                      <SectionTitle>User Actions & Clicks on {pageDetail.path}</SectionTitle>
                      {pageDetail.events?.length > 0 ? (
                        <div className="anal-table-wrap">
                          <table className="anal-table">
                            <thead>
                              <tr>
                                <th>Action / Interaction</th>
                                <th>Target</th>
                                <th style={{ textAlign: 'right' }}>Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pageDetail.events.map((ev: any, idx: number) => (
                                <tr key={idx}>
                                  <td>
                                    <strong>{eventLabel[ev.eventType] || ev.eventType}</strong>
                                  </td>
                                  <td>
                                    <span className="anal-target-tag">{ev.target || 'General'}</span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <span className="anal-table-badge">{ev.count}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="anal-empty">No interactive button/link clicks recorded on this page yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Full Comparative Pages Table */}
                  <div className="anal-chart-card">
                    <SectionTitle>All Portfolio Pages Performance Table</SectionTitle>
                    <div className="anal-table-wrap">
                      <table className="anal-table">
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Section</th>
                            <th>Path</th>
                            <th>Page Views</th>
                            <th>% Share</th>
                            <th>Unique Visitors</th>
                            <th>Avg Duration</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pages.map((p, idx) => {
                            const meta = getPageInfo(p.path);
                            const share = overview?.totalPageViews ? Math.round((p.views / overview.totalPageViews) * 100) : 0;
                            const isCurrent = p.path === selectedPage;
                            return (
                              <tr key={p.path} style={{ background: isCurrent ? 'var(--accent-soft)' : undefined }}>
                                <td>
                                  <span className="anal-rank-badge">#{idx + 1}</span>
                                </td>
                                <td>
                                  <span style={{ marginRight: 6 }}>{meta.icon}</span>
                                  <strong>{meta.title}</strong>
                                </td>
                                <td>
                                  <code>{p.path}</code>
                                </td>
                                <td>
                                  <strong>{p.views.toLocaleString()}</strong>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="anal-table-bar-track">
                                      <div className="anal-table-bar-fill" style={{ width: `${share}%` }} />
                                    </div>
                                    <span>{share}%</span>
                                  </div>
                                </td>
                                <td>{p.uniqueVisitors}</td>
                                <td>{p.avgDuration ? `${p.avgDuration}s` : '—'}</td>
                                <td>
                                  <button
                                    onClick={() => setSelectedPage(p.path)}
                                    className={`anal-inspect-btn ${isCurrent ? 'active' : ''}`}
                                  >
                                    {isCurrent ? 'Viewing' : 'Inspect'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
