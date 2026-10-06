export type PageCard = {
  title: string;
  body: string;
};

export type PageStat = {
  label: string;
  value: string;
};

export type PageContent = {
  eyebrow: string;
  title: string;
  summary: string;
  statLine?: string;
  stats?: PageStat[];
  cards?: PageCard[];
  note?: string;
};

export const publicNav = [
  { to: '/', label: 'Home' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/research', label: 'Research' },
  { to: '/books', label: 'Books' },
  { to: '/events', label: 'Events' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/academic', label: 'Academics' }
];

export const adminNav = [
  { to: '/admin/dashboard', label: 'Admin' },
  { to: '/admin/login', label: 'Login' },
  { to: '/admin/register', label: 'Register' },
  { to: '/admin/profile', label: 'Profile' },
];

export const publicPages: Record<string, PageContent> = {
  skills: {
    eyebrow: 'Capabilities',
    title: 'Skills and tools',
    summary: 'A clear view of the stack, with no visual noise and no overdesigned effects.',
    statLine: 'Front-end, back-end, and content workflow support',
    stats: [
      { label: 'Interface work', value: 'React' },
      { label: 'Application logic', value: 'TypeScript' },
      { label: 'Server work', value: 'Node' },
    ],
    cards: [
      { title: 'Frontend', body: 'React, component systems, responsive layout, and clean state flow.' },
      { title: 'Backend', body: 'Express, REST APIs, validation, and database integration.' },
      { title: 'Workflow', body: 'Simple handoff, predictable structure, and maintainable code.' },
    ],
  },
  experience: {
    eyebrow: 'Experience',
    title: 'Work and practice',
    summary: 'A concise timeline for work, internships, and hands-on delivery.',
    cards: [
      { title: 'Role overview', body: 'Focus on practical delivery, collaboration, and shipping reliable UI.' },
      { title: 'Process', body: 'Plan, build, review, and keep the interface easy to understand.' },
      { title: 'Outcome', body: 'Readable systems that feel calm and professional.' },
    ],
  },
  projects: {
    eyebrow: 'Projects',
    title: 'Selected work',
    summary: 'A small gallery of focused projects presented with simple cards and strong spacing.',
    stats: [
      { label: 'Featured builds', value: '03' },
      { label: 'Case studies', value: 'Clean' },
      { label: 'Presentation style', value: 'Minimal' },
    ],
    cards: [
      { title: 'Portfolio system', body: 'A polished homepage and sections for showcasing work.' },
      { title: 'Admin views', body: 'Simple content management pages with clear structure.' },
      { title: 'Reusable layout', body: 'Shared sections, cards, and navigation patterns.' },
    ],
  },
  research: {
    eyebrow: 'Research',
    title: 'Notes and writing',
    summary: 'A quiet place for research entries, observations, and summaries.',
    cards: [
      { title: 'Research note', body: 'Short, structured insights that are easy to scan.' },
      { title: 'Reading list', body: 'Books, papers, and references arranged with restraint.' },
      { title: 'Updates', body: 'Useful context without the clutter.' },
    ],
  },
  books: {
    eyebrow: 'Books',
    title: 'Reading list',
    summary: 'A simple collection page for books and resources.',
    cards: [
      { title: 'Currently reading', body: 'A shortlist with title, author, and one-line reflection.' },
      { title: 'Completed', body: 'Finished reads grouped in a calm, readable layout.' },
      { title: 'References', body: 'Useful books for design, engineering, and product thinking.' },
    ],
  },
  events: {
    eyebrow: 'Events',
    title: 'Talks and sessions',
    summary: 'A modest event layout for workshops, presentations, and public appearances.',
    cards: [
      { title: 'Upcoming', body: 'Upcoming sessions and speaking slots.' },
      { title: 'Past events', body: 'Past talks and the key topics covered.' },
      { title: 'Highlights', body: 'Simple labels for date, place, and theme.' },
    ],
  },
  certificates: {
    eyebrow: 'Certificates',
    title: 'Proof and credentials',
    summary: 'A professional display for certificates without decorative clutter.',
    cards: [
      { title: 'Verified learning', body: 'Certificates shown as concise evidence of training.' },
      { title: 'Professional badges', body: 'A clean list of relevant achievement records.' },
      { title: 'Attachments', body: 'Space for file previews or links when needed.' },
    ],
  },
  academic: {
    eyebrow: 'Academic',
    title: 'Education history',
    summary: 'Clear academic details with a professional, understated presentation.',
    cards: [
      { title: 'School and college', body: 'Education milestones in chronological order.' },
      { title: 'Focus areas', body: 'Subjects, specialization, and relevant learning themes.' },
      { title: 'Achievements', body: 'Awards and results shown without visual noise.' },
    ],
  },
};

export const adminPages: Record<string, PageContent> = {
  login: {
    eyebrow: 'Admin access',
    title: 'Login',
    summary: 'A simple sign-in view for admin work.',
    cards: [
      { title: 'Email', body: 'Use your admin email to continue.' },
      { title: 'Password', body: 'Enter the password and authenticate.' },
      { title: 'Session', body: 'Keep the session secure and short-lived.' },
    ],
  },
  register: {
    eyebrow: 'Admin access',
    title: 'Register',
    summary: 'Create a new admin account with a minimal form layout.',
    cards: [
      { title: 'Identity', body: 'Name, email, and role fields.' },
      { title: 'Security', body: 'Password and confirmation fields.' },
      { title: 'Review', body: 'Confirm details before storing the account.' },
    ],
  },
  dashboard: {
    eyebrow: 'Admin dashboard',
    title: 'Dashboard',
    summary: 'A compact view for managing the portfolio content.',
    stats: [
      { label: 'Profile', value: 'Live' },
      { label: 'Content', value: 'Editable' },
      { label: 'Status', value: 'Ready' },
    ],
    cards: [
      { title: 'Content overview', body: 'Quick access to every managed section.' },
      { title: 'Publishing', body: 'Update the portfolio with consistent formatting.' },
      { title: 'Maintenance', body: 'Keep entries organized and easy to scan.' },
    ],
  },
  profile: {
    eyebrow: 'Admin profile',
    title: 'Profile',
    summary: 'Manage the main identity, bio, links, and portrait fields.',
    cards: [
      { title: 'Identity', body: 'Name, title, and location.' },
      { title: 'Links', body: 'GitHub, LinkedIn, and contact details.' },
      { title: 'Media', body: 'Profile image and banner handling.' },
    ],
  },
  skills: {
    eyebrow: 'Admin content',
    title: 'Skills editor',
    summary: 'Edit skills in a tidy list-based layout.',
    cards: [
      { title: 'Add skill', body: 'Create a skill with name, category, and level.' },
      { title: 'Sort skill', body: 'Keep related skills grouped and ordered.' },
      { title: 'Publish', body: 'Save and refresh the public page.' },
    ],
  },
  projects: {
    eyebrow: 'Admin content',
    title: 'Projects editor',
    summary: 'Maintain projects with direct, uncluttered controls.',
    cards: [
      { title: 'Project detail', body: 'Title, stack, summary, and links.' },
      { title: 'Media', body: 'Images, thumbnails, and preview assets.' },
      { title: 'Visibility', body: 'Choose what appears publicly.' },
    ],
  },
  research: {
    eyebrow: 'Admin content',
    title: 'Research editor',
    summary: 'Manage research entries using a simple admin layout.',
    cards: [
      { title: 'Entry', body: 'Add title, date, and abstract.' },
      { title: 'Reference', body: 'Attach links or citations.' },
      { title: 'Review', body: 'Keep text concise and well structured.' },
    ],
  },
  books: {
    eyebrow: 'Admin content',
    title: 'Books editor',
    summary: 'Add or update books with a lightweight form structure.',
    cards: [
      { title: 'Book details', body: 'Title, author, status, and note.' },
      { title: 'Categorize', body: 'Reading, completed, or reference.' },
      { title: 'Publish', body: 'Save changes with confidence.' },
    ],
  },
  events: {
    eyebrow: 'Admin content',
    title: 'Events editor',
    summary: 'Track upcoming and past events cleanly.',
    cards: [
      { title: 'Schedule', body: 'Date, title, place, and summary.' },
      { title: 'Evidence', body: 'Photos, links, or recordings.' },
      { title: 'Archive', body: 'Keep a tidy record of sessions.' },
    ],
  },
  certificates: {
    eyebrow: 'Admin content',
    title: 'Certificates editor',
    summary: 'A structured place for credentials and proof of achievement.',
    cards: [
      { title: 'Upload', body: 'File, title, and issuer fields.' },
      { title: 'Status', body: 'Keep verified items visible.' },
      { title: 'Archive', body: 'Hide outdated credentials when needed.' },
    ],
  },
  experiences: {
    eyebrow: 'Admin content',
    title: 'Experiences editor',
    summary: 'Maintain work history in chronological order.',
    cards: [
      { title: 'Role', body: 'Company, title, and duration.' },
      { title: 'Summary', body: 'A short professional summary.' },
      { title: 'Highlights', body: 'Key outcomes and responsibilities.' },
    ],
  },
  academics: {
    eyebrow: 'Admin content',
    title: 'Academics editor',
    summary: 'Edit academic background with a compact form layout.',
    cards: [
      { title: 'Institution', body: 'School, college, or degree details.' },
      { title: 'Performance', body: 'Grades, percentages, or honors.' },
      { title: 'Timeline', body: 'Keep entries in order.' },
    ],
  },
};
