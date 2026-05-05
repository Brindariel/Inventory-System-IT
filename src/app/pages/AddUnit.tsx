import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { createUnit, Unit } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export function AddUnit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    asset_tag: '',
    device_type: '',
    brand: '',
    model: '',
    serial_number: '',
    status: 'available' as Unit['status'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.asset_tag || !formData.device_type || !formData.brand || !formData.model || !formData.serial_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newUnit = await createUnit(formData);
      toast.success('Unit created successfully');
      navigate(`/units/${newUnit.id}`);
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to create unit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Unit</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">Enter the details of the new IT asset</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Unit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="asset_tag" className="text-xs sm:text-sm">
                    Asset Tag <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="asset_tag"
                    value={formData.asset_tag}
                    onChange={(e) => handleChange('asset_tag', e.target.value)}
                    placeholder="e.g., LAPTOP-001"
                    required
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="device_type" className="text-xs sm:text-sm">
                    Device Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.device_type} onValueChange={(value) => handleChange('device_type', value)}>
                    <SelectTrigger id="device_type" className="text-sm">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="printer">Printer</SelectItem>
                      <SelectItem value="storage">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand" className="text-xs sm:text-sm">
                    Brand <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="e.g., Dell, HP, Apple"
                    required
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="model" className="text-xs sm:text-sm">
                    Model <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="e.g., Latitude 5520"
                    required
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="serial_number" className="text-xs sm:text-sm">
                    Serial Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => handleChange('serial_number', e.target.value)}
                    placeholder="e.g., SN123456789"
                    required
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange('status', value as Unit['status'])}>
                    <SelectTrigger id="status" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="under repair">Under Repair</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  className="w-full sm:w-auto order-2 sm:order-1 text-sm"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto order-1 sm:order-2 text-sm">
                  {loading ? (
                    <>
                      <div className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Create Unit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
