import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { clinicApiService, type Doctor } from '@/services/clinicApiService';
import { useClinic } from '@/contexts/ClinicContex';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  selectedPatient?: any; // ideal: tipați corect dacă aveți tipul Patient
}

function AppointmentModal({ isOpen, onClose, selectedDate, selectedPatient }: AppointmentModalProps) {
  const { currentClinic } = useClinic();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [formData, setFormData] = useState({
    patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
    patientEmail: selectedPatient?.email || '',
    date: selectedDate || '',
    time: '',
    duration: '30',
    type: '',
    notes: '',
    doctorId: '',
  });

  // Prefill când se schimbă pacientul sau selectedDate
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '',
      patientEmail: selectedPatient?.email || '',
      date: selectedDate || prev.date,
    }));
  }, [selectedPatient, selectedDate]);

  // Încarcă doctorii pentru clinica curentă când se deschide modalul sau se schimbă clinica
  useEffect(() => {
    const loadDoctors = async () => {
      if (!isOpen || !currentClinic?.id) return;
      try {
        setLoadingDoctors(true);
        const list = await clinicApiService.getDoctorsByClinic(currentClinic.id);
        setDoctors(list);
        // dacă ai exact un doctor, selectează-l by default
        if (list.length === 1) {
          setFormData(prev => ({ ...prev, doctorId: list[0].id }));
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
        toast.error('Nu am putut încărca lista de doctori');
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [isOpen, currentClinic?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  };

  // Poți compune startTime/endTime la trimitere
  const startISO = useMemo(() => {
    if (!formData.date || !formData.time) return null;
    // format: 2025-08-07T14:30:00
    return `${formData.date}T${formData.time}:00`;
  }, [formData.date, formData.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.doctorId) {
      toast.error('Selectează un doctor');
      return;
    }
    if (!startISO) {
      toast.error('Completează data și ora');
      return;
    }

    try {
      // Creează payload-ul pe care îl așteaptă BE-ul tău
      const payload: any = {
        doctorId: formData.doctorId,
        // ideal BE să primească patientId, nu name/email:
        patientId: selectedPatient?.id ?? null,
        // dacă momentan BE primește name/email, păstrează-le:
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        startTime: startISO,
        durationMinutes: Number(formData.duration),
        type: formData.type || null,
        notes: formData.notes || null,
      };

      await clinicApiService.createAppointment(payload);

      toast.success('Appointment scheduled successfully!');
      onClose();
      // Reset form
      setFormData({
        patientName: '',
        patientEmail: '',
        date: '',
        time: '',
        duration: '30',
        type: '',
        notes: '',
        doctorId: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule appointment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Schedule New Appointment</span>
          </DialogTitle>
          <DialogDescription>
            Selectează doctorul și completează detaliile programării.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor */}
          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor</Label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) => handleSelectChange('doctorId', value)}
              disabled={loadingDoctors || !currentClinic}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingDoctors ? 'Loading doctors...' : 'Select doctor'} />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {/* Ajustează după structura Doctor */}
                    {d.firstName && d.lastName
                      ? `${d.firstName} ${d.lastName}${d.specialization ? ` – ${d.specialization}` : ''}`
                      : d.name || 'Doctor'}
                  </SelectItem>
                ))}
                {(!loadingDoctors && doctors.length === 0) && (
                  <div className="px-3 py-2 text-sm text-gray-500">No doctors found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Patient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder="Enter patient name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientEmail">Patient Email</Label>
              <Input
                id="patientEmail"
                name="patientEmail"
                type="email"
                value={formData.patientEmail}
                onChange={handleInputChange}
                placeholder="patient@email.com"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">General Consultation</SelectItem>
                  <SelectItem value="checkup">Regular Checkup</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="specialist">Specialist Consultation</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes or special requirements..."
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!formData.doctorId}>
              Schedule Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentModal;
