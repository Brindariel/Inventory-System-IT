import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getUnits, Unit } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Search, Laptop, HardDrive, Monitor, Smartphone, Server, Package } from 'lucide-react';
import { toast } from 'sonner';
import { SampleDataSeeder } from '../components/SampleDataSeeder';

export function Dashboard() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [units, searchTerm, statusFilter, deviceTypeFilter]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUnits();
      setUnits(data);
    } catch (error: any) {
      console.error('Error loading units:', error);
      const errorMessage = error.message || 'Failed to load units';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterUnits = () => {
    let filtered = [...units];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(unit => 
        unit.asset_tag.toLowerCase().includes(term) ||
        unit.serial_number.toLowerCase().includes(term) ||
        unit.brand.toLowerCase().includes(term) ||
        unit.model.toLowerCase().includes(term) ||
        unit.assigned_user?.full_name.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status === statusFilter);
    }

    // Device type filter
    if (deviceTypeFilter !== 'all') {
      filtered = filtered.filter(unit => unit.device_type === deviceTypeFilter);
    }

    setFilteredUnits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'assigned':
        return 'bg-blue-500';
      case 'under repair':
        return 'bg-yellow-500';
      case 'retired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'laptop':
        return <Laptop className="h-5 w-5" />;
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      case 'phone':
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'storage':
        return <HardDrive className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'available').length,
    assigned: units.filter(u => u.status === 'assigned').length,
    underRepair: units.filter(u => u.status === 'under repair').length,
  };

  // Get unique device types from data
  const uniqueDeviceTypes = [...new Set(units.map(u => u.device_type))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IT Inventory Management</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your IT assets and assignments</p>
            </div>
            <div className="flex gap-3">
              <Link to="/users">
                <Button variant="outline">Manage Users</Button>
              </Link>
              <Link to="/add-unit">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Under Repair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.underRepair}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by asset tag, serial number, user name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="under repair">Under Repair</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueDeviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading units...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first unit or load sample data'}
              </p>
              {!searchTerm && statusFilter === 'all' && deviceTypeFilter === 'all' && units.length === 0 && (
                <div className="flex flex-col items-center gap-4">
                  <Link to="/add-unit">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Unit
                    </Button>
                  </Link>
                  <div className="text-gray-600">or</div>
                  <SampleDataSeeder />
                </div>
              )}
              {!searchTerm && statusFilter === 'all' && deviceTypeFilter === 'all' && units.length > 0 && (
                <Link to="/add-unit">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Unit
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnits.map((unit) => (
              <Link key={unit.id} to={`/units/${unit.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getDeviceIcon(unit.device_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{unit.asset_tag}</CardTitle>
                          <p className="text-sm text-gray-600">{unit.device_type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(unit.status)}>
                        {unit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Brand:</span> {unit.brand}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {unit.model}
                      </div>
                      <div>
                        <span className="font-medium">Serial:</span> {unit.serial_number}
                      </div>
                      {unit.assigned_user && (
                        <div className="pt-2 border-t mt-3">
                          <div className="font-medium text-blue-600">Assigned to:</div>
                          <div>{unit.assigned_user.full_name}</div>
                          <div className="text-gray-600">{unit.assigned_user.department}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}