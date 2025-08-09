import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function AddPlan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    planName: '',
    planDescription: '',
    validityMonth: '',
    price: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validityOptions = [
    { value: '1', label: '1 Month' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
    { value: '24', label: '24 Months' },
    { value: '36', label: '36 Months' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.planName.trim()) newErrors.planName = 'Plan Name is required';
    if (!form.planDescription.trim()) newErrors.planDescription = 'Plan Description is required';
    if (!form.validityMonth) newErrors.validityMonth = 'Validity Month is required';
    if (!form.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add API call here
      console.log('Plan Data:', form);
      alert('Plan Added Successfully!');
      navigate('/super-admin/plans');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/super-admin/plans')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>List Plan</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Add Plan</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">ADD Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="planName"
                value={form.planName}
                onChange={handleChange}
                placeholder="Enter Plan Name"
                className={errors.planName ? 'border-red-500' : ''}
              />
              {errors.planName && (
                <p className="text-red-500 text-sm">{errors.planName}</p>
              )}
            </div>

            {/* Plan Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Plan Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="planDescription"
                value={form.planDescription}
                onChange={handleChange}
                placeholder="Enter Plan Description"
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.planDescription ? 'border-red-500' : ''
                }`}
              />
              {errors.planDescription && (
                <p className="text-red-500 text-sm">{errors.planDescription}</p>
              )}
            </div>

            {/* Validity Month */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Validity Month <span className="text-red-500">*</span>
              </label>
              <select
                name="validityMonth"
                value={form.validityMonth}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.validityMonth ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select</option>
                {validityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.validityMonth && (
                <p className="text-red-500 text-sm">{errors.validityMonth}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <Input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter Price"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price}</p>
              )}
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