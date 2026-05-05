import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getUsers, createUser, updateUser, deleteUser, User } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, Plus, Mail, Phone, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    email: '',
    contact_number: '',
  });
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    department: '',
    email: '',
    contact_number: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      const errorMessage = error.message || 'Failed to load users';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      await createUser(formData);
      toast.success('User created successfully');
      setDialogOpen(false);
      setFormData({
        full_name: '',
        department: '',
        email: '',
        contact_number: '',
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFormData.full_name || !editFormData.email) {
      toast.error('Name and email are required');
      return;
    }

    if (!selectedUser) {
      toast.error('No user selected for editing');
      return;
    }

    try {
      await updateUser(selectedUser.id, editFormData);
      toast.success('User updated successfully');
      setEditDialogOpen(false);
      setEditFormData({
        full_name: '',
        department: '',
        email: '',
        contact_number: '',
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error('No user selected for deletion');
      return;
    }

    try {
      await deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.message || 'Failed to delete user';
      
      // Don't close the dialog on error so user sees the message
      
      // Show user-friendly error message
      if (errorMessage.includes('active assignments')) {
        toast.error('Cannot delete user with active assignments. Please unassign all units first.', {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm w-auto">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Back</span>
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600">Manage employees and assignees</p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">All Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-block h-6 sm:h-8 w-6 sm:w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading users...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-red-500 mb-3 sm:mb-4">
                  <svg className="mx-auto h-10 sm:h-12 w-10 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-2 text-sm sm:text-base">Failed to load users</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{error}</p>
                <Button onClick={loadUsers} className="text-xs sm:text-sm">
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">No users found</p>
                <Button onClick={() => setDialogOpen(true)} className="text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add First User
                </Button>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-0">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-3 space-y-2 bg-white">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.full_name}</p>
                          <p className="text-xs text-gray-600 truncate">{user.email}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditFormData({
                                full_name: user.full_name,
                                department: user.department || '',
                                email: user.email,
                                contact_number: user.contact_number || '',
                              });
                              setEditDialogOpen(true);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="pt-2 border-t space-y-1">
                        {user.department && (
                          <div className="flex items-center gap-2 text-xs">
                            <Briefcase className="h-3 w-3 text-gray-400" />
                            <span className="truncate">{user.department}</span>
                          </div>
                        )}
                        {user.contact_number && (
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="truncate">{user.contact_number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Department</TableHead>
                        <TableHead className="text-xs sm:text-sm">Email</TableHead>
                        <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                        <TableHead className="text-xs sm:text-sm">Created</TableHead>
                        <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{user.full_name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center">
                              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                              <span className="truncate">{user.department || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-gray-400" />
                              <span className="truncate">{user.contact_number || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditFormData({
                                    full_name: user.full_name,
                                    department: user.department || '',
                                    email: user.email,
                                    contact_number: user.contact_number || '',
                                  });
                                  setEditDialogOpen(true);
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter the details of the new user to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="full_name" className="text-xs sm:text-sm">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-xs sm:text-sm">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="IT, HR, Finance, etc."
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="contact_number" className="text-xs sm:text-sm">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter className="mt-4 sm:mt-6 gap-2 flex-col-reverse sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto text-xs sm:text-sm">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update the details of the user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="full_name" className="text-xs sm:text-sm">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="department" className="text-xs sm:text-sm">Department</Label>
                <Input
                  id="department"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  placeholder="IT, HR, Finance, etc."
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="contact_number" className="text-xs sm:text-sm">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={editFormData.contact_number}
                  onChange={(e) => setEditFormData({ ...editFormData, contact_number: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter className="mt-4 sm:mt-6 gap-2 flex-col-reverse sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto text-xs sm:text-sm">Update User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Delete User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to delete <strong>{selectedUser?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4 space-y-2">
            <p className="text-xs sm:text-sm text-gray-600">
              This action cannot be undone. The user will be permanently removed from the system.
            </p>
            <p className="text-xs sm:text-sm text-orange-600">
              <strong>Note:</strong> Users with active unit assignments cannot be deleted. 
              Please unassign all units first.
            </p>
          </div>
          <DialogFooter className="mt-2 gap-2 flex-col-reverse sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto text-xs sm:text-sm">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto text-xs sm:text-sm">
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
