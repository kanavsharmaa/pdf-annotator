import { apiFetch } from './api';
import type { Annotation, CreateAnnotationDto, Role } from '@/types';

const ANNOTATION_BASE_URL = '/annotations';

export const annotationApi = {
  // Get all annotations for a document
  getByDocument: async (documentId: string, currentUser: Role): Promise<Annotation[]> => {
    return apiFetch<Annotation[]>(
      `${ANNOTATION_BASE_URL}/document/${documentId}`,
      currentUser
    );
  },

  // Create a new annotation
  create: async (annotation: CreateAnnotationDto, currentUser: Role): Promise<Annotation> => {
    const response = await apiFetch<{ message: string; annotation: Annotation }>(
      ANNOTATION_BASE_URL,
      currentUser,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(annotation),
      }
    );
    return response.annotation;
  },

  // Update an annotation
  update: async (
    annotationId: string,
    updates: Partial<CreateAnnotationDto>,
    currentUser: Role
  ): Promise<Annotation> => {
    const response = await apiFetch<{ message: string; annotation: Annotation }>(
      `${ANNOTATION_BASE_URL}/${annotationId}`,
      currentUser,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    return response.annotation;
  },

  // Delete an annotation
  delete: async (annotationId: string, currentUser: Role): Promise<void> => {
    return apiFetch<void>(
      `${ANNOTATION_BASE_URL}/${annotationId}`,
      currentUser,
      {
        method: 'DELETE',
      }
    );
  },
};
