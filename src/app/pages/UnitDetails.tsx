import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getUnit, updateUnit, deleteUnit, assignUnit, removeAssignment, getUsers, updateUser, Unit, User } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Edit, Trash2, UserPlus, UserMinus, Calendar, QrCode, Printer, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export function UnitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    asset_tag: '',
    device_type: '',
    brand: '',
    model: '',
    serial_number: '',
    status: 'available' as Unit['status'],
  });

  // Assignment form state
  const [selectedUserId, setSelectedUserId] = useState('');

  // Edit user form state
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    department: '',
    email: '',
    contact_number: '',
  });

  useEffect(() => {
    if (id) {
      loadUnit();
      loadUsers();
    }
  }, [id]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const data = await getUnit(id!);
      setUnit(data);
      setEditForm({
        asset_tag: data.asset_tag,
        device_type: data.device_type,
        brand: data.brand,
        model: data.model,
        serial_number: data.serial_number,
        status: data.status,
      });
    } catch (error) {
      console.error('Error loading unit:', error);
      toast.error('Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleEdit = async () => {
    try {
      await updateUnit(id!, editForm);
      toast.success('Unit updated successfully');
      setEditDialogOpen(false);
      loadUnit();
    } catch (error) {
      console.error('Error updating unit:', error);
      toast.error('Failed to update unit');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUnit(id!);
      toast.success('Unit deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit');
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await assignUnit(id!, selectedUserId);
      toast.success('Unit assigned successfully');
      setAssignDialogOpen(false);
      setSelectedUserId('');
      loadUnit();
    } catch (error) {
      console.error('Error assigning unit:', error);
      toast.error('Failed to assign unit');
    }
  };

  const handleUnassign = async () => {
    if (!unit?.assignment) return;

    try {
      await removeAssignment(unit.assignment.id);
      toast.success('Assignment removed successfully');
      loadUnit();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const openEditUserDialog = () => {
    if (!unit?.assigned_user) return;
    
    setEditUserForm({
      full_name: unit.assigned_user.full_name,
      department: unit.assigned_user.department,
      email: unit.assigned_user.email,
      contact_number: unit.assigned_user.contact_number,
    });
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!unit?.assigned_user) return;

    try {
      await updateUser(unit.assigned_user.id, editUserForm);
      toast.success('User information updated successfully');
      setEditUserDialogOpen(false);
      loadUnit();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user information');
    }
  };

  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print QR code');
      return;
    }

    const qrCodeElement = document.getElementById('qr-code-print');
    if (!qrCodeElement) {
      toast.error('QR Code not found');
      return;
    }

    const qrCodeSVG = qrCodeElement.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${unit?.asset_tag}</title>
          <style>
            @media print {
              @page {
                margin: 0.5in;
              }
              body {
                margin: 0;
                padding: 20px;
              }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 40px 20px;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-code {
              margin: 20px 0;
              border: 2px solid #e5e7eb;
              padding: 20px;
              display: inline-block;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #111827;
            }
            .info {
              margin-top: 20px;
              text-align: left;
              max-width: 400px;
            }
            .info-section {
              margin-bottom: 15px;
            }
            .info-label {
              font-weight: 600;
              color: #374151;
              font-size: 14px;
            }
            .info-value {
              color: #111827;
              font-size: 14px;
              margin-left: 10px;
            }
            .divider {
              border-top: 1px solid #e5e7eb;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Asset: ${unit?.asset_tag}</h1>
            <div class="qr-code">
              ${qrCodeSVG}
            </div>
            <div class="info">
              <div class="info-section">
                <span class="info-label">Device Type:</span>
                <span class="info-value">${unit?.device_type}</span>
              </div>
              <div class="info-section">
                <span class="info-label">Brand:</span>
                <span class="info-value">${unit?.brand}</span>
              </div>
              <div class="info-section">
                <span class="info-label">Model:</span>
                <span class="info-value">${unit?.model}</span>
              </div>
              <div class="info-section">
                <span class="info-label">Serial Number:</span>
                <span class="info-value">${unit?.serial_number}</span>
              </div>
              <div class="info-section">
                <span class="info-label">Status:</span>
                <span class="info-value">${unit?.status}</span>
              </div>
              ${unit?.assigned_user ? `
                <div class="divider"></div>
                <div class="info-section">
                  <span class="info-label">Assigned To:</span>
                  <span class="info-value">${unit.assigned_user.full_name}</span>
                </div>
                <div class="info-section">
                  <span class="info-label">Department:</span>
                  <span class="info-value">${unit.assigned_user.department || 'N/A'}</span>
                </div>
                <div class="info-section">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${unit.assigned_user.email}</span>
                </div>
                <div class="info-section">
                  <span class="info-label">Contact:</span>
                  <span class="info-value">${unit.assigned_user.contact_number || 'N/A'}</span>
                </div>
                <div class="info-section">
                  <span class="info-label">Assigned Date:</span>
                  <span class="info-value">${unit.assignment ? new Date(unit.assignment.assigned_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              ` : ''}
            </div>
            <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
              Printed: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
            </p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Trigger print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handlePrintSticker = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print sticker');
      return;
    }

    const qrCodeElement = document.getElementById('qr-code-print');
    if (!qrCodeElement) {
      toast.error('QR Code not found');
      return;
    }

    const qrCodeSVG = qrCodeElement.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Sticker - ${unit?.asset_tag}</title>
          <style>
            @media print {
              @page {
                size: 2.5in 2.5in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              width: 2.5in;
              height: 2.5in;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
            }
            .sticker-container {
              width: 100%;
              height: 100%;
              padding: 0.2in;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 1px dashed #ccc;
            }
            .qr-code {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code svg {
              display: block;
              width: 2in !important;
              height: 2in !important;
            }
          </style>
        </head>
        <body>
          <div class="sticker-container">
            <div class="qr-code">
              ${qrCodeSVG}
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Trigger print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 250);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading unit details...</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unit not found</h3>
            <Link to="/">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{unit.asset_tag}</h1>
                <p className="mt-1 text-sm text-gray-600">{unit.device_type}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Unit Information</CardTitle>
                  <Badge className={getStatusColor(unit.status)}>{unit.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-600">Asset Tag</Label>
                    <p className="text-lg font-medium mt-1">{unit.asset_tag}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Device Type</Label>
                    <p className="text-lg font-medium mt-1">{unit.device_type}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Brand</Label>
                    <p className="text-lg font-medium mt-1">{unit.brand}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Model</Label>
                    <p className="text-lg font-medium mt-1">{unit.model}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Serial Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-lg font-medium">{unit.serial_number}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQrDialogOpen(true)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Created At</Label>
                    <p className="text-lg font-medium mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(unit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {unit.assigned_user ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Assigned To</Label>
                      <p className="text-lg font-medium mt-1">{unit.assigned_user.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Department</Label>
                      <p className="mt-1">{unit.assigned_user.department || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="mt-1">{unit.assigned_user.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Contact</Label>
                      <p className="mt-1">{unit.assigned_user.contact_number || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Assigned Date</Label>
                      <p className="mt-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(unit.assignment!.assigned_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleUnassign}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unassign
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={openEditUserDialog}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">This unit is not assigned to anyone</p>
                    <Button onClick={() => setAssignDialogOpen(true)} className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign to User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
            <DialogDescription>Update the unit information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Asset Tag</Label>
              <Input
                value={editForm.asset_tag}
                onChange={(e) => setEditForm({ ...editForm, asset_tag: e.target.value })}
              />
            </div>
            <div>
              <Label>Device Type</Label>
              <Input
                value={editForm.device_type}
                onChange={(e) => setEditForm({ ...editForm, device_type: e.target.value })}
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Input
                value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
              />
            </div>
            <div>
              <Label>Serial Number</Label>
              <Input
                value={editForm.serial_number}
                onChange={(e) => setEditForm({ ...editForm, serial_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value as Unit['status'] })}>
                <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Unit to User</DialogTitle>
            <DialogDescription>Select a user to assign this unit to.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User <span className="text-red-500">*</span></Label>
              <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>Are you sure you want to delete this unit? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
            <DialogDescription>Update the user's information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={editUserForm.full_name}
                onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                value={editUserForm.department}
                onChange={(e) => setEditUserForm({ ...editUserForm, department: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={editUserForm.contact_number}
                onChange={(e) => setEditUserForm({ ...editUserForm, contact_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QR Code - Unit Information</DialogTitle>
            <DialogDescription>Scan this QR code to view complete unit and assignment information</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div id="qr-code-print">
              <QRCodeSVG 
                value={JSON.stringify({
                  asset_tag: unit.asset_tag,
                  device_type: unit.device_type,
                  brand: unit.brand,
                  model: unit.model,
                  serial_number: unit.serial_number,
                  status: unit.status,
                  created_at: unit.created_at,
                  assigned_user: unit.assigned_user ? {
                    full_name: unit.assigned_user.full_name,
                    department: unit.assigned_user.department,
                    email: unit.assigned_user.email,
                    contact_number: unit.assigned_user.contact_number,
                  } : null,
                  assignment: unit.assignment ? {
                    assigned_date: unit.assignment.assigned_date,
                    status: unit.assignment.status,
                  } : null,
                })}
                size={300}
                level="M"
              />
            </div>
            <div className="text-sm text-gray-600 text-center max-w-md">
              <p className="font-medium mb-2">QR Code Contains:</p>
              <div className="text-left space-y-1">
                <p>• Asset Tag: {unit.asset_tag}</p>
                <p>• Device: {unit.device_type} - {unit.brand} {unit.model}</p>
                <p>• Serial: {unit.serial_number}</p>
                <p>• Status: {unit.status}</p>
                {unit.assigned_user && (
                  <>
                    <p className="font-medium mt-2">Assigned To:</p>
                    <p>• User: {unit.assigned_user.full_name}</p>
                    <p>• Department: {unit.assigned_user.department || 'N/A'}</p>
                    <p>• Email: {unit.assigned_user.email}</p>
                    <p>• Contact: {unit.assigned_user.contact_number || 'N/A'}</p>
                    <p>• Assigned: {new Date(unit.assignment!.assigned_date).toLocaleDateString()}</p>
                  </>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintQRCode}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print QR Code
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintSticker}
            >
              <Tag className="h-4 w-4 mr-2" />
              Print Sticker Label
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}