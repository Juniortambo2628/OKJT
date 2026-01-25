import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Save, Plus, Trash2, Users, ExternalLink } from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { trustedClientsApi } from '../../api/client';
import type { TrustedClient } from '../../types';

export default function AdminTrustedClients() {
  const [clients, setClients] = useState<TrustedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrustedClient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await trustedClientsApi.getAll();
      setClients(data);
      if (data.length > 0 && !selected) {
         handleSelect(data[0]);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (client: TrustedClient) => {
    setSelected(client);
    setFormData({
      name: client.name,
      website_url: client.website_url || '',
      is_active: client.is_active,
    });
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setSaving(true);
      if (selected?.id) {
        const updated = await trustedClientsApi.update(selected.id, formData);
        setClients(clients.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
        setMessage('Client updated successfully');
      } else {
        const newClient = await trustedClientsApi.create(formData);
        setClients([...clients, newClient]);
        setSelected(newClient);
        setMessage('Client created successfully');
      }
    } catch (error) {
      setMessage('Failed to save client');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setSelected({ id: 0 } as TrustedClient);
    setFormData({
      name: '',
      website_url: '',
      is_active: true,
    });
    setMessage('');
    // Focus logic could go here if needed
  };

  const handleDelete = async () => {
    if (!selected?.id || !confirm('Delete this client?')) return;

    try {
      await trustedClientsApi.delete(selected.id);
      const remaining = clients.filter(c => c.id !== selected.id);
      setClients(remaining);
      if (remaining.length > 0) {
        handleSelect(remaining[0]);
      } else {
        handleNew();
      }
      setMessage('Client deleted');
    } catch (error) {
      setMessage('Failed to delete client');
      console.error(error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selected?.id || !e.target.files?.[0]) return;

    try {
      setSaving(true);
      const updated = await trustedClientsApi.uploadLogo(selected.id, e.target.files[0]);
      setClients(clients.map(c => c.id === updated.id ? updated : c));
      setSelected(updated); // Update selected to show new logo
      setMessage('Logo uploaded successfully');
    } catch (error) {
      setMessage('Failed to upload logo');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Trusted Clients" subtitle="Manage the client logos displayed in the carousel">
      <div className="admin-two-column">
        {/* Left Column: List */}
        <div className="admin-list-column">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>
                <Users size={18} />
                Clients
              </h2>
              <button className="admin-btn-secondary" onClick={handleNew}>
                <Plus size={16} />
                New Client
              </button>
            </div>
            
            <div className="admin-list-body">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : clients.length === 0 ? (
                 <div className="admin-form-hint">No clients yet. Add your first trusted client.</div>
              ) : (
                <ul className="admin-simple-list">
                  {clients.map((client) => (
                    <li
                      key={client.id}
                      className={selected?.id === client.id ? 'active' : ''}
                      onClick={() => handleSelect(client)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                           {client.logo_url ? (
                             <img src={client.logo_url} alt="" className="w-full h-full object-contain p-1" />
                           ) : (
                             <ImageIcon size={14} className="text-gray-400" />
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className="title text-sm font-medium">{client.name}</span>
                          <span className="meta text-xs text-gray-500">{client.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="admin-detail-column">
          <motion.form
            className="admin-card admin-form-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSave}
          >
            <div className="admin-card-header">
              <h2>{selected?.id ? 'Edit Client' : 'New Client'}</h2>
              {selected?.id ? (
                <button type="button" className="admin-btn-danger" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Delete
                </button>
              ) : null}
            </div>

            <div className="admin-form-content">
              {/* Logo Upload Section */}
              {selected?.id ? (
                <div className="admin-form-field">
                  <label>Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {selected.logo_url ? (
                        <img src={selected.logo_url} alt={selected.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                       <button
                        type="button"
                        className="admin-btn-secondary text-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Logo
                      </button>
                      <span className="text-xs text-gray-500">Recommended: SVG or PNG using transparency</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              ) : (
                 <div className="admin-form-hint mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    Save the client details first to upload a logo.
                 </div>
              )}

              <div className="admin-form-field">
                <label htmlFor="name">Client Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="admin-settings-input"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label htmlFor="website_url">Website URL (Optional)</label>
                <div className="relative">
                  <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="admin-settings-input pl-10" // added padding-left for icon
                    style={{ paddingLeft: '2.5rem' }} 
                  />
                </div>
              </div>

              <div className="admin-form-field">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">Display in carousel</span>
                </label>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('should') || message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={saving || !formData.name}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </AdminLayout>
  );
}
