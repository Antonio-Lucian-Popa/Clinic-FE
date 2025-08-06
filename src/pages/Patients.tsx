import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Eye,
  Edit,
  History,
  CalendarPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clinicApiService, type Patient } from '../services/clinicApiService';
import PatientModal from '../components/Modals/PatientModal';
import { toast } from 'sonner';
import AppointmentModal from '@/components/Modals/AppointmentModal';
import PatientDetailsModal from '@/components/Modals/PatientDetailsModal';
import PatientEditModal from '@/components/Modals/PatientEditModal';
import MedicalHistoryModal from '@/components/Modals/MedicalHistoryModal';

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [newPatientsThisMonth, setNewPatientsThisMonth] = useState<number>(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isPatientDetailsModalOpen, setIsPatientDetailsModalOpen] = useState(false);
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [isMedicalHistoryModalOpen, setIsMedicalHistoryModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, [page]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await clinicApiService.getPatients({ page, size: pageSize });
      const newPatients = await clinicApiService.getNewPatientsThisMonth();

      setPatients((prev) => (page === 0 ? data.content : [...prev, ...data.content]));
      setTotalPatients(data.totalElements);
      setIsLastPage(data.last);
      console.log("New patients this month:", newPatients);
      setNewPatientsThisMonth(newPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLastPage) setPage((prev) => prev + 1);
  };

  const filteredPatients = patients.filter((patient) =>
    [patient.firstName, patient.lastName, patient.email].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleViewDetails = (p: Patient) => { setSelectedPatient(p); setIsPatientDetailsModalOpen(true); };
  const handleEditPatient = (p: Patient) => { setSelectedPatient(p); setIsPatientEditModalOpen(true); };
  const handleMedicalHistory = (p: Patient) => { setSelectedPatient(p); setIsMedicalHistoryModalOpen(true); };
  const handleScheduleAppointment = (p: Patient) => { setSelectedPatient(p); setIsAppointmentModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patients and their medical information</p>
        </div>
        <Button onClick={() => setIsPatientModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Patient
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-600">Total Patients</p><p className="text-2xl font-bold">{totalPatients}</p></div><User className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-600">New This Month</p><p className="text-2xl font-bold">{newPatientsThisMonth}</p></div><Calendar className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm text-gray-600">Active Cases</p><p className="text-2xl font-bold">45</p></div><FileText className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="flex flex-col min-h-[360px]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(patient.firstName, patient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{patient.firstName} {patient.lastName}</h3>
                    <p className="text-sm text-gray-500">Age {calculateAge(patient.dateOfBirth)}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(patient)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditPatient(patient)}><Edit className="mr-2 h-4 w-4" /> Edit Patient</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMedicalHistory(patient)}><History className="mr-2 h-4 w-4" /> Medical History</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleScheduleAppointment(patient)}><CalendarPlus className="mr-2 h-4 w-4" /> Schedule Appointment</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col justify-between flex-1">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600"><Mail className="h-4 w-4 mr-2" /> <span className="truncate">{patient.email}</span></div>
                  <div className="flex items-center text-sm text-gray-600"><Phone className="h-4 w-4 mr-2" /> <span>{patient.phone}</span></div>
                </div>

                <div className="space-y-2">
                  {patient.medicalHistory.length > 0 && (<><p className="text-xs font-medium">Medical History:</p><div className="flex flex-wrap gap-1">{patient.medicalHistory.slice(0, 2).map((c, i) => (<Badge key={i} variant="secondary" className="text-xs">{c}</Badge>))}{patient.medicalHistory.length > 2 && (<Badge variant="outline" className="text-xs">+{patient.medicalHistory.length - 2} more</Badge>)}</div></>)}
                  {patient.allergies.length > 0 && (<><p className="text-xs font-medium">Allergies:</p><div className="flex flex-wrap gap-1">{patient.allergies.slice(0, 2).map((a, i) => (<Badge key={i} variant="destructive" className="text-xs">{a}</Badge>))}{patient.allergies.length > 2 && (<Badge variant="outline" className="text-xs">+{patient.allergies.length - 2} more</Badge>)}</div></>)}
                </div>
              </div>
              <div className="flex space-x-2 pt-4 mt-auto">
                <Button size="sm" className="flex-1">View Profile</Button>
                <Button size="sm" variant="outline" className="flex-1">Schedule</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLastPage && (
        <div className="text-center">
          <Button onClick={handleLoadMore} variant="outline" className="mt-6">Load More</Button>
        </div>
      )}

      {/* Empty State */}
      {filteredPatients.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No patients found matching your search.' : 'No patients added yet.'}
          </p>
          <Button onClick={() => setIsPatientModalOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" /> Add Your First Patient
          </Button>
        </div>
      )}

      <AppointmentModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} selectedPatient={selectedPatient} />
      <PatientDetailsModal isOpen={isPatientDetailsModalOpen} onClose={() => setIsPatientDetailsModalOpen(false)} patient={selectedPatient} />
      <PatientEditModal isOpen={isPatientEditModalOpen} onClose={() => setIsPatientEditModalOpen(false)} patient={selectedPatient} onPatientUpdated={() => { setPage(0); }} />
      <MedicalHistoryModal isOpen={isMedicalHistoryModalOpen} onClose={() => setIsMedicalHistoryModalOpen(false)} patient={selectedPatient} />
      <PatientModal isOpen={isPatientModalOpen} onClose={() => { setIsPatientModalOpen(false); setPage(0); }} />
    </div>
  );
}

export default Patients;
