import React, { useState } from 'react';
import { User, UserCheck, Save, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function ProfileEditPage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.roles?.includes('USER') ? '' : user?.roles?.[0] || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast.error('Please select your role to continue');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({
        ...formData,
        roles: [formData.role]
      });
      toast.success('Profile updated successfully!');
      // Redirect to appropriate page based on role
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const isUserRole = user?.roles?.includes('USER');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isUserRole 
              ? 'Please select your role to access the medical platform'
              : 'Update your profile information'
            }
          </p>
        </div>

        {/* Profile Edit Card */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alert for Google users */}
              {isUserRole && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Welcome! Since you signed up with Google, please select your role in the medical practice to continue.
                  </AlertDescription>
                </Alert>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Email field (readonly for Google users) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  readOnly
                  className="bg-gray-50 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed for Google accounts
                </p>
              </div>

              {/* Role selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Your Role *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                  disabled={!isUserRole && user?.roles && user.roles.length > 0 && !user.roles.includes('USER')}
                >
                  <SelectTrigger className={`w-full ${!formData.role && isUserRole ? 'border-red-300' : ''}`}>
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Select your role in the medical practice" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">
                      <div className="flex flex-col">
                        <span className="font-medium">Doctor</span>
                        <span className="text-xs text-gray-500">Medical practitioner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="NURSE">
                      <div className="flex flex-col">
                        <span className="font-medium">Nurse</span>
                        <span className="text-xs text-gray-500">Nursing professional</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex flex-col">
                        <span className="font-medium">Administrator</span>
                        <span className="text-xs text-gray-500">Practice administrator</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="RECEPTIONIST">
                      <div className="flex flex-col">
                        <span className="font-medium">Receptionist</span>
                        <span className="text-xs text-gray-500">Front desk staff</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OWNER">
                      <div className="flex flex-col">
                        <span className="font-medium">Practice Owner</span>
                        <span className="text-xs text-gray-500">Clinic owner/manager</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!formData.role && isUserRole && (
                  <p className="text-xs text-red-500">Please select your role to continue</p>
                )}
              </div>

              {/* Role description */}
              {formData.role && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.role === 'DOCTOR' && 'As a Doctor, you will have access to patient records, appointments, and medical history.'}
                    {formData.role === 'NURSE' && 'As a Nurse, you will assist with patient care and have access to relevant medical information.'}
                    {formData.role === 'ADMIN' && 'As an Administrator, you will manage practice operations and user permissions.'}
                    {formData.role === 'RECEPTIONIST' && 'As a Receptionist, you will manage appointments and patient check-ins.'}
                    {formData.role === 'OWNER' && 'As a Practice Owner, you will have full access to manage your clinic and staff.'}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={isLoading || (!formData.role && isUserRole)}
              >
                {isLoading ? (
                  'Updating Profile...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isUserRole ? 'Complete Setup' : 'Update Profile'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Skip option for non-USER roles */}
              {!isUserRole && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Skip for now
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileEditPage;