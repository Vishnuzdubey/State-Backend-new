import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// File input uses native hidden inputs and labels; no Input component required

export function Onboarding() {
  const { user } = useAuth();
  // active tab state: details | kyc | ack
  const [activeTab, setActiveTab] = useState<'details' | 'kyc' | 'ack'>('details');
  const [uploadedNames, setUploadedNames] = useState<Record<string, string | null>>({
    gst: null,
    profile: null,
    addressProof: null,
    pan: null,
    idProof: null,
    idAddress: null
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const fileRows: [string, string, string][] = [
    ['gst','Company GSTN','Upload the valid GSTN Certificate for company'],
    ['profile','Company Profile','Must include last 3 year audited balance sheets'],
    ['addressProof','Company Address Proof','Valid address proof for the company'],
    ['pan','Company PAN','Upload company\'s pan card image'],
    ['idProof','Individual ID Proof','Pan card of Director / Partner / Proprietor'],
    ['idAddress','Individual Address Proof','Aadhar card of Director / Partner / Proprietor']
  ];

  const handleFile = (key: string, f?: File | null) => {
    setUploadedNames(prev => ({ ...prev, [key]: f ? f.name : null }));
  };

  const allUploaded = Object.values(uploadedNames).every((v) => Boolean(v));
  const missingList = fileRows.filter(([key]) => !uploadedNames[key]).map(([, label]) => label);
  const missing = missingList.join(', ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Require all files during KYC submission
    if (activeTab === 'kyc' && !allUploaded) {
      setMessage('Please upload all required documents before proceeding.');
      setMessageType('error');
      return;
    }

    const payload = {
      userId: user.id,
      uploadedAt: new Date().toISOString(),
      files: Object.fromEntries(Object.entries(uploadedNames).map(([k, v]) => [k, v || null]))
    };
    localStorage.setItem(`manufacturer_kyc_${user.id}`, JSON.stringify(payload));

    // DO NOT auto-approve here. Admin should review and approve.
    setMessage('Documents uploaded successfully. Admin will review and approve your application. Your uploads are saved and will persist on refresh.');
    setMessageType('success');

    // Move to acknowledgement after successful KYC save
    if (activeTab === 'kyc') setActiveTab('ack');
  };

  // Load any previously uploaded filenames from localStorage so they persist across refreshes
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(`manufacturer_kyc_${user.id}`);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.files) {
          setUploadedNames(prev => ({ ...prev, ...data.files }));
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
                  <h2 className="text-2xl font-bold">Manufacture Details</h2>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-1 font-semibold">Entity Code</div>
                      <div className="col-span-1">GTRO1315</div>
                      <div className="col-span-1 font-semibold">Entity Name</div>
                      <div className="col-span-2">GTROPY SYSTEMS PRIVATE LIMITED</div>
                      <div className="col-span-1 font-semibold">GST/PAN</div>
                      <div className="col-span-1">07AAGCG7403A1Z3</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold">Manufacturer User Details :</h3>
                  <div className="bg-white p-4 rounded shadow-sm border">
                    <table className="w-full table-auto text-left">
                      <thead>
                        <tr className="text-sm text-gray-700">
                          <th className="p-3">Full Name</th>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Designation</th>
                          <th className="p-3">Email Id</th>
                          <th className="p-3">Contact No</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3">Sandeep Yadav</td>
                          <td className="p-3">vltdgtropy</td>
                          <td className="p-3">Admin</td>
                          <td className="p-3">sandeep.yadav@gtropy.com</td>
                          <td className="p-3">9654112996</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'kyc' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/** File row helper component pattern implemented inline for brevity */}
                    {fileRows.map(([key,label,help]) => (
                      <div key={key as string} className="flex items-center justify-between">
                        <div className="w-1/2">
                          <div className="font-semibold">{label}</div>
                          <div className="text-sm text-gray-600">{help}</div>
                        </div>
                        <div className="w-1/2 flex items-center gap-3">
                          <input id={`${key}-input`} className="hidden" type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFile(key as string, e.target.files?.[0])} />
                          <label htmlFor={`${key}-input`} className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 cursor-pointer">
                            <span className="text-sm text-gray-700">Choose file</span>
                          </label>
                          <div className="flex-1 text-sm text-gray-600">{uploadedNames[key as string] || 'No file chosen'}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!allUploaded && (
                    <div className="text-sm text-red-700">Please upload all documents. Missing: {missing}</div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>Back</Button>
                    <Button type="submit" className="bg-blue-600" disabled={!allUploaded}>Save & Next</Button>
                  </div>
                </form>
              )}

              {activeTab === 'ack' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Acknowledgement</h2>
                  <p className="text-sm text-gray-700">Please review your uploaded documents. Once you submit, admin will be notified to review your application. After admin approval you will get access to the dashboard.</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setActiveTab('kyc')}>Back</Button>
                    <Button onClick={() => {
                      if (!allUploaded) {
                        setMessage('Please upload all required documents before submitting the application.');
                        setMessageType('error');
                        setActiveTab('kyc');
                        return;
                      }
                      setMessage('Application submitted to admin.');
                      setMessageType('success');
                    }} className="bg-blue-600">Submit</Button>
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
