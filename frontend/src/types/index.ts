export type Role = 'A1' | 'D1' | 'D2' | 'R1';

export interface ApiFile {
  _id: string;
  fileName: string;
  uploaderRole: string;
  uploadDate: string;
}

export interface IUserContext {
  currentUser: Role;
  setCurrentUser: (role: Role) => void;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type AnnotationType = 'Highlight' | 'Comment' | 'Draw' | 'Eraser';

export interface HighlightData {
  pageNumber: number;
  text: string;
  color: string;
  rects: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface CommentData {
  pageNumber: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface DrawData {
  pageNumber: number;
  paths: Array<{
    points: Array<{ x: number; y: number }>;
    color: string;
    width: number;
  }>;
}

export interface Annotation {
  _id: string;
  documentId: string;
  createdBy: Role;
  type: AnnotationType;
  data: HighlightData | CommentData | DrawData;
  isPrivate: boolean;
  visibility: Role[];
  createdAt: string;
}

export interface CreateAnnotationDto {
  documentId: string;
  type: AnnotationType;
  data: HighlightData | CommentData | DrawData;
  isPrivate: boolean;
  visibility: Role[];
}
