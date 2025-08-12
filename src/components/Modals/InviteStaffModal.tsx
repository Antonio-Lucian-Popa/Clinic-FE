import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { invitationService } from '../../services/invitationService';
import { toast } from 'sonner';
import { useClinic } from '@/contexts/ClinicContex';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

function InviteStaffModal({ isOpen, onClose, onInviteSent }: InviteStaffModalProps) {
  const { currentClinic } = useClinic();
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    doctorId: ''
  });
  const [doctors, setDoctors] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentClinic) {
      loadDoctors();
    }
  }, [isOpen, currentClinic]);

  const loadDoctors = async () => {
    if (!currentClinic) return;
    
    try {
      const doctorsData = await invitationService.getDoctorsForClinic(currentClinic.id);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset doctorId when role changes
    if (name === 'role' && value !== 'ASSISTANT') {
      setFormData(prev => ({
        ...prev,
        doctorId: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClinic) return;

    try {
      setIsLoading(true);
      
      const inviteData = {
        email: formData.email,
        role: formData.role,
        cabinetId: currentClinic.id,
        ...(formData.role === 'ASSISTANT' && formData.doctorId && { doctorId: formData.doctorId })
      };

      await invitationService.sendInvitation(inviteData);
      toast.success('Invitation sent successfully!');
      onInviteSent();
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        role: '',
        doctorId: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'Medical practitioner with full access to patient records and appointments';
      case 'ASSISTANT':
        return 'Medical assistant who will work with a specific doctor';
      case 'RECEPTIONIST':
        return 'Front desk staff managing appointments and patient check-ins';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Invite Staff Member</span>
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join {currentClinic?.name} as a staff member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="colleague@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Select role for the staff member" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOCTOR">
                  <div className="flex flex-col">
                    <span className="font-medium">Doctor</span>
                    <span className="text-xs text-gray-500">Medical practitioner</span>
                  </div>
                </SelectItem>
                <SelectItem value="ASSISTANT">
                  <div className="flex flex-col">
                    <span className="font-medium">Medical Assistant</span>
                    <span className="text-xs text-gray-500">Works with a specific doctor</span>
                  </div>
                </SelectItem>
                <SelectItem value="RECEPTIONIST">
                  <div className="flex flex-col">
                    <span className="font-medium">Receptionist</span>
                    <span className="text-xs text-gray-500">Front desk staff</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Doctor selection for assistants */}
          {formData.role === 'ASSISTANT' && (
            <div className="space-y-2">
              <Label htmlFor="doctorId">Assign to Doctor</Label>
              <Select value={formData.doctorId} onValueChange={(value) => handleSelectChange('doctorId', value)}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Select the doctor this assistant will work with" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Role description */}
          {formData.role && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{formData.role}:</strong> {getRoleDescription(formData.role)}
              </p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              What happens next?
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• An invitation email will be sent to the provided address</li>
              <li>• The recipient can create their account using the invitation link</li>
              <li>• They will automatically be added to your clinic with the selected role</li>
              <li>• You can track the invitation status in this dashboard</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading || !formData.email || !formData.role || (formData.role === 'ASSISTANT' && !formData.doctorId)}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteStaffModal;