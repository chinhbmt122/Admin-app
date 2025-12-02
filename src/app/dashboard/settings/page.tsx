// src/app/(dashboard)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Lock, User, Globe, CreditCard, Palette, Shield, Download, Trash2, Check, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('settings_profile');
    const savedNotifications = localStorage.getItem('settings_notifications');
    const savedSystem = localStorage.getItem('settings_system');
    const savedTheme = localStorage.getItem('settings_theme');
    const savedSecurity = localStorage.getItem('settings_security');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedSystem) setSystem(JSON.parse(savedSystem));
    if (savedTheme) setTheme(JSON.parse(savedTheme));
    if (savedSecurity) setSecurity(JSON.parse(savedSecurity));
  }, []);

  // Profile Settings
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@cinestar.vn',
    phone: '+84 123 456 789',
    role: 'Super Admin',
    avatar: '',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newBooking: true,
    dailyReport: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // System Settings
  const [system, setSystem] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    currency: 'VND',
  });

  // Theme Settings
  const [theme, setTheme] = useState({
    mode: 'dark',
    accentColor: 'purple',
  });

  // Validation functions
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\d\s\+\-\(\)]+$/.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[!@#$%^&*]/.test(password);
  };

  // Save to localStorage helper
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Export all settings
  const exportSettings = () => {
    const allSettings = {
      profile,
      notifications,
      security: { ...security, currentPassword: '', newPassword: '', confirmPassword: '' }, // Don't export passwords
      system,
      theme,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: '✅ Settings Exported',
      description: 'Your settings have been exported successfully',
    });
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!profile.name.trim()) {
      toast({
        title: '❌ Validation Error',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(profile.email)) {
      toast({
        title: '❌ Validation Error',
        description: 'Invalid email format',
        variant: 'destructive',
      });
      return;
    }

    if (!validatePhone(profile.phone)) {
      toast({
        title: '❌ Validation Error',
        description: 'Invalid phone number format',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      saveToLocalStorage('settings_profile', profile);
      setTimeout(() => {
        toast({
          title: '✅ Success',
          description: 'Profile settings saved successfully',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save profile settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      saveToLocalStorage('settings_notifications', notifications);
      setTimeout(() => {
        toast({
          title: '✅ Success',
          description: 'Notification preferences saved successfully',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    // Validation
    if (security.newPassword) {
      if (!security.currentPassword) {
        toast({
          title: '❌ Validation Error',
          description: 'Current password is required',
          variant: 'destructive',
        });
        return;
      }

      if (!validatePassword(security.newPassword)) {
        toast({
          title: '❌ Validation Error',
          description: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
          variant: 'destructive',
        });
        return;
      }

      if (security.newPassword !== security.confirmPassword) {
        toast({
          title: '❌ Validation Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      saveToLocalStorage('settings_security', security);
      setTimeout(() => {
        toast({
          title: '✅ Success',
          description: 'Security settings updated successfully',
        });
        setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update security settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      saveToLocalStorage('settings_system', system);
      setTimeout(() => {
        toast({
          title: '✅ Success',
          description: 'System preferences saved successfully',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to save system settings',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      saveToLocalStorage('settings_theme', theme);
      setTimeout(() => {
        toast({
          title: '✅ Success',
          description: 'Theme applied successfully',
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to apply theme',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleResetNotifications = () => {
    const defaultNotifications = {
      emailNotifications: true,
      smsNotifications: false,
      newBooking: true,
      dailyReport: true,
      systemAlerts: true,
      marketingEmails: false,
    };
    setNotifications(defaultNotifications);
    toast({
      title: '🔄 Reset Complete',
      description: 'Notification settings reset to defaults',
    });
  };

  const handleResetSystem = () => {
    const defaultSystem = {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      currency: 'VND',
    };
    setSystem(defaultSystem);
    toast({
      title: '🔄 Reset Complete',
      description: 'System settings reset to defaults',
    });
  };

  const handleResetTheme = () => {
    const defaultTheme = {
      mode: 'dark',
      accentColor: 'purple',
    };
    setTheme(defaultTheme);
    toast({
      title: '🔄 Reset Complete',
      description: 'Theme reset to default',
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: '❌ File Too Large',
          description: 'Avatar must be less than 2MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
        toast({
          title: '✅ Avatar Updated',
          description: 'Click Save to keep changes',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRevokeSession = (sessionIndex: number) => {
    toast({
      title: '✅ Session Revoked',
      description: 'The session has been terminated',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
        </div>
        <Button onClick={exportSettings} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Settings
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-purple-50 to-pink-50 p-1">
          <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Globe className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your account profile information and email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-lg" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" className="border-purple-200 hover:border-purple-400" asChild>
                      <span>Change Avatar</span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    📧 Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    📱 Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    Role
                  </Label>
                  <div className="relative">
                    <Input id="role" value={profile.role} disabled className="bg-gray-50" />
                    <Badge className="absolute right-2 top-2.5 bg-purple-100 text-purple-700">
                      Admin
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Check className="h-5 w-5" />
                  <h4 className="font-semibold">Smart Notifications Enabled</h4>
                </div>
                <p className="text-sm text-gray-600">
                  We'll intelligently group similar notifications to reduce noise while keeping you informed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📢 Notification Channels
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-2xl">📧</span>
                      </div>
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, smsNotifications: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔔 Notification Types
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'newBooking', icon: '🎫', label: 'New Bookings', desc: 'Get notified when a new booking is made', checked: notifications.newBooking },
                    { key: 'dailyReport', icon: '📊', label: 'Daily Reports', desc: 'Receive daily performance reports', checked: notifications.dailyReport },
                    { key: 'systemAlerts', icon: '⚠️', label: 'System Alerts', desc: 'Important system notifications', checked: notifications.systemAlerts },
                    { key: 'marketingEmails', icon: '📬', label: 'Marketing Emails', desc: 'Promotional content and updates', checked: notifications.marketingEmails },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={item.checked}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, [item.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleResetNotifications}>
                  Reset to Default
                </Button>
                <Button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔐 Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="border-purple-200 focus:border-purple-400" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="border-purple-200 focus:border-purple-400" 
                    />
                    <p className="text-xs text-gray-500">Must be at least 8 characters with uppercase, lowercase, number and special character</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      className="border-purple-200 focus:border-purple-400" 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🛡️ Two-Factor Authentication
                </h3>
                <div className="p-6 border-2 border-dashed border-purple-200 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg mb-1">Enable 2FA</p>
                        <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account using authenticator apps</p>
                        <Badge className="bg-yellow-100 text-yellow-800">Recommended</Badge>
                      </div>
                    </div>
                    <Switch 
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💻 Active Sessions
                </h3>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome on Windows 11', location: 'Ho Chi Minh City, Vietnam', time: 'Current session', ip: '192.168.1.10', current: true },
                    { device: 'Safari on iPhone 15 Pro', location: 'Ho Chi Minh City, Vietnam', time: '2 hours ago', ip: '192.168.1.25', current: false },
                    { device: 'Edge on Windows 11', location: 'Da Nang, Vietnam', time: '1 day ago', ip: '103.56.158.42', current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <span className="text-2xl">💻</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && (
                              <Badge className="bg-green-100 text-green-700">Active Now</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{session.location} • {session.time}</p>
                          <p className="text-xs text-gray-500">IP: {session.ip}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleRevokeSession(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: security.twoFactorEnabled })}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSecurity}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Language */}
                <div className="p-5 border-2 border-purple-100 rounded-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:border-purple-200 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-xl">🌐</span>
                    </div>
                    <Label htmlFor="language" className="text-base font-semibold">Language</Label>
                  </div>
                  <Select value={system.language} onValueChange={(value) => setSystem({ ...system, language: value })}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="p-5 border-2 border-blue-100 rounded-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-xl">⏰</span>
                    </div>
                    <Label htmlFor="timezone" className="text-base font-semibold">Timezone</Label>
                  </div>
                  <Select value={system.timezone} onValueChange={(value) => setSystem({ ...system, timezone: value })}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">🇻🇳 Ho Chi Minh (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Bangkok">🇹🇭 Bangkok (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Singapore">🇸🇬 Singapore (GMT+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format */}
                <div className="p-5 border-2 border-green-100 rounded-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:border-green-200 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-xl">📅</span>
                    </div>
                    <Label htmlFor="date-format" className="text-base font-semibold">Date Format</Label>
                  </div>
                  <Select value={system.dateFormat} onValueChange={(value) => setSystem({ ...system, dateFormat: value })}>
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (02/12/2025)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/02/2025)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2025-12-02)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency */}
                <div className="p-5 border-2 border-yellow-100 rounded-xl bg-gradient-to-br from-yellow-50/50 to-orange-50/50 hover:border-yellow-200 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-xl">💰</span>
                    </div>
                    <Label htmlFor="currency" className="text-base font-semibold">Currency</Label>
                  </div>
                  <Select value={system.currency} onValueChange={(value) => setSystem({ ...system, currency: value })}>
                    <SelectTrigger className="border-yellow-200 focus:border-yellow-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">₫ VND (Vietnamese Dong)</SelectItem>
                      <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="p-6 border-2 border-dashed border-purple-200 rounded-xl bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Advanced Options
                </h3>
                <p className="text-sm text-gray-600 mb-5">Configure advanced system behaviors</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:bg-purple-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="text-lg">💾</span>
                      </div>
                      <div>
                        <p className="font-medium">Automatic Backups</p>
                        <p className="text-sm text-gray-500">Automatically backup data daily</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl hover:bg-red-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <span className="text-lg">🐛</span>
                      </div>
                      <div>
                        <p className="font-medium">Debug Mode</p>
                        <p className="text-sm text-gray-500">Enable detailed error logging</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-orange-100 rounded-xl hover:bg-orange-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <span className="text-lg">⚡</span>
                      </div>
                      <div>
                        <p className="font-medium">API Rate Limiting</p>
                        <p className="text-sm text-gray-500">Limit API requests per minute</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-gray-300" onClick={handleResetSystem}>
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={handleSaveSystem}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative overflow-hidden p-8 border-2 border-purple-200 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Badge className="bg-yellow-400 text-yellow-900 mb-3">⭐ Premium Plan</Badge>
                      <h3 className="text-3xl font-bold mb-1">Enterprise</h3>
                      <p className="text-purple-100">Unlimited cinemas & features</p>
                    </div>
                    <Badge className="bg-white/20 text-white backdrop-blur-sm border border-white/30 text-lg px-4 py-2">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$299</span>
                    <span className="text-2xl text-purple-200">/month</span>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5" />
                    <span>Renews on February 1, 2026</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💳 Payment Methods
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-5 border-2 border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                        VISA
                      </div>
                      <div>
                        <p className="font-semibold text-lg">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Default</Badge>
                  </div>
                  
                  <button className="w-full p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/30 transition-all group">
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Add Payment Method</span>
                    </div>
                  </button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📄 Billing History
                </h3>
                <div className="space-y-2">
                  {[
                    { date: 'Jan 1, 2025', amount: '$299.00', status: 'Paid', invoice: 'INV-2025-001' },
                    { date: 'Dec 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-012' },
                    { date: 'Nov 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-011' },
                    { date: 'Oct 1, 2024', amount: '$299.00', status: 'Paid', invoice: 'INV-2024-010' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <span className="text-xl">📄</span>
                        </div>
                        <div>
                          <p className="font-semibold">{invoice.date}</p>
                          <p className="text-sm text-gray-500">{invoice.invoice}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">{invoice.amount}</p>
                          <Badge className="bg-green-100 text-green-700">{invoice.status}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                  Cancel Subscription
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🎨 Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { mode: 'light', icon: '☀️', label: 'Light', desc: 'Bright & clean' },
                    { mode: 'dark', icon: '🌙', label: 'Dark', desc: 'Easy on eyes' },
                    { mode: 'auto', icon: '🔄', label: 'Auto', desc: 'System default' }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      className={`group relative overflow-hidden p-6 border-2 rounded-xl text-center transition-all ${
                        theme.mode === item.mode 
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                      onClick={() => setTheme({ ...theme, mode: item.mode })}
                    >
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <p className="font-semibold text-lg capitalize mb-1">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                      {theme.mode === item.mode && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🎨 Accent Color
                </h3>
                <p className="text-sm text-gray-600 mb-4">Choose your primary accent color for buttons, links, and highlights</p>
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { name: 'purple', color: 'bg-purple-600', label: 'Purple', ring: 'ring-purple-600' },
                    { name: 'blue', color: 'bg-blue-600', label: 'Blue', ring: 'ring-blue-600' },
                    { name: 'green', color: 'bg-green-600', label: 'Green', ring: 'ring-green-600' },
                    { name: 'red', color: 'bg-red-600', label: 'Red', ring: 'ring-red-600' },
                    { name: 'orange', color: 'bg-orange-600', label: 'Orange', ring: 'ring-orange-600' },
                    { name: 'pink', color: 'bg-pink-600', label: 'Pink', ring: 'ring-pink-600' },
                  ].map((color) => (
                    <button
                      key={color.name}
                      className="group relative"
                      onClick={() => setTheme({ ...theme, accentColor: color.name })}
                    >
                      <div className={`h-16 rounded-xl ${color.color} shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                        theme.accentColor === color.name ? `ring-4 ring-offset-2 ${color.ring}` : ''
                      }`}>
                        {theme.accentColor === color.name && (
                          <div className="flex items-center justify-center h-full">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-2 font-medium capitalize">{color.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="p-6 border-2 border-dashed border-purple-200 rounded-xl bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  👁️ Preview
                </h3>
                <p className="text-sm text-gray-600 mb-5">See how your settings look in action</p>
                
                <div className="space-y-4">
                  <div className="p-6 bg-white rounded-xl border shadow-sm">
                    <h4 className="text-xl font-bold mb-2">Dashboard Preview</h4>
                    <p className="text-gray-600 mb-4">Your content will look like this with the selected theme</p>
                    <div className="flex gap-3">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Primary Button</Button>
                      <Button variant="outline">Secondary Button</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>💡</span>
                    <span>Changes are saved automatically and applied instantly</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-gray-300" onClick={handleResetTheme}>
                  Reset to Default
                </Button>
                <Button 
                  onClick={handleSaveTheme}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Applying...' : 'Apply Theme'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}