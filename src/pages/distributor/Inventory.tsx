import { useState, useEffect } from 'react';
import { Package, Send, Wifi, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { distributorApi, type InventoryDevice, type RFCData } from '@/api/distributor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function DistributorInventory() {
  const [inventory, setInventory] = useState<InventoryDevice[]>([]);
  const [rfcs, setRfcs] = useState<RFCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedRFC, setSelectedRFC] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [rfcSearchTerm, setRfcSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(100);

  useEffect(() => {
    fetchInventory();
    fetchRFCs();
  }, [page]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await distributorApi.getInventory({ page, limit });
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchRFCs = async (search?: string) => {
    try {
      const response = await distributorApi.getRFCs({ 
        page: 1, 
        limit: 100,
        search: search || rfcSearchTerm 
      });
      setRfcs(response.rfcs);
    } catch (err) {
      console.error('Failed to fetch RFCs:', err);
    }
  };

  const handleAssignToRFC = async () => {
    if (!selectedRFC || selectedDevices.length === 0) {
      alert('Please select RFC and at least one device');
      return;
    }

    setIsAssigning(true);

    try {
      console.log('Starting RFC assignment...');
      console.log('RFC ID:', selectedRFC);
      console.log('IMEIs:', selectedDevices);
      
      await distributorApi.assignToRFC({
        rfcId: selectedRFC,
        imeis: selectedDevices,
      });

      alert(`Successfully assigned ${selectedDevices.length} device(s) to RFC`);
      setIsAssignDialogOpen(false);
      setSelectedDevices([]);
      setSelectedRFC('');
      fetchInventory();
    } catch (err) {
      console.error('❌ Failed to assign devices:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        error: err,
      });
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign devices';
      alert(`Assignment failed: ${errorMessage}`);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenAssignDialog = () => {
    if (selectedDevices.length === 0) {
      alert('Please select at least one device');
      return;
    }
    setIsAssignDialogOpen(true);
  };

  const handleToggleDevice = (imei: string) => {
    setSelectedDevices(prev =>
      prev.includes(imei)
        ? prev.filter(i => i !== imei)
        : [...prev, imei]
    );
  };

  const handleToggleAll = () => {
    if (selectedDevices.length === inventory.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(inventory.map(d => d.imei));
    }
  };

  const columns = [
    {
      key: 'select',
      header: () => (
        <Checkbox
          checked={selectedDevices.length === inventory.length && inventory.length > 0}
          onCheckedChange={handleToggleAll}
        />
      ),
      render: (_value: any, row: InventoryDevice) => (
        <Checkbox
          checked={selectedDevices.includes(row.imei)}
          onCheckedChange={() => handleToggleDevice(row.imei)}
        />
      ),
    },
    {
      key: 'imei',
      header: 'IMEI',
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial Number',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'VLTD_model_code',
      header: 'Model Code',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'eSIM_1_provider',
      header: 'eSIM Providers',
      render: (_value: string, row: InventoryDevice) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{row.eSIM_1_provider} / {row.eSIM_2_provider}</span>
        </div>
      ),
    },
    {
      key: 'certificate_number',
      header: 'Certificate',
      render: (value: string) => (
        <span className="text-sm font-mono">{value}</span>
      ),
    },
    {
      key: 'rfc_entity_id',
      header: 'Status',
      render: (value: string | null) => (
        value ? (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        ) : (
          <Badge variant="secondary">Unassigned</Badge>
        )
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

  const unassignedCount = inventory.filter(d => !d.rfc_entity_id).length;
  const assignedCount = inventory.filter(d => d.rfc_entity_id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage and assign inventory to RFCs ({inventory.length} devices)</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleOpenAssignDialog}
          disabled={selectedDevices.length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Assign to RFC ({selectedDevices.length})
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Inventory</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Assigned to RFC</p>
                <p className="text-2xl font-bold">{assignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold">{unassignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={inventory}
            columns={columns}
            searchable={true}
            pagination={true}
            pageSize={20}
          />
        </CardContent>
      </Card>

      {/* Assign to RFC Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Devices to RFC</DialogTitle>
            <DialogDescription>
              Assign {selectedDevices.length} selected device(s) to an RFC
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search RFC</Label>
              <Input
                value={rfcSearchTerm}
                onChange={(e) => {
                  setRfcSearchTerm(e.target.value);
                  fetchRFCs(e.target.value);
                }}
                placeholder="Search by name or email..."
              />
            </div>

            <div className="space-y-2">
              <Label>Select RFC *</Label>
              <Select value={selectedRFC} onValueChange={setSelectedRFC}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an RFC" />
                </SelectTrigger>
                <SelectContent>
                  {rfcs.map((rfc) => (
                    <SelectItem key={rfc.id} value={rfc.id}>
                      {rfc.name} ({rfc.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Selected Devices:</strong> {selectedDevices.length}
              </p>
              <div className="mt-2 max-h-32 overflow-y-auto">
                {selectedDevices.map((imei, idx) => (
                  <p key={idx} className="text-xs font-mono text-blue-700">
                    {imei}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedRFC('');
              }}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignToRFC}
              disabled={isAssigning || !selectedRFC}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? 'Assigning...' : 'Assign to RFC'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}