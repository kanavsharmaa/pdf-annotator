import { useRef, useState, useEffect, useCallback } from 'react';
import type { 
  Annotation, 
  AnnotationType, 
  HighlightData, 
  CommentData, 
  DrawData,
  Role 
} from '@/types';
import styles from './AnnotationLayer.module.css';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  currentTool: AnnotationType | null;
  currentColor: string;
  currentUser: Role;
  onAnnotationCreate: (annotation: Partial<Annotation>) => void;
  onAnnotationDelete: (annotationId: string) => void;
  canAnnotate: boolean;
  scale?: number;
  pageWidth: number;
  pageHeight: number;
}

export const AnnotationLayer = ({
  annotations,
  pageNumber,
  currentTool,
  currentColor,
  currentUser,
  onAnnotationCreate,
  onAnnotationDelete,
  canAnnotate,
  scale = 1,
  pageWidth,
  pageHeight,
}: AnnotationLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState<Array<{ x: number; y: number }>>([]);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Filter annotations for current page
  const pageAnnotations = annotations.filter((ann) => {
    const data = ann.data as any;
    return data && data.pageNumber === pageNumber;
  });

  // Sync canvas size with actual rendered PDF page size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;
      
      // Find the actual PDF page element
      const pdfPage = containerRef.current.previousElementSibling?.querySelector('.react-pdf__Page__canvas') as HTMLCanvasElement;
      
      if (pdfPage) {
        const rect = pdfPage.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height
        });
      } else if (pageWidth && pageHeight) {
        // Fallback to provided dimensions
        setCanvasSize({
          width: pageWidth,
          height: pageHeight
        });
      }
    };

    updateCanvasSize();
    
    // Update on window resize
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [pageWidth, pageHeight, pageNumber]);

  // Handle mouse down for drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canAnnotate || !currentTool) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'Draw') {
      setIsDrawing(true);
      setDrawPath([{ x, y }]);
    } else if (currentTool === 'Comment') {
      setCommentPosition({ x, y });
    } else if (currentTool === 'Eraser') {
      // Find and delete annotation at clicked position
      handleErase(x, y);
    }
  };

  // Handle eraser - find and delete annotations at the clicked position
  const handleErase = (x: number, y: number) => {
    // Check each annotation to see if the click is within its bounds
    for (const annotation of pageAnnotations) {
      // Check if user has permission to delete this annotation
      if (!canDelete(annotation)) {
        continue; // Skip annotations the user can't delete
      }

      if (annotation.type === 'Highlight') {
        const data = annotation.data as HighlightData;
        // Check if click is within any of the highlight rects
        for (const rect of data.rects) {
          if (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
          ) {
            onAnnotationDelete(annotation._id);
            return; // Delete only one annotation per click
          }
        }
      } else if (annotation.type === 'Draw') {
        const data = annotation.data as DrawData;
        // Check if click is near any point in the drawing path
        const eraserRadius = 10; // pixels
        for (const path of data.paths) {
          for (const point of path.points) {
            const distance = Math.sqrt(
              Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );
            if (distance <= eraserRadius) {
              onAnnotationDelete(annotation._id);
              return; // Delete only one annotation per click
            }
          }
        }
      }
    }
  };

  // Handle mouse move for drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'Draw') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawPath((prev) => [...prev, { x, y }]);
  };

  // Handle mouse up for drawing
  const handleMouseUp = () => {
    if (isDrawing && currentTool === 'Draw' && drawPath.length > 1) {
      const drawData: DrawData = {
        pageNumber,
        paths: [
          {
            points: drawPath,
            color: currentColor,
            width: 2,
          },
        ],
      };

      onAnnotationCreate({
        type: 'Draw',
        data: drawData,
        createdBy: currentUser,
      });

      // Clear draw path after a brief delay to allow state to update
      setTimeout(() => {
        setDrawPath([]);
      }, 0);
    }
    setIsDrawing(false);
  };

  // Handle text selection for highlight
  const handleTextSelect = useCallback(() => {
    if (!canAnnotate || currentTool !== 'Highlight') return;

    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects());
    
    if (rects.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    const highlightData: HighlightData = {
      pageNumber,
      text: selection.toString(),
      color: currentColor,
      rects: rects.map((rect) => ({
        x: rect.left - canvasRect.left,
        y: rect.top - canvasRect.top,
        width: rect.width,
        height: rect.height,
      })),
    };

    onAnnotationCreate({
      type: 'Highlight',
      data: highlightData,
      createdBy: currentUser,
    });

    selection.removeAllRanges();
  }, [canAnnotate, currentTool, pageNumber, currentColor, currentUser, scale, onAnnotationCreate]);

  // Listen for text selection when Highlight tool is active
  useEffect(() => {
    if (currentTool !== 'Highlight') return;

    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(() => {
        handleTextSelect();
      }, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentTool, handleTextSelect]);

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentPosition || !commentText.trim()) return;

    const commentData: CommentData = {
      pageNumber,
      x: commentPosition.x,
      y: commentPosition.y,
      text: commentText,
      color: currentColor,
    };

    // Clear dialog immediately for better UX
    setCommentPosition(null);
    setCommentText('');

    // Then create the annotation
    onAnnotationCreate({
      type: 'Comment',
      data: commentData,
      createdBy: currentUser,
    });
  };

  // Render canvas for drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing annotations
    pageAnnotations.forEach((annotation) => {
      if (annotation.type === 'Highlight') {
        const data = annotation.data as HighlightData;
        ctx.fillStyle = data.color + '80'; // Add transparency
        data.rects.forEach((rect) => {
          ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        });
      } else if (annotation.type === 'Draw') {
        const data = annotation.data as DrawData;
        data.paths.forEach((path) => {
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          path.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        });
      }
    });

    // Draw current drawing path
    if (isDrawing && drawPath.length > 1) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      drawPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    }
  }, [annotations, pageNumber, drawPath, isDrawing, currentColor, canvasSize]);

  const canDelete = (annotation: Annotation) => {
    return currentUser === 'A1' || annotation.createdBy === currentUser;
  };

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      style={{
        pointerEvents: currentTool && currentTool !== 'Highlight' ? 'auto' : 'none',
        userSelect: currentTool && currentTool !== 'Highlight' ? 'none' : 'auto',
      } as React.CSSProperties}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={canvasSize.width || pageWidth || 800}
        height={canvasSize.height || pageHeight || 1100}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: `${canvasSize.width || pageWidth || 800}px`,
          height: `${canvasSize.height || pageHeight || 1100}px`,
          pointerEvents: currentTool && currentTool !== 'Highlight' ? 'auto' : 'none',
          cursor: currentTool === 'Highlight' ? 'text' : currentTool === 'Eraser' ? 'pointer' : currentTool ? 'crosshair' : 'default',
        }}
      />

      {/* Render comment markers */}
      {pageAnnotations
        .filter((ann) => ann.type === 'Comment')
        .map((annotation) => {
          const data = annotation.data as CommentData;
          return (
            <div
              key={annotation._id}
              className={styles.commentMarker}
              style={{
                left: `${data.x}px`,
                top: `${data.y}px`,
                backgroundColor: data.color,
              }}
              title={data.text}
            >
              💬
              {canDelete(annotation) && (
                <button
                  className={styles.deleteButton}
                  onClick={() => onAnnotationDelete(annotation._id)}
                >
                  ×
                </button>
              )}
              <div className={styles.commentTooltip}>
                <div className={styles.commentAuthor}>By: {annotation.createdBy}</div>
                <div className={styles.commentText}>{data.text}</div>
              </div>
            </div>
          );
        })}

      {/* Comment input dialog */}
      {commentPosition && (
        <div
          className={styles.commentDialog}
          style={{
            left: `${commentPosition.x}px`,
            top: `${commentPosition.y}px`,
          }}
        >
          <textarea
            className={styles.commentInput}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment..."
            autoFocus
          />
          <div className={styles.commentActions}>
            <button className={styles.submitButton} onClick={handleCommentSubmit}>
              Add
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setCommentPosition(null);
                setCommentText('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
