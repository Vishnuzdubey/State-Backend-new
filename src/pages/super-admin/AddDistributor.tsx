import { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function AddDistributor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    code: '',
    name: '',
    gstn: '',
    address: '',
    pinCode: '',
    district: '',
    state: '',
  });

  const [files, setFiles] = useState({
    idProof: null as File | null,
    addressProof: null as File | null,
    registrationForm: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    setFiles({ ...files, [field]: file });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.code.trim()) newErrors.code = 'Distributor Code is required';
    if (!form.name.trim()) newErrors.name = 'Distributor Name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.pinCode.trim()) newErrors.pinCode = 'Pin Code is required';
    else if (!/^\d{6}$/.test(form.pinCode)) newErrors.pinCode = 'Pin Code must be 6 digits';
    if (!form.district.trim()) newErrors.district = 'District is required';
    if (!form.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add API call here
      console.log('Distributor Data:', form);
      console.log('Files:', files);
      alert('Distributor Added Successfully!');
      navigate('/super-admin/distributors');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/super-admin/distributors')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>All Distributors</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Add Distributor</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">ADD DISTRIBUTOR</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Distributor Identifiers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Distributor Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distributor Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Enter Distributor Code"
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm">{errors.code}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Distributor Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter Distributor Name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Address Details
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">GSTN</label>
                <Input
                  name="gstn"
                  value={form.gstn}
                  onChange={handleChange}
                  placeholder="Enter GSTN (Optional)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-500' : ''
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pin Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="Enter Pin Code"
                    maxLength={6}
                    className={errors.pinCode ? 'border-red-500' : ''}
                  />
                  {errors.pinCode && (
                    <p className="text-red-500 text-sm">{errors.pinCode}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    District <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    placeholder="Enter District"
                    className={errors.district ? 'border-red-500' : ''}
                  />
                  {errors.district && (
                    <p className="text-red-500 text-sm">{errors.district}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter State"
                    className={errors.state ? 'border-red-500' : ''}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm">{errors.state}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Documents Upload
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ID Proof</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'idProof')}
                      className="hidden"
                      id="idProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="idProof"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {files.idProof ? files.idProof.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Address Proof</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'addressProof')}
                      className="hidden"
                      id="addressProof"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="addressProof"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {files.addressProof ? files.addressProof.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Registration Form</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'registrationForm')}
                      className="hidden"
                      id="registrationForm"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="registrationForm"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {files.registrationForm ? files.registrationForm.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}