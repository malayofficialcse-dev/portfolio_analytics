import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, getAuthHeaders, useRequireAuth } from '@/utils/adminUtils';
import { AdminSidebar } from '@/components/AdminSidebar';

type PurchaseLink = {
  url: string;
  label: string;
  logoUrl?: string;
  logoFile?: File;
};

type Book = {
  _id?: string;
  title: string;
  authors: string[];
  description: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  pdfUrls?: string[];
  purchaseLinks: PurchaseLink[];
  type: 'full-book' | 'chapter';
  chapterTitle?: string;
  chapterNumber?: number;
};

export function BooksAdminPage() {
  useRequireAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [authorsString, setAuthorsString] = useState('');
  const [description, setDescription] = useState('');
  const [publisher, setPublisher] = useState('');
  const [pubDate, setPubDate] = useState('');
  const [isbn, setIsbn] = useState('');
  const [type, setType] = useState<'full-book' | 'chapter'>('full-book');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  
  // Files
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);
  const [pdfsFiles, setPdfsFiles] = useState<FileList | null>(null);

  // Purchase links
  const [purchaseLinks, setPurchaseLinks] = useState<PurchaseLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkLogo, setNewLinkLogo] = useState<File | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/books`);
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching books', err);
      setError('Failed to fetch books list.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingId(book._id || null);
    setTitle(book.title);
    setAuthorsString(book.authors.join(', '));
    setDescription(book.description);
    setPublisher(book.publisher || '');
    setPubDate(book.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : '');
    setIsbn(book.isbn || '');
    setType(book.type || 'full-book');
    setChapterTitle(book.chapterTitle || '');
    setChapterNumber(book.chapterNumber ? String(book.chapterNumber) : '');
    setPurchaseLinks(book.purchaseLinks || []);
    // Reset file selections
    setCoverImageFile(null);
    setImagesFiles(null);
    setPdfsFiles(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setAuthorsString('');
    setDescription('');
    setPublisher('');
    setPubDate('');
    setIsbn('');
    setType('full-book');
    setChapterTitle('');
    setChapterNumber('');
    setPurchaseLinks([]);
    setCoverImageFile(null);
    setImagesFiles(null);
    setPdfsFiles(null);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setNewLinkLogo(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book/chapter?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${API_BASE}/books/${id}`, getAuthHeaders());
      setSuccess('Book deleted successfully.');
      fetchBooks();
    } catch (err: any) {
      console.error('Error deleting book', err);
      setError(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  const handleAddLink = () => {
    if (!newLinkUrl || !newLinkLabel) return;
    const newLink: PurchaseLink = {
      url: newLinkUrl,
      label: newLinkLabel
    };
    if (newLinkLogo) {
      newLink.logoFile = newLinkLogo;
    }
    setPurchaseLinks([...purchaseLinks, newLink]);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setNewLinkLogo(null);
  };

  const handleRemoveLink = (index: number) => {
    const list = [...purchaseLinks];
    list.splice(index, 1);
    setPurchaseLinks(list);
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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('publisher', publisher);
    if (pubDate) formData.append('publicationDate', pubDate);
    formData.append('isbn', isbn);
    formData.append('type', type);
    
    if (type === 'chapter') {
      formData.append('chapterTitle', chapterTitle);
      if (chapterNumber) formData.append('chapterNumber', chapterNumber);
    }

    authorsArray.forEach((author) => formData.append('authors', author));

    // Serialize links metadata without logoFile property to prevent circular/extra content issues
    const linksMetadata = purchaseLinks.map((link) => ({
      url: link.url,
      label: link.label,
      logoUrl: link.logoUrl
    }));
    formData.append('purchaseLinks', JSON.stringify(linksMetadata));

    // Append link logos
    purchaseLinks.forEach((link, idx) => {
      if (link.logoFile) {
        formData.append(`logo_${idx}`, link.logoFile);
      }
    });

    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

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
        await axios.put(`${API_BASE}/books/${editingId}`, formData, config);
        setSuccess('Book updated successfully.');
      } else {
        await axios.post(`${API_BASE}/books`, formData, config);
        setSuccess('Book added successfully.');
      }

      handleCancel();
      fetchBooks();
    } catch (err: any) {
      console.error('Error saving book', err);
      setError(err.response?.data?.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Books & Chapters Editor</h1>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Book / Chapter' : 'Add Book / Chapter'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="title">Book Title</label>
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
                    placeholder="e.g. Malay Maity, John Smith"
                    required
                  />
                </div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="publisher">Publisher</label>
                  <input
                    type="text"
                    id="publisher"
                    className="admin-input"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                  />
                </div>

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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="isbn">ISBN</label>
                  <input
                    type="text"
                    id="isbn"
                    className="admin-input"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="e.g. 978-3-16-148410-0"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="type">Entry Type</label>
                  <select
                    id="type"
                    className="admin-select"
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                  >
                    <option value="full-book">Full Book</option>
                    <option value="chapter">Book Chapter</option>
                  </select>
                </div>
              </div>

              {type === 'chapter' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div className="admin-form-group">
                    <label htmlFor="chapterTitle">Chapter Title</label>
                    <input
                      type="text"
                      id="chapterTitle"
                      className="admin-input"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      required={type === 'chapter'}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="chapterNumber">Chapter Number</label>
                    <input
                      type="number"
                      id="chapterNumber"
                      className="admin-input"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Purchase Links Section */}
              <div style={{ padding: '16px', background: 'var(--panel-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>Where to Purchase / Read Links</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
                  <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Link Label</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      placeholder="e.g. Amazon, Springer"
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
                    <label>Store Logo Icon (Optional)</label>
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

                {purchaseLinks.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)' }}>
                    {purchaseLinks.map((link, idx) => (
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="admin-form-group">
                  <label htmlFor="coverImage">Book Cover Image</label>
                  <input
                    type="file"
                    id="coverImage"
                    className="admin-input"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="images">Additional Images</label>
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
                  <label htmlFor="pdfs">Book PDFs (Sample / Read chapters)</label>
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
                  {saving ? 'Saving...' : (editingId ? 'Update Book' : 'Add Book')}
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
            <h2 style={{ marginTop: 0 }}>Existing Books & Chapters</h2>
            {loading ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading books...</p>
            ) : books.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No books added yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Authors</th>
                    <th>Type</th>
                    <th style={{ width: '160px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl} alt={book.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>No Cover</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{book.title}</td>
                      <td>{book.authors.join(', ')}</td>
                      <td>
                        <span className="admin-badge admin-badge-success" style={{ background: book.type === 'chapter' ? '#e8f2fd' : '#e6f4ea', color: book.type === 'chapter' ? '#0078d4' : '#137333' }}>
                          {book.type === 'chapter' ? 'Chapter' : 'Full Book'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleEdit(book)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleDelete(book._id!)}
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
