import { useState } from 'react';
import { Profile } from '../types';
import {
  getProfiles,
  getActiveProfile,
  setActiveProfile,
  createProfile,
  deleteProfile
} from '../engine/ProfileManager';
import styles from './ProfileSelector.module.css';

interface ProfileSelectorProps {
  /** Callback when profile is switched */
  onProfileSwitch?: (profile: Profile) => void;
  /** Callback to navigate to add profile screen */
  onAddProfile?: () => void;
  /** Minimal mode - renders as a simple button in top right */
  minimal?: boolean;
}

const EMOJI_OPTIONS = [
  '😀', '🐱', '🦕', '🚀', '🌟', '🎨',
  '🎮', '🐶', '🐼', '🦊', '🐸', '🦋',
  '🦁', '🐯', '🐮', '🦄', '🌈', '⚡',
];

export const ProfileSelector = ({ onProfileSwitch, onAddProfile, minimal = false }: ProfileSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(getProfiles());
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(getActiveProfile());

  const handleOpenSelector = () => {
    setIsOpen(true);
    setProfiles(getProfiles());
  };

  const handleCloseSelector = () => {
    setIsOpen(false);
    setShowDeleteConfirm(null);
  };

  const handleSelectProfile = (profileId: string) => {
    const success = setActiveProfile(profileId);
    if (success) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setActiveProfileState(profile);
        if (onProfileSwitch) {
          onProfileSwitch(profile);
        }
      }
      handleCloseSelector();
    }
  };

  const handleShowAddForm = () => {
    handleCloseSelector();
    if (onAddProfile) {
      onAddProfile();
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    setShowDeleteConfirm(profileId);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      const success = deleteProfile(showDeleteConfirm);
      if (success) {
        setProfiles(getProfiles());
        const newActiveProfile = getActiveProfile();
        setActiveProfileState(newActiveProfile);

        // If the active profile changed due to deletion, notify parent
        if (newActiveProfile && onProfileSwitch) {
          onProfileSwitch(newActiveProfile);
        }
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <>
      {/* Profile Button - Shows current profile */}
      <button
        className={minimal ? styles.profileButtonMinimal : styles.profileButton}
        onClick={handleOpenSelector}
        aria-label="Open profile selector"
      >
        <div className={styles.profileAvatar}>{activeProfile?.avatar || '👤'}</div>
        <div className={styles.profileName}>{activeProfile?.name || 'No Profile'}</div>
        {!minimal && <div className={styles.caret}>▼</div>}
      </button>

      {/* Profile Selection Modal */}
      {isOpen && (
        <div className={styles.modal} onClick={handleCloseSelector}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Choose Profile</h2>
              <button
                className={styles.closeButton}
                onClick={handleCloseSelector}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Profile List */}
            <div className={styles.profileList}>
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`${styles.profileCard} ${activeProfile?.id === profile.id ? styles.active : ''}`}
                >
                  <button
                    className={styles.profileCardButton}
                    onClick={() => handleSelectProfile(profile.id)}
                  >
                    <div className={styles.profileCardAvatar}>{profile.avatar}</div>
                    <div className={styles.profileCardName}>{profile.name}</div>
                    {activeProfile?.id === profile.id && (
                      <div className={styles.activeBadge}>Active</div>
                    )}
                  </button>
                  {profiles.length > 1 && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteProfile(profile.id)}
                      aria-label={`Delete ${profile.name}`}
                      title="Delete profile"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}

              {/* Add Profile Button */}
              <button
                className={styles.addProfileCard}
                onClick={handleShowAddForm}
              >
                <div className={styles.addIcon}>+</div>
                <div className={styles.addLabel}>Add Profile</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modal} onClick={handleCancelDelete}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Profile?</h3>
            <p>Are you sure you want to delete this profile? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
              <button
                className={styles.confirmCancelButton}
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
