import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import clsx from 'clsx';
import { useUserContext } from '@contexts/UserContext';
import { AnnotationToolbar } from '@/components/AnnotationToolbar';
import { AnnotationLayer } from '@/components/AnnotationLayer';
import { VisibilitySelector } from '@/components/VisibilitySelector';
import { annotationApi } from '@utils/annotationApi';
import type { Annotation, AnnotationType, Role } from '@/types';
import styles from './PdfViewerPage.module.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use new() instead of workerSrc to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const PdfViewerPage = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { currentUser } = useUserContext();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<AnnotationType | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#FFEB3B');
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [visibility, setVisibility] = useState<Role[]>([]);
  const [showVisibilitySelector, setShowVisibilitySelector] = useState<boolean>(false);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);

  useEffect(() => {
    if (!fileId) return;

    let objectUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/files/${fileId}`,
          {
            headers: {
              'X-User-Role': currentUser,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to load PDF');
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      }
    };

    fetchPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, currentUser]);

  // Reset visibility to private when user changes
  useEffect(() => {
    setIsPrivate(true);
    setVisibility([]);
  }, [currentUser]);

  // Fetch annotations
  useEffect(() => {
    if (!fileId) return;

    const fetchAnnotations = async () => {
      try {
        const data = await annotationApi.getByDocument(fileId, currentUser);
        setAnnotations(data);
      } catch (err) {
        console.error('Failed to fetch annotations:', err);
      }
    };

    fetchAnnotations();
  }, [fileId, currentUser]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onPageLoadSuccess = (page: any): void => {
    setPageWidth(page.width);
    setPageHeight(page.height);
  };

  const changePage = (offset: number): void => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = (): void => {
    changePage(-1);
  };

  const nextPage = (): void => {
    changePage(1);
  };

  const canAnnotate = currentUser === 'A1' || currentUser === 'D1' || currentUser === 'D2';

  const handleAnnotationCreate = async (annotation: Partial<Annotation>) => {
    if (!fileId || !annotation.type || !annotation.data) return;

    // Create optimistic annotation with temporary ID
    const optimisticAnnotation: Annotation = {
      _id: `temp-${Date.now()}`,
      documentId: fileId,
      createdBy: currentUser,
      type: annotation.type,
      data: annotation.data,
      isPrivate,
      visibility,
      createdAt: new Date().toISOString(),
    };

    // Add to UI immediately (optimistic update)
    setAnnotations((prev) => [...prev, optimisticAnnotation]);
    setCurrentTool(null);

    try {
      // Make API call
      const newAnnotation = await annotationApi.create(
        {
          documentId: fileId,
          type: annotation.type,
          data: annotation.data,
          isPrivate,
          visibility,
        },
        currentUser
      );
      
      // Replace optimistic annotation with real one from server
      setAnnotations((prev) =>
        prev.map((ann) =>
          ann._id === optimisticAnnotation._id ? newAnnotation : ann
        )
      );
    } catch (err) {
      console.error('Failed to create annotation:', err);
      
      // Remove optimistic annotation on failure
      setAnnotations((prev) =>
        prev.filter((ann) => ann._id !== optimisticAnnotation._id)
      );
      
      // Show error to user
      const errorMessage = err instanceof Error ? err.message : 'Failed to create annotation. Please try again.';
      alert(errorMessage);
    }
  };

  const handleAnnotationDelete = async (annotationId: string) => {
    // Store the annotation in case we need to restore it
    const annotationToDelete = annotations.find((ann) => ann._id === annotationId);
    if (!annotationToDelete) return;

    // Remove from UI immediately (optimistic update)
    setAnnotations((prev) => prev.filter((ann) => ann._id !== annotationId));

    try {
      await annotationApi.delete(annotationId, currentUser);
    } catch (err) {
      console.error('Failed to delete annotation:', err);
      
      // Restore annotation on failure
      setAnnotations((prev) => [...prev, annotationToDelete]);
      
      // Show error to user
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete annotation. Please try again.';
      alert(errorMessage);
    }
  };

  const handleVisibilityChange = (newIsPrivate: boolean, newVisibility: Role[]) => {
    setIsPrivate(newIsPrivate);
    setVisibility(newVisibility);
  };

  if (error) {
    return <div className={styles.error}>Error loading PDF: {error}</div>;
  }

  if (!pdfUrl) {
    return <div className={styles.loading}>Loading PDF...</div>;
  }

  return (
    <div className={styles.container}>
      <AnnotationToolbar
        currentTool={currentTool}
        onToolSelect={setCurrentTool}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        canAnnotate={canAnnotate}
      />

      <div className={styles.controls}>
        <button
          onClick={previousPage}
          disabled={pageNumber <= 1}
          className={styles.button}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>
          Page {pageNumber} of {numPages}
        </span>
        <button
          onClick={nextPage}
          disabled={pageNumber >= numPages}
          className={styles.button}
        >
          Next
        </button>
        {canAnnotate && (
          <button
            className={styles.button}
            onClick={() => setShowVisibilitySelector(!showVisibilitySelector)}
          >
            {showVisibilitySelector ? 'Hide' : 'Show'} Visibility Settings
          </button>
        )}
      </div>

      {showVisibilitySelector && canAnnotate && (
        <div className={styles.visibilityPanel}>
          <VisibilitySelector
            onVisibilityChange={handleVisibilityChange}
            currentUser={currentUser}
          />
        </div>
      )}

      <div className={styles.documentWrapper}>
        <div className={clsx(styles.pageContainer, {
          [styles.annotating]: currentTool && currentTool !== 'Highlight'
        })}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className={styles.loading}>Loading document...</div>}
            error={<div className={styles.error}>Failed to load PDF</div>}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className={styles.page}
              onLoadSuccess={onPageLoadSuccess}
            />
          </Document>
          <AnnotationLayer
            annotations={annotations}
            pageNumber={pageNumber}
            currentTool={currentTool}
            currentColor={currentColor}
            currentUser={currentUser}
            onAnnotationCreate={handleAnnotationCreate}
            onAnnotationDelete={handleAnnotationDelete}
            canAnnotate={canAnnotate}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
          />
        </div>
      </div>
    </div>
  );
};
