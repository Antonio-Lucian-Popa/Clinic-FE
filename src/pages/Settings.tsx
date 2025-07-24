import React, { useState } from 'react';
import { 
  Bell, 
  Shield, 
  Palette, 
  Monitor, 
  Moon, 
  Sun,
  Globe,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Save
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    smsReminders: false,
    pushNotifications: true,
    weeklyReports: true,
    systemAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Europe/Bucharest',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to your backend
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-left text-left text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your application preferences and account settings
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-blue-600" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme</Label>
              <RadioGroup value={theme} onValueChange={setTheme}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Language</Label>
              <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>English</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ro">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Română</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Separator />
            <div className="pt-2">
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This action cannot be undone
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;