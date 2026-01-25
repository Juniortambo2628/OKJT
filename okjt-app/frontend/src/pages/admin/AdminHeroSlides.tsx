import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Save, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { heroSlidesApi } from '../../api/client';
import type { AdminHeroSlide } from '../../types';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<AdminHeroSlide[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<AdminHeroSlide>>({
    label: '',
    text: '',
    subtitle: '',
    testimonial_text: '',
    testimonial_author: '',
    testimonial_company: '',
    overlay_opacity: 0.4,
    sort_order: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const data = await heroSlidesApi.getAll();
      setSlides(data);
      if (data.length > 0 && selectedId === null) {
        handleSelect(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleSelect = (slide: AdminHeroSlide) => {
    setSelectedId(slide.id);
    setForm({
      ...slide,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'sort_order' ? Number(value) : value,
    }));
  };

  const handleOverlayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setForm(prev => ({
      ...prev,
      overlay_opacity: value,
    }));
  };

  const handleSave = async () => {
    if (!form.text || !form.label) return;
    setIsSaving(true);
    try {
      if (selectedId) {
        const updated = await heroSlidesApi.update(selectedId, form);
        setSlides(slides.map(s => (s.id === updated.id ? updated : s)));
        handleSelect(updated);
      } else {
        const created = await heroSlidesApi.create(form);
        setSlides([...slides, created]);
        handleSelect(created);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm({
      label: '',
      text: '',
      subtitle: '',
      testimonial_text: '',
      testimonial_author: '',
      testimonial_company: '',
      overlay_opacity: 0.4,
      sort_order: slides.length,
    });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Delete this hero slide?')) return;

    await heroSlidesApi.delete(selectedId);
    const remaining = slides.filter(s => s.id !== selectedId);
    setSlides(remaining);
    if (remaining.length > 0) {
      handleSelect(remaining[0]);
    } else {
      handleNew();
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBackground(true);
    try {
      const updated = await heroSlidesApi.uploadBackground(selectedId, file);
      setSlides(slides.map(s => (s.id === updated.id ? updated : s)));
      handleSelect(updated);
    } catch (error) {
      console.error('Failed to upload background:', error);
      alert('Failed to upload background image. Please check the file size (max 20MB) and format.');
    } finally {
      setIsUploadingBackground(false);
      e.target.value = '';
    }
  };

  return (
    <AdminLayout title="Hero Slides" subtitle="Manage homepage hero slide backgrounds and text">
      <div className="admin-two-column">
        <div className="admin-list-column">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>
                <ImageIcon size={18} />
                Slides
              </h2>
              <button className="admin-btn-secondary" type="button" onClick={handleNew}>
                <Plus size={16} />
                New Slide
              </button>
            </div>
            <div className="admin-list-body">
              {isLoading ? (
                <p>Loading slides...</p>
              ) : slides.length === 0 ? (
                <p className="admin-form-hint">No slides yet. Create your first hero slide.</p>
              ) : (
                <ul className="admin-simple-list">
                  {slides.map(slide => (
                    <li
                      key={slide.id}
                      className={selectedId === slide.id ? 'active' : ''}
                      onClick={() => handleSelect(slide)}
                    >
                      <span className="title">{slide.label}</span>
                      <span className="meta">#{slide.sort_order} · {slide.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="admin-detail-column">
          <motion.form
            className="admin-card admin-form-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="admin-card-header">
              <h2>
                <SlidersHorizontal size={18} />
                Slide Details
              </h2>
              {selectedId && (
                <button
                  type="button"
                  className="admin-btn-danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>

            <div className="admin-form-content">
              <div className="admin-form-field">
                <label>Label</label>
                <input
                  type="text"
                  name="label"
                  value={form.label || ''}
                  onChange={handleChange}
                  className="admin-settings-input"
                  placeholder="E.g., Speed"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Main Text</label>
                <textarea
                  name="text"
                  value={form.text || ''}
                  onChange={handleChange}
                  className="admin-settings-input"
                  placeholder="Fast, responsive, accessible."
                  rows={3}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Subtitle</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle || ''}
                  onChange={handleChange}
                  className="admin-settings-input"
                  placeholder="Performance and accessibility first."
                />
              </div>

              <div className="admin-form-divider">
                <h3>Testimonial (Optional)</h3>
                <p className="admin-form-hint">Display a client testimonial on this slide</p>
              </div>

              <div className="admin-form-field">
                <label>Testimonial Text</label>
                <textarea
                  name="testimonial_text"
                  value={form.testimonial_text || ''}
                  onChange={handleChange}
                  className="admin-settings-input"
                  placeholder="What the client said about your service..."
                  rows={3}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Author Name</label>
                  <input
                    type="text"
                    name="testimonial_author"
                    value={form.testimonial_author || ''}
                    onChange={handleChange}
                    className="admin-settings-input"
                    placeholder="John Doe"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Company</label>
                  <input
                    type="text"
                    name="testimonial_company"
                    value={form.testimonial_company || ''}
                    onChange={handleChange}
                    className="admin-settings-input"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    name="sort_order"
                    value={form.sort_order ?? 0}
                    onChange={handleChange}
                    className="admin-settings-input"
                    min={0}
                  />
                  <span className="admin-form-hint">Lower numbers appear earlier in the hero sequence.</span>
                </div>

                <div className="admin-form-field">
                  <label>Overlay Intensity</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={form.overlay_opacity ?? 0.4}
                    onChange={handleOverlayChange}
                  />
                  <span className="admin-form-hint">
                    Current: {(form.overlay_opacity ?? 0.4).toFixed(2)} – higher values darken the background image.
                  </span>
                </div>
              </div>

              <div className="admin-form-field">
                <label>Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="admin-settings-input"
                  disabled={!selectedId || isUploadingBackground}
                />
                <span className="admin-form-hint">
                  {isUploadingBackground ? 'Uploading background image...' : 'Upload a background image for this slide. Recommended 1920x1080 or higher.'}
                </span>

                {form.image_url && (
                  <div className="admin-form-image-preview">
                    <img src={form.image_url} alt={form.label || 'Hero slide'} />
                  </div>
                )}
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Slide
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </AdminLayout>
  );
}


