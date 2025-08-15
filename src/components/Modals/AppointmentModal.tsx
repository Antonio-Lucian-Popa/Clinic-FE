import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, FileText, Search, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { useClinic } from '@/contexts/ClinicContex';
import { clinicApiService } from '@/services/clinicApiService';
import { cn } from '@/lib/utils';
import { AppointmentStatus } from '@/services/types';

// --- tipuri minime folosite aici (adaptează dacă le ai în service) ---
type Doctor = {
  id: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  name?: string;
};

type PatientLite = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  selectedPatient?: PatientLite | null;
}

function AppointmentModal({ isOpen, onClose, selectedDate, selectedPatient }: AppointmentModalProps) {
  const { currentClinic } = useClinic();

  // Doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Patients (searchable select)
  const [patientOpen, setPatientOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientsPage, setPatientsPage] = useState<Page<PatientLite> | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(selectedPatient?.id ?? '');

  // Form
  const [formData, setFormData] = useState({
    date: selectedDate || '',
    time: '',
    duration: '30',
    type: '',
    notes: '',
    doctorId: '',
    status: 'SCHEDULED' as AppointmentStatus,
  });

  // Prefill date
  useEffect(() => {
    if (selectedDate) setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  // Prefill patient din exterior
  useEffect(() => {
    setSelectedPatientId(selectedPatient?.id ?? '');
    if (selectedPatient?.firstName || selectedPatient?.lastName) {
      setPatientQuery(`${selectedPatient.firstName} ${selectedPatient.lastName}`.trim());
    }
  }, [selectedPatient]);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      if (!isOpen || !currentClinic?.id) return;
      try {
        setLoadingDoctors(true);
        const list = await clinicApiService.getDoctorsByClinic(currentClinic.id);
        setDoctors(list);
        if (list.length === 1) {
          setFormData(prev => ({ ...prev, doctorId: list[0].id }));
        }
      } catch (err) {
        console.error(err);
        toast.error('Nu am putut încărca lista de doctori');
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [isOpen, currentClinic?.id]);

  // Debounced patients search
  useEffect(() => {
    if (!isOpen || !currentClinic?.id) return;

    const handler = setTimeout(async () => {
      try {
        setLoadingPatients(true);
        const page = await clinicApiService.getPatientsByCabinet(currentClinic.id, {
          page: 0,
          size: 10,
          q: patientQuery || undefined,
        });
        setPatientsPage(page);
      } catch (err) {
        console.error(err);
        toast.error('Nu am putut încărca pacienții');
      } finally {
        setLoadingPatients(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [patientQuery, isOpen, currentClinic?.id]);

  // Compose start & end ISO
  const startISO = useMemo(() => {
    if (!formData.date || !formData.time) return null;
    return `${formData.date}T${formData.time}:00`;
  }, [formData.date, formData.time]);

  const endISO = useMemo(() => {
    if (!startISO) return null;
    const start = new Date(startISO);
    const end = new Date(start.getTime() + Number(formData.duration) * 60 * 1000);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = end.getFullYear();
    const MM = pad(end.getMonth() + 1);
    const dd = pad(end.getDate());
    const HH = pad(end.getHours());
    const mm = pad(end.getMinutes());
    const ss = pad(end.getSeconds());
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}`;
  }, [startISO, formData.duration]);

  const selectedPatientLabel =
    patientsPage?.content.find(p => p.id === selectedPatientId)
      ? `${patientsPage!.content.find(p => p.id === selectedPatientId)!.firstName} ${patientsPage!.content.find(p => p.id === selectedPatientId)!.lastName}`
      : (patientQuery || '');

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorId) return toast.error('Selectează un doctor');
    if (!selectedPatientId) return toast.error('Selectează un pacient');
    if (!startISO || !endISO) return toast.error('Completează data și ora');

    try {
      await clinicApiService.createAppointment({
        doctorId: formData.doctorId,
        patientId: selectedPatientId,
        startTime: startISO,
        endTime: endISO,
        notes: formData.notes || undefined,
        status: formData.status,
      });
      toast.success('Programarea a fost creată!');
      onClose();
      setFormData({
        date: '',
        time: '',
        duration: '30',
        type: '',
        notes: '',
        doctorId: '',
        status: 'SCHEDULED',
      });
      setSelectedPatientId('');
      setPatientQuery('');
      setPatientsPage(null);
    } catch (error) {
      console.error(error);
      toast.error('Eroare la crearea programării');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Schedule New Appointment</span>
          </DialogTitle>
          <DialogDescription>
            Selectează doctorul și pacientul, apoi completează detaliile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                    {d.firstName && d.lastName
                      ? `${d.firstName} ${d.lastName}${d.specialization ? ` – ${d.specialization}` : ''}`
                      : d.name || 'Doctor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient (Combobox cu search) */}
          <div className="space-y-2">
            <Label>Patient</Label>

            <Popover open={patientOpen} onOpenChange={setPatientOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={patientOpen}
                  className="w-full justify-between"
                  onClick={() => setPatientOpen((v) => !v)}
                >
                  {selectedPatientId
                    ? (selectedPatientLabel || 'Selected patient')
                    : (patientQuery ? patientQuery : 'Select patient...')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command shouldFilter={false}>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <CommandInput
                      placeholder="Search by name or email..."
                      value={patientQuery}
                      onValueChange={(val) => {
                        setSelectedPatientId('');
                        setPatientQuery(val);
                      }}
                      className="pl-8"
                    />
                  </div>
                  <CommandList>
                    {loadingPatients && (
                      <div className="px-3 py-2 text-sm flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </div>
                    )}

                    {!loadingPatients && (
                      <>
                        <CommandEmpty>No patients found.</CommandEmpty>
                        <CommandGroup>
                          {(patientsPage?.content ?? []).map((p) => {
                            const label = `${p.firstName} ${p.lastName}`;
                            return (
                              <CommandItem
                                key={p.id}
                                value={label}
                                onSelect={() => {
                                  setSelectedPatientId(p.id);
                                  setPatientQuery(label);
                                  setPatientOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedPatientId === p.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">{label}</span>
                                  {p.email && (
                                    <span className="text-xs text-gray-500">{p.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedPatientId && (
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Selected patient ID: <span className="font-mono">{selectedPatientId}</span>
              </div>
            )}
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

          {/* Duration & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={formData.duration} onValueChange={(value) => handleSelectChange('duration', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="45">45</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value as AppointmentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
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
                placeholder="Additional notes..."
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!formData.doctorId || !selectedPatientId}
            >
              Schedule Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AppointmentModal;
