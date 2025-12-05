import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { superAdminApi, type UserData } from '@/api/superAdmin';

export function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    address: '',
    phone: '',
    pincode: '',
    district: '',
    state: '',
    email: '',
    password: '',
    permit_holder_type: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await superAdminApi.getUsers({ page: 1, pageSize: 5000 });
      setUsers(response.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        address: user.address,
        phone: user.phone,
        pincode: String(user.pincode),
        district: user.district,
        state: user.state,
        email: user.email,
        password: user.password,
        permit_holder_type: user.permit_holder_type,
      });
    } else {
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        address: '',
        phone: '',
        pincode: '',
        district: '',
        state: '',
        email: '',
        password: '',
        permit_holder_type: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      username: '',
      address: '',
      phone: '',
      pincode: '',
      district: '',
      state: '',
      email: '',
      password: '',
      permit_holder_type: '',
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.username ||
      !formData.email || !formData.password || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && selectedUser) {
        await superAdminApi.updateUser(selectedUser.id, formData);
        alert('User updated successfully!');
      } else {
        await superAdminApi.createUser(formData);
        alert('User created successfully!');
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Failed to save user:', err);
      alert(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await superAdminApi.deleteUser(userId);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const columns = [
    {
      key: 'first_name',
      header: 'First Name',
      render: (value: string, row: UserData) => (
        <button
          onClick={() => handleOpenDialog(row)}
          className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium">{value}</span>
        </button>
      ),
    },
    {
      key: 'last_name',
      header: 'Last Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'username',
      header: 'Username',
      render: (value: string) => <span className="text-gray-600">@{value}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Location',
      render: (row: UserData) => (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="truncate max-w-[200px]">{row.district}, {row.state}</span>
        </div>
      ),
    },
    {
      key: 'permit_holder_type',
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline" className="font-normal">
          {value}
        </Badge>
      ),
    },
    {
      key: 'vehicleCount',
      header: 'Vehicles',
      render: (value: number) => (
        <Badge variant={value > 0 ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (row: UserData) => handleOpenDialog(row),
      icon: Edit,
    },
    {
      label: 'Delete',
      onClick: (row: UserData) => handleDelete(row.id),
      variant: 'destructive' as const,
      icon: Trash2,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions ({users.length} users)</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Individual</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.permit_holder_type === 'Individual').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Transport Company</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.permit_holder_type === 'Transport Company').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">With Vehicles</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.vehicleCount > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={users}
            columns={columns}
            actions={actions}
            searchable={true}
            pagination={true}
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update user information and permissions'
                : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Enter district"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Enter state"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permit_holder_type">Permit Holder Type</Label>
              <Input
                id="permit_holder_type"
                value={formData.permit_holder_type}
                onChange={(e) => setFormData({ ...formData, permit_holder_type: e.target.value })}
                placeholder="e.g., Individual, Transport Company"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}