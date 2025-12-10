import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users as UsersIcon, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { rfcApi } from '@/api/rfc';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  username: string;
  address: string;
  pincode: number;
  district: string;
  state: string;
  permit_holder_type: string;
  createdAt: string;
  vehicleCount: number;
}

interface CreateUserFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  district: string;
  state: string;
  username: string;
  permit_holder_type: string;
  password: string;
}

export function RFCUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserFormState>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    district: '',
    state: '',
    username: '',
    permit_holder_type: '',
    password: '123456',
  });

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rfcApi.getUsers(1, 100, search);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.first_name || !createForm.email || !createForm.phone) {
      setError('Please fill in required fields (First Name, Email, Phone)');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      await rfcApi.createUser({
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        email: createForm.email,
        phone: createForm.phone,
        address: createForm.address,
        pincode: createForm.pincode,
        district: createForm.district,
        state: createForm.state,
        username: createForm.username || createForm.first_name.toLowerCase(),
        permit_holder_type: createForm.permit_holder_type,
        password: createForm.password,
      });

      setSuccessMessage('User created successfully!');
      setCreateDialogOpen(false);
      resetCreateForm();
      await fetchUsers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      pincode: '',
      district: '',
      state: '',
      username: '',
      permit_holder_type: '',
      password: '123456',
    });
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage RFC users and their assigned devices</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No users found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <button
                      onClick={() => navigate(`/rfc/users/${encodeURIComponent(user.phone)}`)}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {user.first_name} {user.last_name}
                    </button>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{user.state}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">{user.vehicleCount}</span> vehicle(s)
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{user.permit_holder_type}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/rfc/users/${encodeURIComponent(user.phone)}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to your RFC</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  value={createForm.first_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, first_name: e.target.value })
                  }
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={createForm.last_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, last_name: e.target.value })
                  }
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <Input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="Phone Number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm({ ...createForm, address: e.target.value })
                }
                placeholder="Address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <Input
                  value={createForm.pincode}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, pincode: e.target.value })
                  }
                  placeholder="Pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <Input
                  value={createForm.district}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, district: e.target.value })
                  }
                  placeholder="District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <Input
                  value={createForm.state}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, state: e.target.value })
                  }
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, username: e.target.value })
                  }
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Type
                </label>
                <Input
                  value={createForm.permit_holder_type}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      permit_holder_type: e.target.value,
                    })
                  }
                  placeholder="e.g., Type D"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateUser}
                disabled={createLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {createLoading ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetCreateForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
