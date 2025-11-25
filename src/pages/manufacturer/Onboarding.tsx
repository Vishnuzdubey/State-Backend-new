import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  uploadMultipleDocuments,
  retryFailedUploads,
  validateFile,
  documentTypeMapping,
  type UploadResult,
  type DocumentType
} from '@/utils/documentUpload';
// File input uses native hidden inputs and labels; no Input component required

export function Onboarding() {
  const { user } = useAuth();
  // active tab state: details | kyc | ack
  const [activeTab, setActiveTab] = useState<'details' | 'kyc' | 'ack'>('details');
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map());
  const [uploadedNames, setUploadedNames] = useState<Record<string, string | null>>({
    gst: null,
    profile: null,
    addressProof: null,
    pan: null,
    idProof: null,
    idAddress: null
  });
  const [uploadedKeys, setUploadedKeys] = useState<Record<string, string | null>>({
    gst: null,
    profile: null,
    addressProof: null,
    pan: null,
    idProof: null,
    idAddress: null
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [failedUploads, setFailedUploads] = useState<UploadResult[]>([]);

  const fileRows: [string, string, string][] = [
    ['gst', 'Company GSTN', 'Upload the valid GSTN Certificate for company'],
    ['profile', 'Company Profile', 'Must include last 3 year audited balance sheets'],
    ['addressProof', 'Company Address Proof', 'Valid address proof for the company'],
    ['pan', 'Company PAN', 'Upload company\'s pan card image'],
    ['idProof', 'Individual ID Proof', 'Pan card of Director / Partner / Proprietor'],
    ['idAddress', 'Individual Address Proof', 'Aadhar card of Director / Partner / Proprietor']
  ];

  const handleFile = (key: string, f?: File | null) => {
    if (!f) {
      setUploadedNames(prev => ({ ...prev, [key]: null }));
      setUploadedFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
      return;
    }

    // Validate file
    const validation = validateFile(f);
    if (!validation.valid) {
      setMessage(validation.error || 'Invalid file');
      setMessageType('error');
      return;
    }

    setUploadedNames(prev => ({ ...prev, [key]: f.name }));
    setUploadedFiles(prev => {
      const newMap = new Map(prev);
      newMap.set(key, f);
      return newMap;
    });
    setMessage(null); // Clear any previous error messages
  };

  const allUploaded = Object.values(uploadedNames).every((v) => Boolean(v));
  const missingList = fileRows.filter(([key]) => !uploadedNames[key]).map(([, label]) => label);
  const missing = missingList.join(', ');

  const handleSubmit = async () => {
    if (!user) return;

    // Require all files during submission
    if (!allUploaded) {
      setMessage('Please upload all required documents before proceeding.');
      setMessageType('error');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading documents... Please wait.');
    setMessageType('success');

    try {
      // Prepare documents for upload
      const documentsToUpload = Array.from(uploadedFiles.entries()).map(([key, file]) => ({
        file,
        documentType: documentTypeMapping[key] as DocumentType,
      }));

      // Upload all documents
      const results = await uploadMultipleDocuments(documentsToUpload);

      // Check for failures
      const failed = results.filter(r => !r.success);
      const successful = results.filter(r => r.success);

      if (failed.length > 0) {
        setFailedUploads(failed);
        setMessage(
          `${successful.length} document(s) uploaded successfully. ${failed.length} document(s) failed. Please retry the failed uploads.`
        );
        setMessageType('error');
      } else {
        // All uploads successful - save keys
        const keysMap: Record<string, string | null> = {};
        results.forEach(result => {
          if (result.success && result.key) {
            const internalKey = Object.keys(documentTypeMapping).find(
              k => documentTypeMapping[k] === result.documentType
            );
            if (internalKey) {
              keysMap[internalKey] = result.key;
            }
          }
        });

        setUploadedKeys(keysMap);

        // Save to localStorage for persistence
        const payload = {
          userId: user.id,
          uploadedAt: new Date().toISOString(),
          files: uploadedNames,
          keys: keysMap,
        };
        localStorage.setItem(`manufacturer_kyc_${user.id}`, JSON.stringify(payload));

        setMessage('All documents uploaded successfully! Admin will review your application.');
        setMessageType('success');
        setActiveTab('ack');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('An unexpected error occurred during upload. Please try again.');
      setMessageType('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetryFailedUploads = async () => {
    if (failedUploads.length === 0) return;

    setIsUploading(true);
    setMessage('Retrying failed uploads...');
    setMessageType('success');

    try {
      // Create a map of document types to files for retry
      const filesMap = new Map<DocumentType, File>();
      failedUploads.forEach(failedResult => {
        const internalKey = Object.keys(documentTypeMapping).find(
          k => documentTypeMapping[k] === failedResult.documentType
        );
        if (internalKey) {
          const file = uploadedFiles.get(internalKey);
          if (file) {
            filesMap.set(failedResult.documentType, file);
          }
        }
      });

      const retryResults = await retryFailedUploads(failedUploads, filesMap);

      const stillFailed = retryResults.filter(r => !r.success);
      const nowSuccessful = retryResults.filter(r => r.success);

      if (stillFailed.length > 0) {
        setFailedUploads(stillFailed);
        setMessage(
          `${nowSuccessful.length} document(s) uploaded on retry. ${stillFailed.length} still failed.`
        );
        setMessageType('error');
      } else {
        setFailedUploads([]);

        // Update keys for successful retries
        const updatedKeys = { ...uploadedKeys };
        nowSuccessful.forEach(result => {
          if (result.key) {
            const internalKey = Object.keys(documentTypeMapping).find(
              k => documentTypeMapping[k] === result.documentType
            );
            if (internalKey) {
              updatedKeys[internalKey] = result.key;
            }
          }
        });
        setUploadedKeys(updatedKeys);

        // Update localStorage
        const payload = {
          userId: user?.id,
          uploadedAt: new Date().toISOString(),
          files: uploadedNames,
          keys: updatedKeys,
        };
        localStorage.setItem(`manufacturer_kyc_${user?.id}`, JSON.stringify(payload));

        setMessage('All documents uploaded successfully!');
        setMessageType('success');
        setActiveTab('ack');
      }
    } catch (error) {
      console.error('Retry error:', error);
      setMessage('Retry failed. Please try again.');
      setMessageType('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Load any previously uploaded filenames and keys from localStorage so they persist across refreshes
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(`manufacturer_kyc_${user.id}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data) {
          if (data.files) {
            setUploadedNames(prev => ({ ...prev, ...data.files }));
          }
          if (data.keys) {
            setUploadedKeys(prev => ({ ...prev, ...data.keys }));
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [user]);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manufacturer Empanelment</h1>
      </div>

      <div className="flex gap-8">
        <aside className="w-64">
          <div className="rounded-lg border bg-white p-4">
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('details')}
                className={`w-full text-left px-4 py-3 rounded ${activeTab === 'details' ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border'}`}>
                Details
              </button>
              <button
                onClick={() => setActiveTab('kyc')}
                className={`w-full text-left px-4 py-3 rounded ${activeTab === 'kyc' ? 'bg-amber-400 text-white' : 'bg-white text-gray-800 border'}`}>
                KYC Documents
              </button>
              <button
                onClick={() => setActiveTab('ack')}
                className={`w-full text-left px-4 py-3 rounded ${activeTab === 'ack' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800 border'}`}>
                Acknowledgement
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Documents Upload</CardTitle>
            </CardHeader>
            <CardContent>
              {message && (
                <div className={"mb-4 rounded-md p-3 text-sm " + (messageType === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800')}>{message}</div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Manufacturer Details</h2>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Entity Name: </span>
                        <span>{user?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">GST Number: </span>
                        <span>{user?.gst || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">PAN Number: </span>
                        <span>{user?.pan || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Status: </span>
                        <span className={`px-2 py-1 rounded text-sm ${user?.status === 'ACKNOWLEDGED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {user?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Contact Person Details:</h3>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Full Name: </span>
                        <span>{user?.fullname_user || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Email: </span>
                        <span>{user?.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Phone: </span>
                        <span>{user?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Address Details:</h3>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <span className="font-semibold">Address: </span>
                        <span>{user?.address || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">District: </span>
                        <span>{user?.district || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">State: </span>
                        <span>{user?.state || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Pincode: </span>
                        <span>{user?.pincode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Document Status:</h3>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">GST Document:</span>
                        <span className={user?.gst_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.gst_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Balance Sheet:</span>
                        <span className={user?.balance_sheet_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.balance_sheet_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Address Proof:</span>
                        <span className={user?.address_proof_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.address_proof_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">PAN Document:</span>
                        <span className={user?.pan_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.pan_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">User PAN:</span>
                        <span className={user?.user_pan_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.user_pan_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">User Address Proof:</span>
                        <span className={user?.user_address_proof_doc ? 'text-green-600' : 'text-red-600'}>
                          {user?.user_address_proof_doc ? '✓ Uploaded' : '✗ Not Uploaded'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'kyc' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {fileRows.map(([key, label, help]) => {
                      const isFailed = failedUploads.some(
                        f => documentTypeMapping[key] === f.documentType
                      );
                      return (
                        <div
                          key={key as string}
                          className={`flex items-center justify-between p-3 rounded ${isFailed ? 'bg-red-50 border border-red-200' : ''
                            }`}
                        >
                          <div className="w-1/2">
                            <div className="font-semibold">
                              {label}
                              {isFailed && (
                                <span className="ml-2 text-xs text-red-600 font-normal">
                                  (Upload Failed)
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{help}</div>
                          </div>
                          <div className="w-1/2 flex items-center gap-3">
                            <input
                              id={`${key}-input`}
                              className="hidden"
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,application/pdf"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handleFile(key as string, e.target.files?.[0])
                              }
                              disabled={isUploading}
                            />
                            <label
                              htmlFor={`${key}-input`}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                              <span className="text-sm text-gray-700">Choose file</span>
                            </label>
                            <div className="flex-1 text-sm text-gray-600">
                              {uploadedNames[key as string] || 'No file chosen'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!allUploaded && (
                    <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
                      Please upload all documents. Missing: {missing}
                    </div>
                  )}

                  {failedUploads.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <p className="text-sm text-yellow-800 mb-2">
                        Some documents failed to upload:
                      </p>
                      <ul className="list-disc list-inside text-sm text-yellow-700">
                        {failedUploads.map(f => (
                          <li key={f.documentType}>
                            {f.documentType}: {f.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('details')}
                      disabled={isUploading}
                    >
                      Back
                    </Button>
                    {failedUploads.length > 0 && (
                      <Button
                        type="button"
                        onClick={handleRetryFailedUploads}
                        disabled={isUploading}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {isUploading ? 'Retrying...' : 'Retry Failed Uploads'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-blue-600"
                      disabled={!allUploaded || isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload & Next'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'ack' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Acknowledgement</h2>
                  <p className="text-sm text-gray-700">
                    Your documents have been uploaded successfully. Admin will review your application and approve your account.
                  </p>

                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <h3 className="font-semibold text-green-800 mb-2">Uploaded Documents:</h3>
                    <ul className="space-y-1 text-sm text-green-700">
                      {fileRows.map(([key, label]) => {
                        const hasFile = uploadedNames[key as string];
                        const hasKey = uploadedKeys[key as string];
                        return hasFile ? (
                          <li key={key as string} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{label}: {uploadedNames[key as string]}</span>
                            {hasKey && <span className="text-xs text-gray-500">(Confirmed)</span>}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                      <li>Your application is under review</li>
                      <li>Admin will verify your documents</li>
                      <li>You will be notified via email once approved</li>
                      <li>After approval, you can access the full dashboard</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('kyc')}
                      disabled={isUploading}
                    >
                      Back to Documents
                    </Button>
                    <Button
                      onClick={() => {
                        setMessage('Application submitted successfully! You will be notified once approved.');
                        setMessageType('success');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isUploading}
                    >
                      Complete Submission
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default Onboarding;
