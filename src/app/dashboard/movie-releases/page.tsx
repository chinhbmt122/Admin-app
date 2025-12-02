'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Calendar as CalendarIcon, Pencil, Trash2, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import type { Movie } from '@/types';
import { format } from 'date-fns';
import { mockMovies } from '@/lib/mockData';

interface MovieRelease {
  id: string;
  movieId: string;
  startDate: string;
  endDate: string;
  note: string;
}

interface CreateMovieReleaseDto {
  movieId: string;
  startDate: string;
  endDate: string;
  note: string;
}

const mockReleases: MovieRelease[] = [
  {
    id: 'mr_001',
    movieId: 'm_001',
    startDate: '2025-01-15',
    endDate: '2025-03-15',
    note: 'Phát hành dịp Tết Nguyên Đán 2025',
  },
  {
    id: 'mr_002',
    movieId: 'm_002',
    startDate: '2025-02-01',
    endDate: '2025-04-01',
    note: 'Phát hành đầu năm',
  },
];

export default function MovieReleasesPage() {
  const [releases, setReleases] = useState<MovieRelease[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<MovieRelease | null>(null);
  const [formData, setFormData] = useState<CreateMovieReleaseDto>({
    movieId: '',
    startDate: '',
    endDate: '',
    note: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // const [releasesRes, moviesRes] = await Promise.all([
      //   api.get('/movie-releases'),
      //   api.get('/movies'),
      // ]);
      // setReleases(releasesRes.data);
      // setMovies(moviesRes.data);

      // Mock data with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setReleases(mockReleases);
      setMovies(mockMovies);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch movie releases',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.movieId || !formData.startDate || !formData.endDate || !formData.note) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingRelease) {
        // Update existing release
        await api.put(`/movie-releases/${editingRelease.id}`, formData);
        toast({ title: 'Success', description: 'Release updated successfully' });
      } else {
        // Create new release
        await api.post('/movie-releases', formData);
        toast({ title: 'Success', description: 'Release created successfully' });
      }
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch {
      toast({
        title: 'Error',
        description: editingRelease ? 'Failed to update release' : 'Failed to create release',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (release: MovieRelease) => {
    setEditingRelease(release);
    setFormData({
      movieId: release.movieId,
      startDate: release.startDate,
      endDate: release.endDate,
      note: release.note,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release?')) {
      return;
    }

    try {
      await api.delete(`/movie-releases/${id}`);
      toast({ title: 'Success', description: 'Release deleted successfully' });
      fetchData();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete release',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingRelease(null);
    setFormData({
      movieId: '',
      startDate: '',
      endDate: '',
      note: '',
    });
  };

  const getMovieById = (movieId: string) => {
    return movies.find(m => m.id === movieId);
  };

  const getReleaseStatus = (release: MovieRelease) => {
    const now = new Date();
    const start = new Date(release.startDate);
    const end = new Date(release.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ended':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movie Releases</h1>
          <p className="text-gray-500 mt-1">Manage movie release schedules</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Release
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Releases</CardTitle>
            <CardDescription>
              {releases.length} release schedule{releases.length !== 1 ? 's' : ''} in total
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading releases...</p>
          </div>
        ) : releases.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No movie releases found. Add your first release schedule.</p>
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Release
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {releases.map((release) => {
              const movie = getMovieById(release.movieId);
              const status = getReleaseStatus(release);
              
              return (
                <Card 
                  key={release.id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white"
                >
                  {/* Movie Poster Header */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
                    {movie?.posterUrl ? (
                      <Image 
                        src={movie.posterUrl} 
                        alt={movie.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-24 w-24 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge 
                        className={`${getStatusColor(status)} border-0 shadow-lg backdrop-blur-sm font-semibold px-3 py-1`}
                      >
                        {status === 'active' ? '🎬 Now Showing' : status === 'upcoming' ? '🎭 Coming Soon' : '📼 Ended'}
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        onClick={() => handleEdit(release)}
                        className="h-9 w-9 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 shadow-lg"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(release.id)}
                        className="h-9 w-9 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 shadow-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Movie Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-xl text-white drop-shadow-lg line-clamp-2 mb-1">
                        {movie?.title || 'Unknown Movie'}
                      </h3>
                      <div className="flex items-center gap-3 text-white/90 text-sm">
                        <span className="flex items-center gap-1">
                          ⏱️ {movie?.runtime} mins
                        </span>
                        <span className="flex items-center gap-1">
                          🎫 {movie?.ageRating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-5">
                    {/* Release Period */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                        <CalendarIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">RELEASE PERIOD</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(release.startDate), 'MMM dd, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 my-1">
                          <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-pink-200" />
                          <span className="text-xs text-gray-400">to</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-pink-200 to-purple-200" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {format(new Date(release.endDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Release Note */}
                    <div className="relative">
                      <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                      <div className="pl-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">📝 DESCRIPTION</p>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                          {release.note}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Release Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRelease ? 'Edit Release' : 'Add New Release'}</DialogTitle>
            <DialogDescription>
              {editingRelease ? 'Update release schedule details' : 'Create a new movie release schedule'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="movieId">Movie *</Label>
              <Select
                value={formData.movieId}
                onValueChange={(value) =>
                  setFormData({ ...formData, movieId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select movie" />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title} ({movie.runtime} mins)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note *</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="e.g., Phát hành dịp Tết Nguyên Đán 2025"
                rows={3}
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
              {editingRelease ? 'Update Release' : 'Create Release'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
