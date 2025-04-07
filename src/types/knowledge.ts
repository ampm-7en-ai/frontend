
export interface UploadedFile {
  id: number;
  name: string;
  type: string;
  size: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
}
