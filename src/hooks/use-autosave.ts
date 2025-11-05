import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // Delay in milliseconds before saving
  key?: string; // LocalStorage key for persistence
  enabled?: boolean; // Enable/disable autosave
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

/**
 * Hook that automatically saves data after a delay when it changes
 * Also persists data to localStorage for recovery
 */
export function useAutosave<T>({
  data,
  onSave,
  delay = 2000,
  key,
  enabled = true,
}: AutosaveOptions<T>) {
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const mountedRef = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (key && enabled) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          logger.debug('Loaded autosaved data from localStorage', { key });
          // Don't automatically apply - let the parent component decide
          // You can expose this via a return value if needed
        }
      } catch (error) {
        logger.error('Failed to load autosaved data', error);
      }
    }
  }, [key, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Main autosave effect
  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!hasChanged) return;

    // Mark as having unsaved changes
    setState(prev => ({ ...prev, hasUnsavedChanges: true, error: null }));

    // Save to localStorage immediately
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        logger.error('Failed to save to localStorage', error);
      }
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for server save
    timeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      setState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        await onSave(data);
        
        if (mountedRef.current) {
          setState({
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            error: null,
          });

          // Clear localStorage after successful save
          if (key) {
            localStorage.removeItem(key);
          }

          previousDataRef.current = data;
          logger.debug('Autosave completed successfully');
        }
      } catch (error) {
        if (mountedRef.current) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save';
          setState(prev => ({
            ...prev,
            isSaving: false,
            error: errorMessage,
          }));
          logger.error('Autosave failed', error);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, key, enabled]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSave(data);
      
      setState({
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
      });

      if (key) {
        localStorage.removeItem(key);
      }

      previousDataRef.current = data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save';
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [data, onSave, key]);

  return {
    ...state,
    saveNow,
  };
}
