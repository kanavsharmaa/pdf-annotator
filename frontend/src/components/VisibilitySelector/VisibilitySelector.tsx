import { useState, useEffect } from 'react';
import type { Role } from '@/types';
import styles from './VisibilitySelector.module.css';

interface VisibilitySelectorProps {
  onVisibilityChange: (isPrivate: boolean, visibility: Role[]) => void;
  currentUser: Role;
}

const ALL_USERS: Role[] = ['A1', 'D1', 'D2'];

export const VisibilitySelector = ({ onVisibilityChange, currentUser }: VisibilitySelectorProps) => {
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Role[]>([]);

  // Reset to private when user changes
  useEffect(() => {
    setIsPrivate(true);
    setSelectedUsers([]);
    onVisibilityChange(true, []);
  }, [currentUser]);

  const handlePrivateChange = (value: boolean) => {
    setIsPrivate(value);
    if (value) {
      setSelectedUsers([]);
      onVisibilityChange(true, []);
    } else {
      onVisibilityChange(false, selectedUsers);
    }
  };

  const handleUserToggle = (user: Role) => {
    const newSelection = selectedUsers.includes(user)
      ? selectedUsers.filter((u) => u !== user)
      : [...selectedUsers, user];
    
    setSelectedUsers(newSelection);
    onVisibilityChange(isPrivate, newSelection);
  };

  const handleSelectAll = () => {
    const allUsers = ALL_USERS.filter((u) => u !== currentUser);
    setSelectedUsers(allUsers);
    onVisibilityChange(false, allUsers);
  };

  const handleSelectNone = () => {
    setSelectedUsers([]);
    onVisibilityChange(false, []);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Annotation Visibility</div>
      
      <div className={styles.option}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={isPrivate}
            onChange={() => handlePrivateChange(true)}
            className={styles.radio}
          />
          <span>Private (Only you can see)</span>
        </label>
      </div>

      <div className={styles.option}>
        <label className={styles.radioLabel}>
          <input
            type="radio"
            checked={!isPrivate}
            onChange={() => handlePrivateChange(false)}
            className={styles.radio}
          />
          <span>Shared (Admin + selected users)</span>
        </label>
      </div>

      {!isPrivate && (
        <div className={styles.userSelection}>
          <div className={styles.quickActions}>
            <button className={styles.quickButton} onClick={handleSelectAll}>
              Select All
            </button>
            <button className={styles.quickButton} onClick={handleSelectNone}>
              Clear
            </button>
          </div>
          
          <div className={styles.userList}>
            {ALL_USERS.filter((u) => u !== currentUser && u !== 'A1').map((user) => (
              <label key={user} className={styles.userLabel}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user)}
                  onChange={() => handleUserToggle(user)}
                  className={styles.checkbox}
                />
                <span>{user}</span>
              </label>
            ))}
          </div>
          
          <div className={styles.hint}>
            Note: Admin (A1) can always see shared annotations. Select specific users to share with, or leave empty to share with admin only.
          </div>
        </div>
      )}
    </div>
  );
};
