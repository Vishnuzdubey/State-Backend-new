import { API_BASE_URL, tokenManager } from '@/api/config';

export type DocumentType = 
  | 'gst_doc' 
  | 'balance_sheet_doc' 
  | 'address_proof_doc' 
  | 'pan_doc' 
  | 'user_pan_doc' 
  | 'user_address_proof_doc';

export interface UploadResult {
  success: boolean;
  documentType: DocumentType;
  key?: string;
  error?: string;
}

interface PresignedUrlResponse {
  url: string;
  key: string;
}

interface ConfirmUploadResponse {
  status: string;
  message: string;
}

/**
 * Get the MIME type of a file
 */
function getFileType(file: File): string {
  return file.type || 'application/octet-stream';
}

/**
 * Get the authorization token for API requests
 */
function getAuthToken(): string {
  const token = tokenManager.getToken('MANUFACTURER');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }
  return token;
}

/**
 * Step 1: Get presigned URL from backend
 */
async function getPresignedUrl(
  fileType: string,
  documentType: DocumentType
): Promise<PresignedUrlResponse> {
  const token = getAuthToken();
  
  const response = await fetch(
    `${API_BASE_URL}/manufacturer/documents/upload-url?fileType=${encodeURIComponent(fileType)}&documentType=${documentType}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get upload URL' }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Step 2: Upload file to S3 using presigned URL
 */
async function uploadToS3(
  presignedUrl: string,
  file: File,
  fileType: string
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': fileType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Step 3: Confirm upload with backend
 */
async function confirmUpload(
  key: string,
  documentType: DocumentType
): Promise<ConfirmUploadResponse> {
  const token = getAuthToken();
  
  const response = await fetch(
    `${API_BASE_URL}/manufacturer/documents/confirm-upload?key=${encodeURIComponent(key)}&documentType=${documentType}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to confirm upload' }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Complete document upload flow
 * 1. Get presigned URL
 * 2. Upload to S3
 * 3. Confirm upload
 */
export async function uploadDocument(
  file: File,
  documentType: DocumentType
): Promise<UploadResult> {
  try {
    const fileType = getFileType(file);
    
    // Step 1: Get presigned URL
    const { url, key } = await getPresignedUrl(fileType, documentType);
    
    // Step 2: Upload to S3
    await uploadToS3(url, file, fileType);
    
    // Step 3: Confirm upload
    await confirmUpload(key, documentType);
    
    return {
      success: true,
      documentType,
      key,
    };
  } catch (error) {
    console.error(`Upload failed for ${documentType}:`, error);
    return {
      success: false,
      documentType,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple documents simultaneously
 * Returns results for all uploads (both successful and failed)
 */
export async function uploadMultipleDocuments(
  documents: Array<{ file: File; documentType: DocumentType }>
): Promise<UploadResult[]> {
  const uploadPromises = documents.map(({ file, documentType }) =>
    uploadDocument(file, documentType)
  );
  
  return await Promise.all(uploadPromises);
}

/**
 * Retry failed uploads
 * Useful for re-uploading specific documents that failed
 */
export async function retryFailedUploads(
  failedResults: UploadResult[],
  filesMap: Map<DocumentType, File>
): Promise<UploadResult[]> {
  const retryPromises = failedResults.map((result) => {
    const file = filesMap.get(result.documentType);
    if (!file) {
      return Promise.resolve({
        success: false,
        documentType: result.documentType,
        error: 'File not found for retry',
      });
    }
    return uploadDocument(file, result.documentType);
  });
  
  return await Promise.all(retryPromises);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }
  
  // Check file type
  const allowedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PNG, JPEG, and PDF files are allowed',
    };
  }
  
  return { valid: true };
}

/**
 * Map internal file keys to document types
 */
export const documentTypeMapping: Record<string, DocumentType> = {
  gst: 'gst_doc',
  profile: 'balance_sheet_doc',
  addressProof: 'address_proof_doc',
  pan: 'pan_doc',
  idProof: 'user_pan_doc',
  idAddress: 'user_address_proof_doc',
};
