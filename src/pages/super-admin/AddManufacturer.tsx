import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, Mail, Phone, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddManufacturerFormData {
  firstName: string;
  lastName: string;
  entityName: string;
  businessEmail: string;
  businessMobile: string;
  gstNo: string;
  panNo: string;
  address: string;
  area: string;
  pinCode: string;
  district: string;
  state: string;
  country: string;
}

export function AddManufacturer() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddManufacturerFormData>({
    firstName: '',
    lastName: '',
    entityName: '',
    businessEmail: '',
    businessMobile: '',
    gstNo: '',
    panNo: '',
    address: '',
    area: '',
    pinCode: '',
    district: '',
    state: '',
    country: 'India'
  });

  const [errors, setErrors] = useState<Partial<AddManufacturerFormData>>({});

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Lakshadweep', 'Puducherry'
  ];

  const handleInputChange = (field: keyof AddManufacturerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AddManufacturerFormData> = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.entityName.trim()) newErrors.entityName = 'Entity Name is required';
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business Email is required';
    if (!formData.businessMobile.trim()) newErrors.businessMobile = 'Business Mobile No is required';
    if (!formData.gstNo.trim()) newErrors.gstNo = 'GST No is required';
    if (!formData.panNo.trim()) newErrors.panNo = 'PAN No is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin Code is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Email validation
    if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address';
    }

    // Mobile validation
    if (formData.businessMobile && !/^[6-9]\d{9}$/.test(formData.businessMobile)) {
      newErrors.businessMobile = 'Please enter a valid 10-digit mobile number';
    }

    // GST validation (basic format check)
    if (formData.gstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNo)) {
      newErrors.gstNo = 'Please enter a valid GST number';
    }

    // PAN validation
    if (formData.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNo)) {
      newErrors.panNo = 'Please enter a valid PAN number';
    }

    // Pin Code validation
    if (formData.pinCode && !/^[1-9][0-9]{5}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit pin code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Manufacturer data to be submitted:', formData);
      
      // Navigate back to manufacturers list
      navigate('/super-admin/manufacturers');
    } catch (error) {
      console.error('Error submitting manufacturer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      entityName: '',
      businessEmail: '',
      businessMobile: '',
      gstNo: '',
      panNo: '',
      address: '',
      area: '',
      pinCode: '',
      district: '',
      state: '',
      country: 'India'
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/super-admin/manufacturers')}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Manufacturer</h1>
          <p className="text-gray-600">Create a new manufacturer account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityName">
                Entity Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="entityName"
                value={formData.entityName}
                onChange={(e) => handleInputChange('entityName', e.target.value)}
                placeholder="Enter company/entity name"
                className={errors.entityName ? 'border-red-500' : ''}
              />
              {errors.entityName && <p className="text-sm text-red-500">{errors.entityName}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessEmail">
                  Business Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                    placeholder="Enter business email"
                    className={`pl-10 ${errors.businessEmail ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.businessEmail && <p className="text-sm text-red-500">{errors.businessEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessMobile">
                  Business Mobile No <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="businessMobile"
                    value={formData.businessMobile}
                    onChange={(e) => handleInputChange('businessMobile', e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className={`pl-10 ${errors.businessMobile ? 'border-red-500' : ''}`}
                    maxLength={10}
                  />
                </div>
                {errors.businessMobile && <p className="text-sm text-red-500">{errors.businessMobile}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNo">
                  GST No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gstNo"
                  value={formData.gstNo}
                  onChange={(e) => handleInputChange('gstNo', e.target.value.toUpperCase())}
                  placeholder="Enter GST number"
                  className={errors.gstNo ? 'border-red-500' : ''}
                  maxLength={15}
                />
                {errors.gstNo && <p className="text-sm text-red-500">{errors.gstNo}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNo">
                  PAN No <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="panNo"
                  value={formData.panNo}
                  onChange={(e) => handleInputChange('panNo', e.target.value.toUpperCase())}
                  placeholder="Enter PAN number"
                  className={errors.panNo ? 'border-red-500' : ''}
                  maxLength={10}
                />
                {errors.panNo && <p className="text-sm text-red-500">{errors.panNo}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">
                  Area <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Enter area/locality"
                  className={errors.area ? 'border-red-500' : ''}
                />
                {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pinCode">
                  Pin Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pinCode"
                  value={formData.pinCode}
                  onChange={(e) => handleInputChange('pinCode', e.target.value)}
                  placeholder="Enter 6-digit pin code"
                  className={errors.pinCode ? 'border-red-500' : ''}
                  maxLength={6}
                />
                {errors.pinCode && <p className="text-sm text-red-500">{errors.pinCode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">
                  District <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="Enter district"
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                  className={errors.country ? 'border-red-500' : ''}
                  disabled
                />
                {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
