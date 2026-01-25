import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  // Navigation shortcuts
  useHotkeys('g d', () => navigate('/admin/dashboard'), { preventDefault: true });
  useHotkeys('g p', () => navigate('/admin/portfolio'), { preventDefault: true });
  useHotkeys('g s', () => navigate('/admin/submissions'), { preventDefault: true });
  useHotkeys('g a', () => navigate('/admin/analytics'), { preventDefault: true });
  useHotkeys('g c', () => navigate('/admin/calendar'), { preventDefault: true });
  useHotkeys('g n', () => navigate('/admin/notifications'), { preventDefault: true });
  useHotkeys('g l', () => navigate('/admin/activity-log'), { preventDefault: true });
  useHotkeys('g t', () => navigate('/admin/settings'), { preventDefault: true });

  // Global shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    // Open command palette (can be implemented later)
    console.log('Command palette');
  });

  useHotkeys('ctrl+/', (e) => {
    e.preventDefault();
    // Show keyboard shortcuts help
    console.log('Show shortcuts help');
  });
}

