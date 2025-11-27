/**
 * useSettings Hook
 *
 * React hook for accessing and updating application settings.
 */

import { useState, useEffect } from 'react';
import {
  Settings,
  getSettings,
  updateSettings as updateSettingsManager,
  subscribe,
  applyTheme,
} from '../engine/SettingsManager';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getSettings());

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const updateSettings = (partial: Partial<Settings>) => {
    const updated = updateSettingsManager(partial);

    // Apply theme immediately if changed
    if (partial.theme !== undefined) {
      applyTheme(partial.theme);
    }

    return updated;
  };

  return {
    settings,
    updateSettings,
  };
}
