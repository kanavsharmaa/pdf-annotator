import { useState } from 'react';
import type { AnnotationType } from '@/types';
import styles from './AnnotationToolbar.module.css';

interface AnnotationToolbarProps {
  currentTool: AnnotationType | null;
  onToolSelect: (tool: AnnotationType | null) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  canAnnotate: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  showSaveCancel?: boolean;
}

const COLORS = [
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Red', value: '#F44336' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Orange', value: '#FF9800' },
];

export const AnnotationToolbar = ({
  currentTool,
  onToolSelect,
  currentColor,
  onColorChange,
  canAnnotate,
  onSave,
  onCancel,
  showSaveCancel = false,
}: AnnotationToolbarProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!canAnnotate) {
    return (
      <div className={styles.container}>
        <div className={styles.readOnlyMessage}>
          Read-only mode - Annotations not available
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolGroup}>
        <button
          className={`${styles.toolButton} ${currentTool === 'Highlight' ? styles.active : ''}`}
          onClick={() => onToolSelect(currentTool === 'Highlight' ? null : 'Highlight')}
          title="Highlight Text"
        >
          <span className={styles.icon}>🖍️</span>
          Highlight
        </button>
        <button
          className={`${styles.toolButton} ${currentTool === 'Comment' ? styles.active : ''}`}
          onClick={() => onToolSelect(currentTool === 'Comment' ? null : 'Comment')}
          title="Add Comment"
        >
          <span className={styles.icon}>💬</span>
          Comment
        </button>
        <button
          className={`${styles.toolButton} ${currentTool === 'Draw' ? styles.active : ''}`}
          onClick={() => onToolSelect(currentTool === 'Draw' ? null : 'Draw')}
          title="Draw"
        >
          <span className={styles.icon}>✏️</span>
          Draw
        </button>
        <button
          className={`${styles.toolButton} ${currentTool === 'Eraser' ? styles.active : ''}`}
          onClick={() => onToolSelect(currentTool === 'Eraser' ? null : 'Eraser')}
          title="Eraser"
        >
          <span className={styles.icon}>🧹</span>
          Eraser
        </button>
      </div>

      <div className={styles.colorGroup}>
        <button
          className={styles.colorButton}
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{ backgroundColor: currentColor }}
          title="Select Color"
        >
          <span className={styles.colorLabel}>Color</span>
        </button>
        {showColorPicker && (
          <div className={styles.colorPicker}>
            {COLORS.map((color) => (
              <button
                key={color.value}
                className={`${styles.colorOption} ${currentColor === color.value ? styles.selected : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => {
                  onColorChange(color.value);
                  setShowColorPicker(false);
                }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {showSaveCancel && (
        <div className={styles.actionGroup}>
          <button className={styles.saveButton} onClick={onSave}>
            Save
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
