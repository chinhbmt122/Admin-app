'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Film, Building2, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/api';
import type { Movie, Cinema, Hall } from '@/types';

interface MovieRelease {
  id: string;
  movieId: string;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'UPCOMING' | 'ENDED';
  note: string;
}

interface BatchCreateShowtimesInput {
  movieId: string;
  movieReleaseId: string;
  cinemaId: string;
  hallId: string;
  startDate: string;
  endDate: string;
  timeSlots: string[];
  repeatType: 'DAILY' | 'WEEKLY' | 'CUSTOM_WEEKDAYS';
  weekdays?: number[];
  format: string;
  language: string;
  subtitles: string[];
}

interface BatchShowtimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies: Movie[];
  cinemas: Cinema[];
  halls: Hall[];
  preSelectedMovieId?: string;
  preSelectedReleaseId?: string;
  onSuccess: () => void;
}

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
  '23:00',
];

export default function BatchShowtimeDialog({
  open,
  onOpenChange,
  movies,
  cinemas,
  halls,
  preSelectedMovieId,
  preSelectedReleaseId,
  onSuccess,
}: BatchShowtimeDialogProps) {
  const [releases, setReleases] = useState<MovieRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BatchCreateShowtimesInput>({
    movieId: preSelectedMovieId || '',
    movieReleaseId: preSelectedReleaseId || '',
    cinemaId: '',
    hallId: '',
    startDate: '',
    endDate: '',
    timeSlots: [],
    repeatType: 'DAILY',
    weekdays: [],
    format: '2D',
    language: 'vi',
    subtitles: [],
  });

  const { toast } = useToast();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        movieId: preSelectedMovieId || '',
        movieReleaseId: preSelectedReleaseId || '',
        cinemaId: '',
        hallId: '',
        startDate: '',
        endDate: '',
        timeSlots: [],
        repeatType: 'DAILY',
        weekdays: [],
        format: '2D',
        language: 'vi',
        subtitles: [],
      });

      // If movie is pre-selected, fetch releases
      if (preSelectedMovieId) {
        fetchReleases(preSelectedMovieId);
      }
    }
  }, [open, preSelectedMovieId, preSelectedReleaseId]);

  const fetchReleases = async (movieId: string) => {
    try {
      // TODO: Replace with real API when backend is ready
      const { mockReleases } = await import('@/lib/mockData');
      const filtered = mockReleases.filter(r => 
        r.movieId === movieId && 
        (r.status === 'ACTIVE' || r.status === 'UPCOMING')
      );
      setReleases(filtered);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch movie releases',
        variant: 'destructive',
      });
    }
  };

  const handleMovieChange = (movieId: string) => {
    setFormData({ ...formData, movieId, movieReleaseId: '' });
    fetchReleases(movieId);
  };

  const handleTimeSlotToggle = (time: string) => {
    const updated = formData.timeSlots.includes(time)
      ? formData.timeSlots.filter(t => t !== time)
      : [...formData.timeSlots, time];
    setFormData({ ...formData, timeSlots: updated.sort() });
  };

  const handleWeekdayToggle = (day: number) => {
    const updated = formData.weekdays?.includes(day)
      ? formData.weekdays.filter(d => d !== day)
      : [...(formData.weekdays || []), day];
    setFormData({ ...formData, weekdays: updated.sort() });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.movieId || !formData.movieReleaseId || !formData.cinemaId || 
        !formData.hallId || !formData.startDate || !formData.endDate || 
        formData.timeSlots.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.repeatType === 'CUSTOM_WEEKDAYS' && (!formData.weekdays || formData.weekdays.length === 0)) {
      toast({
        title: 'Error',
        description: 'Please select at least one weekday',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with real API when backend is ready
      await api.post('/showtimes/batch', formData);
      
      toast({
        title: 'Success',
        description: 'Batch showtimes created successfully',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to create batch showtimes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMovie = movies.find(m => m.id === formData.movieId);
  const selectedCinema = cinemas.find(c => c.id === formData.cinemaId);
  const selectedHall = halls.find(h => h.id === formData.hallId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-6 w-6 text-purple-600" />
                Batch Create Showtimes
              </DialogTitle>
              <DialogDescription className="mt-1">
                Create multiple showtimes at once with smart scheduling
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Movie & Release */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="h-5 w-5 text-purple-600" />
                      Movie & Release
                    </CardTitle>
                    <CardDescription>Select the movie and its release period</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="movieId">Movie *</Label>
                      {preSelectedMovieId ? (
                        <Input
                          value={selectedMovie?.title || ''}
                          disabled
                          className="bg-gray-50"
                        />
                      ) : (
                        <Select value={formData.movieId} onValueChange={handleMovieChange}>
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
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="movieReleaseId">Release Period *</Label>
                      {preSelectedReleaseId ? (
                        <Input
                          value={
                            releases.find(r => r.id === preSelectedReleaseId)
                              ? `${releases.find(r => r.id === preSelectedReleaseId)?.startDate} → ${releases.find(r => r.id === preSelectedReleaseId)?.endDate}`
                              : ''
                          }
                          disabled
                          className="bg-gray-50"
                        />
                      ) : (
                        <Select
                          value={formData.movieReleaseId}
                          onValueChange={(value) => setFormData({ ...formData, movieReleaseId: value })}
                          disabled={!formData.movieId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formData.movieId ? "Select release period" : "Select movie first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {releases.map((release) => (
                              <SelectItem key={release.id} value={release.id}>
                                {release.startDate} → {release.endDate} ({release.note})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cinema & Hall */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Cinema & Hall
                    </CardTitle>
                    <CardDescription>Choose where the movies will be shown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cinemaId">Cinema *</Label>
                      <Select
                        value={formData.cinemaId}
                        onValueChange={(value) => setFormData({ ...formData, cinemaId: value, hallId: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cinema" />
                        </SelectTrigger>
                        <SelectContent>
                          {cinemas.map((cinema) => (
                            <SelectItem key={cinema.id} value={cinema.id}>
                              {cinema.name} - {cinema.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hallId">Hall *</Label>
                      <Select
                        value={formData.hallId}
                        onValueChange={(value) => setFormData({ ...formData, hallId: value })}
                        disabled={!formData.cinemaId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.cinemaId ? "Select hall" : "Select cinema first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {halls
                            .filter(hall => hall.cinemaId === formData.cinemaId)
                            .map((hall) => (
                              <SelectItem key={hall.id} value={hall.id}>
                                {hall.name} ({hall.capacity} seats)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Date Range & Repeat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-green-600" />
                      Schedule Period
                    </CardTitle>
                    <CardDescription>Define the date range and repeat pattern</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repeatType">Repeat Pattern *</Label>
                      <Select
                        value={formData.repeatType}
                        onValueChange={(value: 'DAILY' | 'WEEKLY' | 'CUSTOM_WEEKDAYS') => setFormData({ ...formData, repeatType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">🌞 Daily - Every single day</SelectItem>
                          <SelectItem value="WEEKLY">📅 Weekly - Once per week (same weekday)</SelectItem>
                          <SelectItem value="CUSTOM_WEEKDAYS">🎯 Custom - Specific weekdays only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.repeatType === 'CUSTOM_WEEKDAYS' && (
                      <div className="space-y-3">
                        <Label>Select Weekdays *</Label>
                        <div className="flex flex-wrap gap-2">
                          {WEEKDAYS.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant={formData.weekdays?.includes(day.value) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleWeekdayToggle(day.value)}
                              className={formData.weekdays?.includes(day.value) ? 'bg-purple-600' : ''}
                            >
                              {day.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      Time Slots
                    </CardTitle>
                    <CardDescription>Select showtime hours (multiple selection allowed)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={formData.timeSlots.includes(time) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTimeSlotToggle(time)}
                          className={formData.timeSlots.includes(time) ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                    {formData.timeSlots.length > 0 && (
                      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">
                          Selected: {formData.timeSlots.join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Format & Language */}
                <Card>
                  <CardHeader>
                    <CardTitle>Format & Language</CardTitle>
                    <CardDescription>Configure showtime format and audio settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="format">Format *</Label>
                        <Select
                          value={formData.format}
                          onValueChange={(value) => setFormData({ ...formData, format: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2D">2D</SelectItem>
                            <SelectItem value="3D">3D</SelectItem>
                            <SelectItem value="IMAX">IMAX</SelectItem>
                            <SelectItem value="4DX">4DX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language *</Label>
                        <Select
                          value={formData.language}
                          onValueChange={(value) => setFormData({ ...formData, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vi">Vietnamese</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="th">Thai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subtitles</Label>
                      <div className="flex flex-wrap gap-2">
                        {['vi', 'en', 'ko', 'zh', 'ja', 'th'].map((sub) => (
                          <div key={sub} className="flex items-center space-x-2">
                            <Checkbox
                              id={`sub-${sub}`}
                              checked={formData.subtitles.includes(sub)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({ ...formData, subtitles: [...formData.subtitles, sub] });
                                } else {
                                  setFormData({ ...formData, subtitles: formData.subtitles.filter(s => s !== sub) });
                                }
                              }}
                            />
                            <Label htmlFor={`sub-${sub}`} className="cursor-pointer text-sm">
                              {sub.toUpperCase()}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMovie && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Movie</p>
                        <p className="font-semibold text-sm">{selectedMovie.title}</p>
                      </div>
                    )}

                    {selectedCinema && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Cinema</p>
                        <p className="font-semibold text-sm">{selectedCinema.name}</p>
                      </div>
                    )}

                    {selectedHall && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Hall</p>
                        <p className="font-semibold text-sm">{selectedHall.name}</p>
                      </div>
                    )}

                    {formData.startDate && formData.endDate && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Period</p>
                        <p className="font-semibold text-sm">
                          {formData.startDate} → {formData.endDate}
                        </p>
                      </div>
                    )}

                    {formData.timeSlots.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Time Slots</p>
                        <div className="flex flex-wrap gap-1">
                          {formData.timeSlots.map(time => (
                            <Badge key={time} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.repeatType && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Repeat</p>
                        <p className="font-semibold text-sm">
                          {formData.repeatType === 'DAILY' && '🌞 Daily'}
                          {formData.repeatType === 'WEEKLY' && '📅 Weekly'}
                          {formData.repeatType === 'CUSTOM_WEEKDAYS' && '🎯 Custom Weekdays'}
                        </p>
                      </div>
                    )}

                    {formData.format && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Format</p>
                        <Badge>{formData.format}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Create Showtimes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
