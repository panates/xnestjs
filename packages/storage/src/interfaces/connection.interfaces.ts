export type FileMetadata = Record<string, any>;

export interface ObjectInfo {
  originalName?: string;
  contentType?: string;
  contentLanguage?: string;
  contentEncoding?: string;
  size: number;
  etag: string;
  lastModified: Date;
  metadata: Record<string, any>;
}

export interface PutObjectOptions {
  originalName?: string;
  contentType?: string;
  contentLanguage?: string;
  contentEncoding?: string;
  metadata?: FileMetadata;
}

export interface SignedUrlOptions {
  expires?: number;
}

export interface GetObjectSignedUrlOptions extends SignedUrlOptions {
}
