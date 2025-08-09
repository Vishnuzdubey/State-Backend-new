import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';

export function PlanDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock plan data based on the ID
  const planData = {
    id: id || '7',
    planName: '24 Month',
    planDescription: '24 Month plan',
    price: '2',
    validityMonth: '24',
    status: '1',
    createdDate: '2024-07-29T10:38:44',
    createdBy: '1'
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header with Navigation */}
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
            <span className="text-gray-900 font-medium">Plan Details</span>
          </div>
        </div>
        
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/super-admin/plans/add')}
        >
          Add Plan
        </Button>
      </div>

      {/* Plan Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">ID</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {planData.id}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Plan Name</label>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  {planData.planName}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Plan Description</label>
                <div className="mt-1 text-gray-900">
                  {planData.planDescription}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Price</label>
                <div className="mt-1 text-gray-900">
                  {planData.price}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Validity Month</label>
                <div className="mt-1 text-gray-900">
                  {planData.validityMonth}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge 
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    {planData.status === '1' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <div className="mt-1 text-gray-900">
                  {new Date(planData.createdDate).toLocaleString()}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Created By</label>
                <div className="mt-1 text-gray-900">
                  {planData.createdBy}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}