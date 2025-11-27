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
}

const EMOJI_OPTIONS = [
  '😀', '🐱', '🦕', '🚀', '🌟', '🎨',
  '🎮', '🐶', '🐼', '🦊', '🐸', '🦋',
  '🦁', '🐯', '🐮', '🦄', '🌈', '⚡',
];

export const ProfileSelector = ({ onProfileSwitch }: ProfileSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmoji, setNewProfileEmoji] = useState('😀');
  const [profiles, setProfiles] = useState<Profile[]>(getProfiles());
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(getActiveProfile());

  const handleOpenSelector = () => {
    setIsOpen(true);
    setProfiles(getProfiles());
  };

  const handleCloseSelector = () => {
    setIsOpen(false);
    setShowAddForm(false);
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
    setShowAddForm(true);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      const newProfile = createProfile({
        name: newProfileName.trim(),
        avatar: newProfileEmoji,
      });
      setProfiles(getProfiles());
      setNewProfileName('');
      setNewProfileEmoji('😀');
      setShowAddForm(false);

      // Auto-select the new profile
      handleSelectProfile(newProfile.id);
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
        className={styles.profileButton}
        onClick={handleOpenSelector}
        aria-label="Open profile selector"
      >
        <div className={styles.profileAvatar}>{activeProfile?.avatar || '👤'}</div>
        <div className={styles.profileName}>{activeProfile?.name || 'No Profile'}</div>
        <div className={styles.caret}>▼</div>
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

            {!showAddForm ? (
              <>
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
              </>
            ) : (
              <>
                {/* Add Profile Form */}
                <form className={styles.addProfileForm} onSubmit={handleCreateProfile}>
                  <div className={styles.formGroup}>
                    <label htmlFor="profileName">Name:</label>
                    <input
                      type="text"
                      id="profileName"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      required
                      autoFocus
                      maxLength={20}
                      placeholder="Enter name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Choose an emoji:</label>
                    <div className={styles.emojiGrid}>
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`${styles.emojiOption} ${newProfileEmoji === emoji ? styles.selected : ''}`}
                          onClick={() => setNewProfileEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                      Create Profile
                    </button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
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
