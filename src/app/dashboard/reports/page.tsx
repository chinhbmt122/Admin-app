// src/app/(dashboard)/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar as CalendarIcon, TrendingUp, DollarSign, Users, Film, Star, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { mockCinemas, mockMovies } from '@/lib/mockData';

// Mock data for reports
const mockMonthlyRevenue = [
  { month: 'Jun', revenue: 2850, tickets: 38200, occupancy: 68 },
  { month: 'Jul', revenue: 3120, tickets: 42100, occupancy: 72 },
  { month: 'Aug', revenue: 2980, tickets: 39800, occupancy: 70 },
  { month: 'Sep', revenue: 3350, tickets: 44600, occupancy: 75 },
  { month: 'Oct', revenue: 3680, tickets: 48900, occupancy: 78 },
  { month: 'Nov', revenue: 3850, tickets: 51200, occupancy: 80 },
];

const mockRevenueBreakdown = [
  { name: 'Ticket Sales', value: 2800, percentage: 73, color: '#8b5cf6' },
  { name: 'Concessions', value: 850, percentage: 22, color: '#ec4899' },
  { name: 'Others', value: 150, percentage: 5, color: '#f59e0b' },
];

const mockTopMovies = [
  { 
    title: 'Mission: Impossible - Dead Reckoning', 
    revenue: 485, 
    tickets: 13800, 
    rating: 4.8,
    occupancy: 85,
    showtimes: 124
  },
  { 
    title: 'Oppenheimer', 
    revenue: 420, 
    tickets: 11200, 
    rating: 4.9,
    occupancy: 82,
    showtimes: 108
  },
  { 
    title: 'Barbie', 
    revenue: 398, 
    tickets: 10800, 
    rating: 4.7,
    occupancy: 80,
    showtimes: 98
  },
  { 
    title: 'Dune: Part Two', 
    revenue: 365, 
    tickets: 9500, 
    rating: 4.6,
    occupancy: 76,
    showtimes: 86
  },
  { 
    title: 'The Marvels', 
    revenue: 298, 
    tickets: 8200, 
    rating: 4.5,
    occupancy: 72,
    showtimes: 78
  },
  { 
    title: 'Wonka', 
    revenue: 285, 
    tickets: 7900, 
    rating: 4.6,
    occupancy: 74,
    showtimes: 72
  },
];

const mockTopCinemas = [
  { name: 'CGV Landmark 81', revenue: 720, occupancy: 82, screens: 10, tickets: 18500 },
  { name: 'Lotte Cinema Cầu Giấy', revenue: 680, occupancy: 78, screens: 8, tickets: 17200 },
  { name: 'Galaxy Cinema Đà Nẵng', revenue: 620, occupancy: 76, screens: 7, tickets: 15800 },
  { name: 'BHD Star Bitexco', revenue: 580, occupancy: 74, screens: 6, tickets: 14200 },
  { name: 'CGV Long Biên', revenue: 520, occupancy: 71, screens: 6, tickets: 13100 },
  { name: 'Galaxy Tân Bình', revenue: 480, occupancy: 68, screens: 5, tickets: 11800 },
];

const mockCustomerAgeDistribution = [
  { range: '18-24', percentage: 35, count: 15980 },
  { range: '25-34', percentage: 40, count: 18240 },
  { range: '35-44', percentage: 18, count: 8210 },
  { range: '45+', percentage: 7, count: 3190 },
];

const mockPeakHours = [
  { time: '10:00-12:00', percentage: 8, bookings: 3650 },
  { time: '12:00-14:00', percentage: 12, bookings: 5470 },
  { time: '14:00-16:00', percentage: 15, bookings: 6840 },
  { time: '16:00-18:00', percentage: 18, bookings: 8210 },
  { time: '18:00-20:00', percentage: 28, bookings: 12770 },
  { time: '20:00-22:00', percentage: 19, bookings: 8670 },
];

const mockGenrePerformance = [
  { name: 'Action', revenue: 1250, share: 28 },
  { name: 'Sci-Fi', revenue: 980, share: 22 },
  { name: 'Comedy', revenue: 750, share: 17 },
  { name: 'Drama', revenue: 620, share: 14 },
  { name: 'Horror', revenue: 480, share: 11 },
  { name: 'Others', revenue: 370, share: 8 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState('revenue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString()}M`;
  };

  const exportReport = () => {
    // Simulate export
    const data = {
      reportType,
      date: dateRange ? format(dateRange, 'yyyy-MM-dd') : 'N/A',
      summary: {
        totalRevenue: '3.8B VNĐ',
        ticketsSold: 45678,
        avgOccupancy: 72.5,
        activeMovies: 28,
      },
      generatedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">View detailed business insights and performance metrics</p>
        </div>
        <Button 
          onClick={exportReport}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-64 border-purple-200 focus:ring-purple-500">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">📊 Revenue Report</SelectItem>
                <SelectItem value="occupancy">🎭 Occupancy Report</SelectItem>
                <SelectItem value="customer">👥 Customer Behavior</SelectItem>
                <SelectItem value="movie">🎬 Movie Performance</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-64 border-purple-200 hover:border-purple-400">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange ? format(dateRange, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
            <Badge variant="outline" className="h-10 px-4 flex items-center gap-2 border-green-200 text-green-700 bg-green-50">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live Data
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₫3.8B
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600 font-semibold">+18% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tickets Sold
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              45,678
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-600 font-semibold">+12% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Occupancy
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              72.5%
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-600 font-semibold">+5.2% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Movies
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Film className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {mockMovies.filter(m => m.status === 'now_showing').length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold text-purple-600">{mockMovies.filter(m => m.status === 'upcoming').length}</span> new releases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-purple-50 to-pink-50 p-1">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            💰 Revenue
          </TabsTrigger>
          <TabsTrigger value="movies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            🎬 Top Movies
          </TabsTrigger>
          <TabsTrigger value="cinemas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            🏢 Cinemas
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            👥 Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Trend Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Revenue Trend Analysis
              </CardTitle>
              <CardDescription>Monthly revenue performance over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={mockMonthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}M`} />
                  <Tooltip 
                    formatter={(value: number) => [`₫${value}M`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Distribution by revenue source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockRevenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockRevenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₫${value}M`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRevenueBreakdown.map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₫{item.value}M</p>
                          <p className="text-xs text-gray-500">{item.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Genre Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Genre Performance</CardTitle>
              <CardDescription>Revenue distribution by movie genre</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockGenrePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}M`} />
                  <Tooltip 
                    formatter={(value: number) => [`₫${value}M`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {mockGenrePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movies" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-purple-600" />
                Top Performing Movies
              </CardTitle>
              <CardDescription>Based on ticket sales, revenue and occupancy rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopMovies.map((movie, index) => (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all p-6 bg-gradient-to-r from-white to-purple-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`
                          text-3xl font-bold flex items-center justify-center w-12 h-12 rounded-xl
                          ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : ''}
                          ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' : ''}
                          ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : ''}
                          ${index > 2 ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700' : ''}
                        `}>
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900 mb-1">{movie.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {movie.tickets.toLocaleString()} tickets
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {movie.showtimes} showtimes
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₫{movie.revenue}M
                        </p>
                        <Badge className={`mt-2 ${
                          movie.occupancy >= 80 ? 'bg-green-100 text-green-700' :
                          movie.occupancy >= 70 ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {movie.occupancy}% occupancy
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Movie Comparison Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Revenue Comparison</CardTitle>
              <CardDescription>Top 6 movies revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mockTopMovies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" tickFormatter={(value) => `₫${value}M`} />
                  <YAxis dataKey="title" type="category" stroke="#6b7280" width={150} />
                  <Tooltip 
                    formatter={(value: number) => [`₫${value}M`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                    {mockTopMovies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cinemas" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Cinema Performance
              </CardTitle>
              <CardDescription>Revenue and occupancy by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopCinemas.map((cinema, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-lg transition-all bg-white"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                        <span className="text-xs text-purple-600 font-semibold">TOP</span>
                        <span className="text-2xl font-bold text-purple-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-900">{cinema.name}</p>
                        <p className="text-sm text-gray-600">{cinema.screens} screens · {cinema.tickets.toLocaleString()} tickets sold</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Revenue</p>
                        <p className="text-xl font-bold text-purple-600">₫{cinema.revenue}M</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Occupancy</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                              style={{ width: `${cinema.occupancy}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-green-600">{cinema.occupancy}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cinema Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
                <CardDescription>Top 6 cinemas by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockTopCinemas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`₫${value}M`, 'Revenue']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                      {mockTopCinemas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Occupancy Rate</CardTitle>
                <CardDescription>Average occupancy by cinema</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTopCinemas}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Occupancy']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Customer Insights
              </CardTitle>
              <CardDescription>User behavior and demographics analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Distribution */}
                <div className="p-6 border border-gray-100 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    👥 Age Distribution
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">Customer segmentation by age groups</p>
                  <div className="space-y-4">
                    {mockCustomerAgeDistribution.map((age, index) => (
                      <div key={age.range}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">{age.range} years old</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-purple-600">{age.percentage}%</span>
                            <span className="text-xs text-gray-500 ml-2">({age.count.toLocaleString()})</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${age.percentage}%`,
                              background: `linear-gradient(to right, ${COLORS[index]}, ${COLORS[index + 1] || COLORS[0]})`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Peak Hours */}
                <div className="p-6 border border-gray-100 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    ⏰ Peak Hours
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">Most popular booking times</p>
                  <div className="space-y-4">
                    {mockPeakHours.map((hour) => (
                      <div key={hour.time}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">{hour.time}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">{hour.percentage}%</span>
                            <span className="text-xs text-gray-500 ml-2">({hour.bookings.toLocaleString()})</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-500"
                            style={{ width: `${hour.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Behavior Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Age Distribution Chart</CardTitle>
                <CardDescription>Visual breakdown by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockCustomerAgeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${(entry as typeof mockCustomerAgeDistribution[0]).range}: ${(entry as typeof mockCustomerAgeDistribution[0]).percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {mockCustomerAgeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} customers`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Booking Time Distribution</CardTitle>
                <CardDescription>Hourly booking patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockPeakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} bookings`, 'Bookings']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar dataKey="bookings" radius={[8, 8, 0, 0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle>💡 Key Insights</CardTitle>
              <CardDescription>Data-driven recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-purple-100">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Target Audience</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-purple-600">25-34 age group</span> represents the largest segment (40%). 
                    Focus marketing campaigns on this demographic.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <div className="text-2xl mb-2">⏰</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Prime Time</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-blue-600">6-8 PM slot</span> accounts for 28% of bookings. 
                    Optimize showtimes and staff allocation during this window.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-100">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Growth Opportunity</h4>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-green-600">Weekend matinees</span> show potential. 
                    Consider family-friendly promotions for 10 AM - 2 PM slots.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}