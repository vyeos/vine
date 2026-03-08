export interface Media {
  id: string;
  workspaceId: string;
  uploadedBy: string;
  filename: string;
  contentType: string;
  size: number;
  storageId?: string | null;
  url: string;
  thumbhashBase64?: string | null;
  aspectRatio?: number | null;
  createdAt: string;
}
