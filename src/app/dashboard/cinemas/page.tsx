// src/app/(dashboard)/cinemas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import type { Cinema, CinemaStatus, CreateCinemaRequest } from '@/types';

import { mockCinemas } from '@/lib/mockData'; 


export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCinemaRequest>>({
    name: '',
    address: '',
    city: '',
    district: '',
    phone: '',
    email: '',
    description: '',
    timezone: 'Asia/Ho_Chi_Minh',
    amenities: [],
    images: [],
  });
  const { toast } = useToast();

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      // const response = await api.get('/cinema'); // Note: singular 'cinema' per API contract
      // setCinemas(response.data.data);
      
      // ⭐️ PHẦN THAY THẾ: Dùng dữ liệu giả
      await new Promise(resolve => setTimeout(resolve, 500));
      setCinemas(mockCinemas);
      // ⭐️ KẾT THÚC PHẦN THAY THẾ
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch cinemas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleSubmit = async () => {
    try {
      if (selectedCinema) {
        await api.patch(`/cinema/${selectedCinema.id}`, formData); // singular 'cinema'
        toast({ title: 'Success', description: 'Cinema updated successfully' });
      } else {
        await api.post('/cinema', formData); // singular 'cinema'
        toast({ title: 'Success', description: 'Cinema created successfully' });
      }
      setDialogOpen(false);
      fetchCinemas();
      resetForm();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save cinema',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCinema) return;
    try {
      await api.delete(`/cinema/${selectedCinema.id}`); // singular 'cinema'
      toast({ title: 'Success', description: 'Cinema deleted successfully' });
      setDeleteDialogOpen(false);
      fetchCinemas();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete cinema',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      district: '',
      phone: '',
      email: '',
      description: '',
      timezone: 'Asia/Ho_Chi_Minh',
      amenities: [],
      images: [],
    });
    setSelectedCinema(null);
  };

  const openEditDialog = (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setFormData({
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      district: cinema.district || '',
      phone: cinema.phone || '',
      email: cinema.email || '',
      website: cinema.website || '',
      latitude: cinema.latitude,
      longitude: cinema.longitude,
      description: cinema.description || '',
      amenities: cinema.amenities || [],
      facilities: cinema.facilities,
      images: cinema.images || [],
      virtualTour360Url: cinema.virtualTour360Url || '',
      operatingHours: cinema.operatingHours,
      socialMedia: cinema.socialMedia,
      timezone: cinema.timezone,
    });
    setDialogOpen(true);
  };

  const filteredCinemas = cinemas.filter((cinema) =>
    cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cinema.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: CinemaStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'CLOSED':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cinemas</h1>
          <p className="text-gray-500 mt-1">Manage your cinema locations</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Cinema
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cinemas by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cinemas Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cinemas ({filteredCinemas.length})</CardTitle>
          <CardDescription>
            A list of all cinema locations in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCinemas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No cinemas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCinemas.map((cinema) => (
                  <TableRow key={cinema.id}>
                    <TableCell className="font-medium">{cinema.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{cinema.city}</div>
                        <div className="text-gray-500">{cinema.district}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{cinema.phone}</div>
                        <div className="text-gray-500">{cinema.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {cinema.rating?.toFixed(1) || 'N/A'}
                        <span className="text-gray-400 ml-1 text-xs">
                          ({cinema.totalReviews})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(cinema.status)}>
                        {cinema.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(cinema)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCinema(cinema);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCinema ? 'Edit Cinema' : 'Add New Cinema'}
            </DialogTitle>
            <DialogDescription>
              Fill in the cinema details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cinema Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Cinestar Quốc Thanh"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="271 Nguyễn Trãi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Ho Chi Minh City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  placeholder="District 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0283 933 3333"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="cinema@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter cinema description..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {selectedCinema ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cinema</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCinema?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}