import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  FileText,
  Star,
  Loader2,
  User,
  Plus,
  X
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { portfolioApi, trustedClientsApi } from '../../api/client';
import type { PortfolioProject, PortfolioMedia, TrustedClient } from '../../types';

// FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// Register plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize
);

const categories = [
  'Web Development',
  'Web Design',
  'Web Application',
  'Dashboard',
  'E-Commerce',
  'Mobile App',
  'Branding',
  'Other'
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function AdminPortfolioEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<PortfolioMedia[]>([]);
  // Use 'any' for FilePond files to avoid strict typing issues with the library
  const [files, setFiles] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<PortfolioProject>>({
    title: '',
    description: '',
    category: 'Web Development',
    client_name: '',
    client_logo: '',
    image_url: '',
    project_url: '',
    status: 'pending',
    featured: false,
    sort_order: 0,
  });

  const [clients, setClients] = useState<TrustedClient[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', website_url: '' });
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  useEffect(() => {
    loadClients();
    if (isEditing) {
      loadProject();
    }
  }, [id]);

  const loadClients = async () => {
    try {
      const data = await trustedClientsApi.getAll();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    setIsCreatingClient(true);
    try {
      const client = await trustedClientsApi.create(newClient);
      setClients(prev => [...prev, client]);
      // Automatically select the new client
      setFormData(prev => ({
        ...prev,
        client_name: client.name,
        client_logo: client.logo_url || ''
      }));
      setIsClientModalOpen(false);
      setNewClient({ name: '', website_url: '' });
    } catch (err) {
      console.error('Failed to create client', err);
      alert('Failed to create client');
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleClientChange = (clientIdOrName: string) => {
    if (clientIdOrName === 'new') {
      setIsClientModalOpen(true);
      return;
    }

    if (!clientIdOrName) {
      setFormData(prev => ({ ...prev, client_name: '', client_logo: '' }));
      return;
    }

    const client = clients.find(c => c.name === clientIdOrName);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_name: client.name,
        client_logo: client.logo_url || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, client_name: clientIdOrName }));
    }
  };

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const project = await portfolioApi.getById(Number(id));
      if (project) {
        setFormData(project);
        // Load gallery media
        try {
          const media = await portfolioApi.getMedia(Number(id));
          setGallery(media);
        } catch (galleryError) {
          // Fail silently for gallery to avoid blocking editor
          console.error('Failed to load gallery media', galleryError);
        }
      } else {
        setError('Project not found');
      }
    } catch (error) {
      setError('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!isEditing || !id) return;
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await portfolioApi.deleteMedia(Number(id), mediaId);
      setGallery((prev) => prev.filter((m) => m.id !== mediaId));

      // Reload project to sync primary image if it changed
      const updated = await portfolioApi.getById(Number(id));
      if (updated) {
        setFormData(updated);
      }
    } catch (deleteError) {
      console.error('Failed to delete image', deleteError);
      setError('Failed to delete image. Please try again.');
    }
  };

  const handleSetPrimary = async (mediaId: number) => {
    if (!isEditing || !id) return;

    try {
      await portfolioApi.setPrimaryImage(Number(id), mediaId);
      const updated = await portfolioApi.getById(Number(id));
      if (updated) {
        setFormData(updated);
      }
      setGallery((prev) =>
        prev.map((m) => (m.id === mediaId ? { ...m, is_primary: true } : { ...m, is_primary: false }))
      );
    } catch (primaryError) {
      console.error('Failed to set primary image', primaryError);
      setError('Failed to set primary image. Please try again.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (isEditing) {
          // For editing, use JSON as usual. Files are uploaded separately if needed.
          // In a fuller implementation, FilePond could handle new uploads here too,
          // but typically 'edit' mode uses the existing separate upload logic or API endpoint.
          // For now, assume editing text fields via JSON update.
          // If user added files to FilePond in Edit mode, we should ideally upload them.
          // But existing logic supported instant upload via 'handleImageUpload' (previous code).
          // Let's rely on the separate FilePond logic for edits OR keep using it for creation mainly.
          
          await portfolioApi.update(Number(id), formData);
          
          // If files present in FilePond state during edit, upload them one by one
          if (files.length > 0) {
             // Parallel upload logic could go here, or we can instruct user to use the gallery below
          }
      } else {
        // Create with FormData to support simultaneous file upload
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            return;
          }
          
          if (Array.isArray(value)) {
             value.forEach(item => {
                 data.append(`${key}[]`, item.toString());
             });
          } else if (typeof value === 'boolean') {
             data.append(key, value ? '1' : '0');
          } else {
             data.append(key, value.toString());
          }
        });
        
        // Append file if exists
        if (files.length > 0) {
           data.append('image', files[0].file);
        }

        // We might need to cast to any if the create method strictly expects PortfolioProject object
        await portfolioApi.create(data as any); 
      }
      navigate('/admin/portfolio');
    } catch (err) {
      console.error(err);
      setError('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Creating a specialized uploader for EDIT mode to handle uploads instantly
  const handleEditUpload = async (fileItems: any[]) => {
      // Logic for instant upload in Edit mode
      if (!isEditing || !id) {
          setFiles(fileItems); // Just update state for create mode
          return;
      }
      
      // If we are editing, and new files are added, upload them immediately
      // Filter for new files only (FilePond might keep existing ones if we preloaded them)
      const newFiles = fileItems.map(item => item.file);
      
      // Upload last added file (simple approach for now)
      if (newFiles.length > files.length) { // A file was added
           const addedFile = newFiles[newFiles.length - 1];
           try {
             const media = await portfolioApi.uploadMedia(Number(id), addedFile);
             setGallery((prev) => [media, ...prev]);
             // Update primary if needed
             if (!formData.image_url) {
                const updated = await portfolioApi.getById(Number(id));
                if (updated) setFormData(updated);
             }
           } catch(e) {
               console.error("Upload failed", e);
               setError("Upload failed");
           }
      }
      
      setFiles(fileItems);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading..." subtitle="Please wait">
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading project...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={isEditing ? 'Edit Project' : 'Add New Project'} 
      subtitle={isEditing ? `Editing: ${formData.title}` : 'Create a new portfolio project'}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/portfolio')}
        className="admin-back-btn"
      >
        <ArrowLeft size={20} />
        Back to Portfolio
      </button>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="admin-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {error && (
          <div className="admin-form-error">
            {error}
          </div>
        )}

        <div className="admin-form-grid">
          {/* Left Column - Main Fields */}
          <div className="admin-card admin-form-card">
            <div className="admin-card-header">
              <h2>
                <FileText size={18} />
                Project Details
              </h2>
            </div>
            <div className="admin-form-content">
              {/* Title */}
              <div className="admin-form-field">
                <label htmlFor="title">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g., E-Commerce Platform"
                  required
                  className="admin-settings-input"
                />
              </div>

              {/* Description */}
              <div className="admin-form-field">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the project, technologies used, and outcomes..."
                  rows={5}
                  required
                  className="admin-settings-input"
                />
              </div>

              {/* Row: Category & Status */}
              <div className="admin-form-row">
                <div className="admin-form-field">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="admin-select full"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="admin-select full"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Name Selection */}
              <div className="admin-form-field">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="client_name" className="m-0">
                    <User size={14} className="inline mr-1" />
                    Client
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus size={10} />
                    New Client
                  </button>
                </div>
                <select
                  id="client_name"
                  name="client_name"
                  value={formData.client_name || ''}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="admin-select full"
                >
                  <option value="">No Client / Individual</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
                  <option value="new">+ Add New Client...</option>
                </select>
                {formData.client_logo && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={formData.client_logo} alt="Logo" className="w-6 h-6 object-contain" />
                    <span className="text-xs text-gray-500">Client logo selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Media & Settings */}
          <div className="admin-form-sidebar">
            {/* Image & Gallery */}
            <div className="admin-card admin-form-card">
              <div className="admin-card-header">
                <h2>
                  <ImageIcon size={18} />
                  Project Images
                </h2>
              </div>
              <div className="admin-form-content">
                
                {/* FilePond Uploader */}
                <div className="admin-form-field">
                    <label>Upload Image</label>
                    <FilePond
                        files={files}
                        onupdatefiles={handleEditUpload}
                        allowMultiple={false}
                        maxFiles={1}
                        name="image"
                        labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
                        acceptedFileTypes={['image/*']}
                        maxFileSize="10MB"
                    />
                     <span className="admin-form-hint">
                      This will be the primary project image.
                    </span>
                </div>

                {/* Primary Image URL (ReadOnly Display mostly) */}
                {formData.image_url && (
                    <div className="admin-form-field">
                      <label>Current Primary Image</label>
                      <div className="p-2 border border-border rounded bg-muted/30">
                          <img src={formData.image_url} alt="Current Primary" className="w-full h-auto rounded max-h-40 object-cover" />
                      </div>
                    </div>
                )}
                
                {/* Gallery Grid (Edit Mode Only) */}
                {isEditing && gallery.length > 0 && (
                  <div className="admin-gallery-grid mt-4">
                    {gallery.map((media) => (
                      <div key={media.id} className="admin-gallery-item">
                        <div className="admin-gallery-image-wrapper">
                          <img src={media.thumb_url || media.url} alt={media.file_name} />
                          {media.is_primary && (
                            <span className="admin-gallery-badge">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="admin-gallery-actions">
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => handleSetPrimary(media.id)}
                            title="Set as Primary"
                          >
                            <Star size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn danger"
                            onClick={() => handleDeleteMedia(media.id)}
                            title="Delete Image"
                          >
                            <Loader2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="admin-card admin-form-card">
              <div className="admin-card-header">
                <h2>
                  <LinkIcon size={18} />
                  Links
                </h2>
              </div>
              <div className="admin-form-content">
                <div className="admin-form-field">
                  <label htmlFor="project_url">Project URL (optional)</label>
                  <input
                    type="url"
                    id="project_url"
                    name="project_url"
                    value={formData.project_url || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="admin-settings-input"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="admin-card admin-form-card">
              <div className="admin-card-header">
                <h2>
                  <Tag size={18} />
                  Settings
                </h2>
              </div>
              <div className="admin-form-content">
                <div className="admin-form-field">
                  <label htmlFor="sort_order">Sort Order</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    value={formData.sort_order || 0}
                    onChange={handleChange}
                    min="0"
                    className="admin-settings-input"
                  />
                  <span className="admin-form-hint">Lower numbers appear first</span>
                </div>

                <div className="admin-form-checkbox">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured || false}
                    onChange={handleChange}
                  />
                  <label htmlFor="featured">
                    <Star size={16} className={formData.featured ? 'text-amber' : ''} />
                    Feature this project
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="admin-form-actions">
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn-primary"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/portfolio')}
            className="admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </motion.form>

      {/* New Client Modal */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-backdrop" onClick={() => setIsClientModalOpen(false)} />
            <motion.div 
              className="admin-modal max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="admin-modal-header">
                <h2>Add New Client</h2>
                <button onClick={() => setIsClientModalOpen(false)} className="admin-modal-close">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddClient} className="admin-modal-content space-y-4">
                <div className="admin-form-field">
                  <label>Client Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                    placeholder="E.g. Apple Inc."
                    className="admin-settings-input"
                  />
                </div>
                <div className="admin-form-field">
                  <label>Website URL (optional)</label>
                  <input 
                    type="url" 
                    value={newClient.website_url}
                    onChange={e => setNewClient({...newClient, website_url: e.target.value})}
                    placeholder="https://..."
                    className="admin-settings-input"
                  />
                </div>
                <div className="admin-modal-actions pt-4">
                  <button 
                    type="submit" 
                    disabled={isCreatingClient}
                    className="admin-btn-primary flex-1"
                  >
                    {isCreatingClient ? 'Creating...' : 'Create Client'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsClientModalOpen(false)}
                    className="admin-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
                <p className="admin-form-hint text-center">
                  You can upload the client logo from the Trusted Clients page after creating it.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
