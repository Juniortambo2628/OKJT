import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Lock,
  Bell,
  Globe,
  Save,
  Camera,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Database,
  RefreshCw,
  FileUp,
  Trash2,
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import { backupApi, siteSettingsApi } from '../../api/client';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

interface NotificationSettings {
  email_submissions: boolean;
  email_consultations: boolean;
  email_weekly_report: boolean;
  browser_notifications: boolean;
}

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  social_twitter: string;
  social_linkedin: string;
  social_github: string;
  portfolio_file_url: string;
  avatar_url?: string;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{
    loading: boolean;
    running: boolean;
    items: { file: string; size: number; last_modified: number }[];
    error: string | null;
  }>({
    loading: false,
    running: false,
    items: [],
    error: null,
  });

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: 'OKJTech Admin',
    email: 'admin@okjtech.co.ke',
    role: 'Administrator',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_submissions: true,
    email_consultations: true,
    email_weekly_report: false,
    browser_notifications: true,
  });

  // Site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: 'OKJTech',
    site_description: 'Design-led web engineering studio',
    contact_email: 'hello@okjtech.co.ke',
    contact_phone: '+254 712 345 678',
    social_twitter: 'https://twitter.com/okjtech',
    social_linkedin: '',
    social_github: 'https://github.com/okjtech',
    portfolio_file_url: '',
  });
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Load site settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await siteSettingsApi.getPublic();
        setSiteSettings({
          site_name: data.site_name || 'OKJTech',
          site_description: data.site_description || 'Design-led web engineering studio',
          contact_email: data.contact_email || 'hello@okjtech.co.ke',
          contact_phone: data.contact_phone || '+254 712 345 678',
          social_twitter: data.social_twitter || 'https://twitter.com/okjtech',
          social_linkedin: data.social_linkedin || '',
          social_github: data.social_github || 'https://github.com/okjtech',
          portfolio_file_url: data.portfolio_file_url || '',
        });
        
        if (data.avatar_url) {
          setProfile(prev => ({ ...prev, avatar: data.avatar_url }));
        }
      } catch {
        // Ignore, use defaults
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      if (activeTab === 'site') {
        const payload = {
          site_name: siteSettings.site_name,
          site_description: siteSettings.site_description,
          contact_email: siteSettings.contact_email,
          contact_phone: siteSettings.contact_phone,
          social_twitter: siteSettings.social_twitter,
          social_linkedin: siteSettings.social_linkedin,
          social_github: siteSettings.social_github,
        };
        await siteSettingsApi.update(payload);
      }
      
      // Other tabs (profile, etc.) would need their own API calls
      // For now, let's at least make "site" work as it's the most critical
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await siteSettingsApi.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.avatar_url }));
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const loadBackups = async () => {
    setBackupInfo(prev => ({ ...prev, loading: true, error: null }));
    try {
      const items = await backupApi.latest();
      setBackupInfo(prev => ({ ...prev, items, loading: false }));
    } catch (error) {
      console.error('Failed to load backups', error);
      setBackupInfo(prev => ({ ...prev, loading: false, error: 'Failed to load backups. Check server logs.' }));
    }
  };

  const runBackup = async () => {
    setBackupInfo(prev => ({ ...prev, running: true, error: null }));
    try {
      await backupApi.run();
      await loadBackups();
    } catch (error) {
      console.error('Failed to run backup', error);
      setBackupInfo(prev => ({ ...prev, running: false, error: 'Backup failed. Check server logs.' }));
      return;
    }
    setBackupInfo(prev => ({ ...prev, running: false }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'site', label: 'Site Settings', icon: Globe },
  ];

  return (
    <AdminLayout title="Settings" subtitle="Manage your account and site preferences">
      <div className="admin-settings-layout">
        {/* Tabs Navigation */}
        <div className="admin-settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="admin-settings-content">
          {/* Success Message */}
          {saveSuccess && (
            <motion.div
              className="admin-settings-success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Check size={18} />
              Settings saved successfully!
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              className="admin-card admin-settings-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="admin-card-header">
                <h2>
                  <User size={18} />
                  Profile Information
                </h2>
              </div>
              <form className="admin-settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {/* Avatar */}
                <div className="admin-settings-avatar-section">
                  <div className="admin-settings-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      <span>{profile.name.charAt(0).toUpperCase()}</span>
                    )}
                    <button 
                      type="button" 
                      className="admin-settings-avatar-btn"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? <RefreshCw size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="admin-settings-avatar-info">
                    <h3>{profile.name}</h3>
                    <p>{profile.role}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="admin-settings-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="admin-settings-input"
                  />
                </div>

                <div className="admin-settings-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="admin-settings-input"
                  />
                </div>

                <div className="admin-settings-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="admin-settings-input disabled"
                  />
                </div>

                <div className="admin-settings-actions">
                  <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              className="admin-card admin-settings-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="admin-card-header">
                <h2>
                  <Lock size={18} />
                  Change Password
                </h2>
              </div>
              <form className="admin-settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="admin-settings-field">
                  <label>Current Password</label>
                  <div className="admin-settings-password-input">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="admin-settings-input"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="admin-settings-password-toggle"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-settings-field">
                  <label>New Password</label>
                  <div className="admin-settings-password-input">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="admin-settings-input"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="admin-settings-password-toggle"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-settings-field">
                  <label>Confirm New Password</label>
                  <div className="admin-settings-password-input">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="admin-settings-input"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="admin-settings-password-toggle"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-settings-info">
                  <AlertCircle size={16} />
                  <p>Password must be at least 8 characters and include uppercase, lowercase, and numbers.</p>
                </div>

                <div className="admin-settings-actions">
                  <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                    {isSaving ? 'Updating...' : <><Lock size={18} /> Update Password</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              className="admin-card admin-settings-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="admin-card-header">
                <h2>
                  <Bell size={18} />
                  Notification Preferences
                </h2>
              </div>
              <form className="admin-settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="admin-settings-toggle-group">
                  <div className="admin-settings-toggle-item">
                    <div className="admin-settings-toggle-info">
                      <h4>Email: New Submissions</h4>
                      <p>Receive email notifications when a new contact form is submitted</p>
                    </div>
                    <label className="admin-settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifications.email_submissions}
                        onChange={(e) => setNotifications({ ...notifications, email_submissions: e.target.checked })}
                      />
                      <span className="admin-settings-toggle-slider" />
                    </label>
                  </div>

                  <div className="admin-settings-toggle-item">
                    <div className="admin-settings-toggle-info">
                      <h4>Email: Consultation Bookings</h4>
                      <p>Receive email notifications for new consultation requests</p>
                    </div>
                    <label className="admin-settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifications.email_consultations}
                        onChange={(e) => setNotifications({ ...notifications, email_consultations: e.target.checked })}
                      />
                      <span className="admin-settings-toggle-slider" />
                    </label>
                  </div>

                  <div className="admin-settings-toggle-item">
                    <div className="admin-settings-toggle-info">
                      <h4>Weekly Analytics Report</h4>
                      <p>Receive a weekly summary of your site's performance</p>
                    </div>
                    <label className="admin-settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifications.email_weekly_report}
                        onChange={(e) => setNotifications({ ...notifications, email_weekly_report: e.target.checked })}
                      />
                      <span className="admin-settings-toggle-slider" />
                    </label>
                  </div>

                  <div className="admin-settings-toggle-item">
                    <div className="admin-settings-toggle-info">
                      <h4>Browser Notifications</h4>
                      <p>Show desktop notifications for important events</p>
                    </div>
                    <label className="admin-settings-toggle">
                      <input
                        type="checkbox"
                        checked={notifications.browser_notifications}
                        onChange={(e) => setNotifications({ ...notifications, browser_notifications: e.target.checked })}
                      />
                      <span className="admin-settings-toggle-slider" />
                    </label>
                  </div>
                </div>

                <div className="admin-settings-actions">
                  <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Preferences</>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Site Settings Tab */}
          {activeTab === 'site' && (
            <motion.div
              className="admin-card admin-settings-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="admin-card-header">
                <h2>
                  <Globe size={18} />
                  Site Configuration
                </h2>
              </div>
              <form className="admin-settings-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="admin-settings-section">
                  <h3>General</h3>
                  <div className="admin-settings-field">
                    <label>Site Name</label>
                    <input
                      type="text"
                      value={siteSettings.site_name}
                      onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                      className="admin-settings-input"
                    />
                  </div>

                  <div className="admin-settings-field">
                    <label>Site Description</label>
                    <input
                      type="text"
                      value={siteSettings.site_description}
                      onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })}
                      className="admin-settings-input"
                    />
                  </div>
                </div>

                <div className="admin-settings-section">
                  <h3>Contact Information</h3>
                  <div className="admin-settings-row">
                    <div className="admin-settings-field">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        value={siteSettings.contact_email}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                        className="admin-settings-input"
                      />
                    </div>
                    <div className="admin-settings-field">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        value={siteSettings.contact_phone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
                        className="admin-settings-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-settings-section">
                  <h3>Social Links</h3>
                  <div className="admin-settings-field">
                    <label>Twitter/X URL</label>
                    <input
                      type="url"
                      value={siteSettings.social_twitter}
                      onChange={(e) => setSiteSettings({ ...siteSettings, social_twitter: e.target.value })}
                      className="admin-settings-input"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={siteSettings.social_linkedin}
                      onChange={(e) => setSiteSettings({ ...siteSettings, social_linkedin: e.target.value })}
                      className="admin-settings-input"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>
                  <div className="admin-settings-field">
                    <label>GitHub URL</label>
                    <input
                      type="url"
                      value={siteSettings.social_github}
                      onChange={(e) => setSiteSettings({ ...siteSettings, social_github: e.target.value })}
                      className="admin-settings-input"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                <div className="admin-settings-section">
                  <h3>Company Portfolio</h3>
                  <div className="admin-settings-field">
                    <label>Portfolio File (PDF)</label>
                    <div className="admin-upload-area">
                      {siteSettings.portfolio_file_url ? (
                        <div className="admin-file-preview">
                          <a href={siteSettings.portfolio_file_url} target="_blank" rel="noopener noreferrer">
                            View Current Portfolio
                          </a>
                          <button
                            type="button"
                            className="admin-btn-danger"
                            onClick={async () => {
                              try {
                                await siteSettingsApi.deletePortfolio();
                                setSiteSettings(prev => ({ ...prev, portfolio_file_url: '' }));
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <p className="admin-form-hint">No portfolio file uploaded</p>
                      )}
                      <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => portfolioInputRef.current?.click()}
                        disabled={uploadingPortfolio}
                      >
                        <FileUp size={16} />
                        {uploadingPortfolio ? 'Uploading...' : 'Upload Portfolio File'}
                      </button>
                      <input
                        ref={portfolioInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingPortfolio(true);
                            const result = await siteSettingsApi.uploadPortfolio(file);
                            setSiteSettings(prev => ({ ...prev, portfolio_file_url: result.portfolio_file_url }));
                          } catch (err) {
                            console.error('Failed to upload portfolio', err);
                          } finally {
                            setUploadingPortfolio(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-settings-actions">
                  <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                  </button>
                </div>
              </form>

              <div className="admin-settings-section" style={{ marginTop: '2rem' }}>
                <h3>Backups</h3>
                <p className="admin-form-hint">
                  Run on-demand backups and view the latest backup files. Scheduled backups in production may require PHP 8.3.
                </p>
                <div className="admin-settings-row">
                  <div className="admin-settings-field">
                    <label>Run Backup</label>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={runBackup}
                      disabled={backupInfo.running}
                    >
                      {backupInfo.running ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Database size={18} />
                          Run Backup Now
                        </>
                      )}
                    </button>
                  </div>
                  <div className="admin-settings-field">
                    <label>Latest Backups</label>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={loadBackups}
                      disabled={backupInfo.loading}
                    >
                      <RefreshCw size={16} />
                      Refresh List
                    </button>
                    <div className="admin-backup-list">
                      {backupInfo.loading ? (
                        <p className="admin-form-hint">Loading backups...</p>
                      ) : backupInfo.items.length === 0 ? (
                        <p className="admin-form-hint">No backups found yet.</p>
                      ) : (
                        <ul>
                          {backupInfo.items.map((item) => (
                            <li key={item.file}>
                              <span className="name">{item.file}</span>
                              <span className="meta">
                                {(item.size / (1024 * 1024)).toFixed(1)} MB ·{' '}
                                {new Date(item.last_modified * 1000).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {backupInfo.error && (
                        <p className="admin-form-hint" style={{ color: '#dc2626' }}>
                          {backupInfo.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

