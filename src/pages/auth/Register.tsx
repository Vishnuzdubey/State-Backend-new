import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Cpu, CheckCircle2, User, MapPin } from 'lucide-react';
import { manufacturerApi } from '@/api';

const registerSchema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
  fullname_user: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode'),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await manufacturerApi.register(data);

      if (response.status === 'success') {
        setIsSuccess(true);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <Card className="shadow-2xl border-2 border-green-200">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    Registration Submitted Successfully!
                  </h2>
                  <p className="text-gray-600">Your application is being reviewed</p>
                </div>
                
                {/* Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Cpu className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Our team will verify your company details within 24-48 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>You'll receive login credentials via email once approved</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Full platform access will be granted immediately after approval</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-center text-sm text-gray-700">
                    <strong className="block text-amber-700 mb-1">Important!</strong>
                    Please check your email (including spam folder) for verification updates.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/')}
                  >
                    Go to Home
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Image and Info */}
          <div className="hidden lg:block space-y-6 sticky top-8">
            <div className="text-left">
              <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center shadow-lg mb-4">
                <Cpu className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Join VahanSaarthi's
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Manufacturing Network
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Register your company to access our comprehensive vehicle tracking device management platform
              </p>
            </div>

            {/* Feature Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
                alt="Registration Benefits"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Get Started Today</h3>
                  <p className="text-sm text-blue-100">Join 500+ manufacturers already using VahanSaarthi</p>
                </div>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Quick Approval</h4>
                <p className="text-xs text-gray-600">Get verified within 24-48 hours</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-100">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-3">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Full Access</h4>
                <p className="text-xs text-gray-600">Complete platform features</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="space-y-6">
            <div className="text-center lg:hidden">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                <Cpu className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Manufacturer Registration
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Register your company to get started with VahanSaarthi
              </p>
            </div>

            <Card className="shadow-2xl border-2 border-blue-100/50 backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Company Registration
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Fill in your company details to register
                </CardDescription>
              </div>
              <div className="hidden sm:flex h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center shadow-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Company Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gradient-to-r from-blue-200 to-indigo-200">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Company Information
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter company name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gst">GST Number *</Label>
                    <Input
                      id="gst"
                      placeholder="22AAAAA0000A1Z5"
                      {...register('gst')}
                      className={errors.gst ? 'border-red-500' : ''}
                    />
                    {errors.gst && (
                      <p className="text-sm text-red-500">{errors.gst.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number *</Label>
                    <Input
                      id="pan"
                      placeholder="AAAAA0000A"
                      {...register('pan')}
                      className={errors.pan ? 'border-red-500' : ''}
                    />
                    {errors.pan && (
                      <p className="text-sm text-red-500">{errors.pan.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gradient-to-r from-purple-200 to-pink-200">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Person
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname_user">Full Name *</Label>
                  <Input
                    id="fullname_user"
                    placeholder="Enter full name"
                    {...register('fullname_user')}
                    className={errors.fullname_user ? 'border-red-500' : ''}
                  />
                  {errors.fullname_user && (
                    <p className="text-sm text-red-500">{errors.fullname_user.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      {...register('phone')}
                      className={errors.phone ? 'border-red-500' : ''}
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gradient-to-r from-green-200 to-emerald-200">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Address
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="Enter complete address"
                    {...register('address')}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      {...register('district')}
                      className={errors.district ? 'border-red-500' : ''}
                    />
                    {errors.district && (
                      <p className="text-sm text-red-500">{errors.district.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      {...register('state')}
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="123456"
                      {...register('pincode')}
                      className={errors.pincode ? 'border-red-500' : ''}
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-red-500">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Register'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
