import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Cpu, 
  Shield, 
  MapPin, 
  Activity, 
  Users, 
  Package, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: 'Device Management',
      description: 'Comprehensive tracking and management of all vehicle tracking devices across manufacturers, distributors, and RFCs.',
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Monitor device locations and status in real-time with advanced mapping and geolocation capabilities.',
    },
    {
      icon: Shield,
      title: 'Compliance & Security',
      description: 'Ensure regulatory compliance with built-in certificate management and secure data handling.',
    },
    {
      icon: Users,
      title: 'Multi-role Access',
      description: 'Role-based access control for Super Admins, Manufacturers, Distributors, and RFCs with tailored workflows.',
    },
    {
      icon: Activity,
      title: 'Analytics & Reports',
      description: 'Powerful analytics dashboard with real-time insights and comprehensive reporting capabilities.',
    },
    {
      icon: TrendingUp,
      title: 'Inventory Control',
      description: 'Complete inventory management with approval workflows and status tracking across the supply chain.',
    },
  ];

  const benefits = [
    'Streamlined device approval and certification process',
    'Real-time inventory and status tracking',
    'Automated compliance and certificate management',
    'Comprehensive user and role management',
    'Advanced analytics and reporting',
    'Secure multi-tenant architecture',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  RoadEye
                </h1>
                <p className="text-xs text-gray-500">Vehicle Tracking Admin</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
                <Activity className="h-4 w-4 mr-2" />
                Next-Generation Vehicle Tracking Management
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Manage Your Device
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Ecosystem with Confidence
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10">
                Comprehensive platform for managing vehicle tracking devices across manufacturers, 
                distributors, and RFCs with real-time monitoring, compliance tracking, and advanced analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="text-lg px-8"
                >
                  Register as Manufacturer
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Dashboard Analytics"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border-2 border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                  </div>
                </div>
              </div>
              {/* Floating Device Card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border-2 border-purple-100">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-900">10,847</div>
                    <div className="text-xs text-gray-600">Active Devices</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Active Devices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">1K+</div>
              <div className="text-sm text-gray-600">Distributors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your vehicle tracking device ecosystem efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose RoadEye?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built for scale, security, and efficiency. Our platform streamlines 
                every aspect of vehicle tracking device management.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Card className="shadow-2xl border-2">
                <CardHeader>
                  <CardTitle>Role-Based Dashboards</CardTitle>
                  <CardDescription>Tailored experiences for every user type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Super Admin</span>
                    </div>
                    <p className="text-sm text-gray-600">Complete system control and oversight</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Manufacturer</span>
                    </div>
                    <p className="text-sm text-gray-600">Device registration and inventory management</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Distributor</span>
                    </div>
                    <p className="text-sm text-gray-600">Distribution and allocation tracking</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold">RFC</span>
                    </div>
                    <p className="text-sm text-gray-600">Device monitoring and user management</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of manufacturers, distributors, and RFCs using RoadEye
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
            >
              Login to Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="text-lg px-8 text-white border-white hover:bg-white/10"
            >
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RoadEye</span>
              </div>
              <p className="text-sm">
                Advanced vehicle tracking device management platform
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 RoadEye. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
