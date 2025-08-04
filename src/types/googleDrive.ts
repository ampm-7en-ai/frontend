
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

export interface GoogleDriveFilesResponse {
  files: GoogleDriveFile[];
  nextPageToken?: string;
  prevPageToken?: string;
}
