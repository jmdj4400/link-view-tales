import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
        const matchesModifiers = 
          (!ctrlOrMeta || event.ctrlKey || event.metaKey) &&
          (!shortcut.shiftKey || event.shiftKey) &&
          (!shortcut.altKey || event.altKey);

        if (event.key === shortcut.key && matchesModifiers) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common keyboard shortcuts hook for the app
export function useCommonShortcuts() {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'd',
      ctrlKey: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => navigate('/links'),
      description: 'Go to Links'
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/profile'),
      description: 'Go to Profile Settings'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => navigate('/analytics'),
      description: 'Go to Analytics'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        const searchInput = document.querySelector('[data-search]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search'
    }
  ];

  useKeyboardShortcuts(shortcuts);
}
