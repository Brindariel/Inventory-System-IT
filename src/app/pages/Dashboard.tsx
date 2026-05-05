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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    retired: units.filter(u => u.status === 'retired').length,
  };

  const chartData = [
    {
      name: 'Available',
      value: stats.available,
      fill: '#22c55e'
    },
    {
      name: 'Assigned',
      value: stats.assigned,
      fill: '#3b82f6'
    },
    {
      name: 'Under Repair',
      value: stats.underRepair,
      fill: '#eab308'
    },
    {
      name: 'Retired',
      value: stats.retired,
      fill: '#6b7280'
    }
  ];

  // Get unique device types from data
  const uniqueDeviceTypes = [...new Set(units.map(u => u.device_type))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IT Inventory Management</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">Manage your IT assets and assignments</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Link to="/users" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Manage Users</Button>
              </Link>
              <Link to="/add-unit" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Add Unit</span>
                  <span className="inline xs:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card className="hidden sm:block">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Repair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.underRepair}</div>
            </CardContent>
          </Card>
          <Card className="hidden lg:block">
            <CardHeader className="pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Retired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.retired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Bar Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Units by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 sm:h-4 w-3 sm:w-4" />
                <Input
                  placeholder="Search by asset tag, serial, user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Status" />
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
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueDeviceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units List */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block h-6 sm:h-8 w-6 sm:w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading units...</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <Package className="h-10 sm:h-12 w-10 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No units found</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                {searchTerm || statusFilter !== 'all' || deviceTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first unit or load sample data'}
              </p>
              {!searchTerm && statusFilter === 'all' && deviceTypeFilter === 'all' && units.length === 0 && (
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <Link to="/add-unit" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto text-sm">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Add First Unit
                    </Button>
                  </Link>
                  <div className="text-xs sm:text-sm text-gray-600">or</div>
                  <SampleDataSeeder />
                </div>
              )}
              {!searchTerm && statusFilter === 'all' && deviceTypeFilter === 'all' && units.length > 0 && (
                <Link to="/add-unit" className="inline-block">
                  <Button className="text-sm">
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Add First Unit
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredUnits.map((unit) => (
              <Link key={unit.id} to={`/units/${unit.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">
                          {getDeviceIcon(unit.device_type)}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">{unit.asset_tag}</CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{unit.device_type}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(unit.status)} flex-shrink-0 text-xs`}>
                        {unit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="truncate">
                        <span className="font-medium">Brand:</span> <span className="truncate">{unit.brand}</span>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Model:</span> <span className="truncate">{unit.model}</span>
                      </div>
                      <div className="truncate">
                        <span className="font-medium">Serial:</span> <span className="truncate">{unit.serial_number}</span>
                      </div>
                      {unit.assigned_user && (
                        <div className="pt-2 border-t mt-2 sm:mt-3">
                          <div className="font-medium text-blue-600 text-xs sm:text-sm">Assigned to:</div>
                          <div className="truncate">{unit.assigned_user.full_name}</div>
                          <div className="text-gray-600 truncate text-xs">{unit.assigned_user.department}</div>
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
