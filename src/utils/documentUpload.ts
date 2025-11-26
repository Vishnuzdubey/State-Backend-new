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
 * Get the MIME type of a file based on extension and file.type
 */
function getFileType(file: File): string {
  // First try to use the file.type property
  if (file.type) {
    return file.type;
  }
  
  // Fallback to extension-based detection
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
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
  
  console.log('🔗 Getting presigned URL for:', { fileType, documentType });
  
  const response = await fetch(
    `${API_BASE_URL}/manufacturer/documents/upload-url?fileType=${encodeURIComponent(fileType)}&documentType=${documentType}`,
    {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      mode: 'cors',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to get upload URL' }));
    console.error('❌ Failed to get presigned URL:', error);
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Presigned URL received, key:', data.key);
  return data;
}

/**
 * Step 2: Upload file to S3 using presigned URL
 */
async function uploadToS3(
  presignedUrl: string,
  file: File,
  fileType: string
): Promise<void> {
  console.log('📤 Uploading to S3:', { 
    fileType, 
    fileSize: file.size, 
    fileName: file.name,
    url: presignedUrl.substring(0, 100) + '...'
  });
  
  try {
    // Use XMLHttpRequest instead of fetch for better CORS handling
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      // Set timeout to 5 minutes
      xhr.timeout = 300000; // 5 minutes
      
      xhr.addEventListener('timeout', () => {
        console.error('❌ S3 upload timeout');
        reject(new Error('Upload timeout - file took too long to upload. Please try again or use a smaller file.'));
      });

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          console.log(`📊 Upload progress: ${percentComplete.toFixed(2)}%`);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ S3 upload successful');
          resolve();
        } else {
          console.error('❌ S3 upload failed:', xhr.status, xhr.statusText);
          reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('❌ S3 upload network error');
        reject(new Error('Network error during S3 upload. Please check your connection and try again.'));
      });

      xhr.addEventListener('abort', () => {
        console.error('❌ S3 upload aborted');
        reject(new Error('Upload was aborted'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', fileType);
      
      console.log('🚀 Starting file upload to S3...');
      xhr.send(file);
    });
  } catch (error) {
    console.error('❌ Exception during S3 upload:', error);
    throw new Error(`Failed to upload to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  
  console.log('✔️ Confirming upload:', { key, documentType });
  
  const response = await fetch(
    `${API_BASE_URL}/manufacturer/documents/confirm-upload?key=${encodeURIComponent(key)}&documentType=${documentType}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to confirm upload' }));
    console.error('❌ Failed to confirm upload:', error);
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ Upload confirmed successfully');
  return data;
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
  console.log(`🚀 Starting upload for ${documentType}:`, { 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type
  });
  
  try {
    const fileType = getFileType(file);
    console.log(`📋 Detected file type: ${fileType}`);
    
    // Step 1: Get presigned URL
    console.log(`⏳ Step 1/3: Getting presigned URL for ${documentType}...`);
    const { url, key } = await getPresignedUrl(fileType, documentType);
    
    // Step 2: Upload to S3
    console.log(`⏳ Step 2/3: Uploading ${file.name} to S3...`);
    await uploadToS3(url, file, fileType);
    
    // Step 3: Confirm upload
    console.log(`⏳ Step 3/3: Confirming upload for ${documentType}...`);
    await confirmUpload(key, documentType);
    
    console.log(`✅ Upload complete for ${documentType}`);
    return {
      success: true,
      documentType,
      key,
    };
  } catch (error) {
    console.error(`❌ Upload failed for ${documentType}:`, error);
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Add context for common errors
      if (errorMessage.includes('Network error')) {
        errorMessage += '. Please ask your backend team to fix S3 CORS policy.';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network request failed. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication')) {
        errorMessage += ' Please try logging in again.';
      }
    }
    
    return {
      success: false,
      documentType,
      error: errorMessage,
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
