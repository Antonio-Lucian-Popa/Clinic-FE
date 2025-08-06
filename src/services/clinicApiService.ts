import { clinicApiRequest } from './api';

export interface PagePacients {
  content: Patient[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescription: string[];
  notes: string;
  followUpDate?: string;
}

export interface Clinic {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

class ClinicApiService {
  // Patients API
  async getPatients({ page, size }: { page: number; size: number }): Promise<PagePacients> {
    try {
      return await clinicApiRequest.get<PagePacients>(`/api/patients?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Get patients error:', error);
      // Return mock data for demo
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page,
        numberOfElements: 0
      };
    }
  }

  async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
    return await clinicApiRequest.post<Clinic>('/api/cabinets', clinicData);
  }

  async getClinics(): Promise<Clinic[]> {
    try {
      return await clinicApiRequest.get<Clinic[]>('/api/cabinets');
    } catch (error) {
      console.error('Get clinics error:', error);
      return [];
    }
  }

  async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    return await clinicApiRequest.post<Patient>('/api/patients', patientData);
  }

  async getNewPatientsThisMonth(): Promise<number> {
    const response = await clinicApiRequest.get('/api/patients/stats/new-this-month');
    return response;
  }

  async updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient> {
    return await clinicApiRequest.put<Patient>(`/api/patients/${id}`, patientData);
  }

  async getRecentAppointments(): Promise<Appointment[]> {
    try {
      return clinicApiRequest.get<Appointment[]>('/api/dashboard/recent-appointments');
    } catch (error) {
      console.error('Get recent appointments error:', error);
      return [];
    }
  }

  // Appointments API
  async getAppointments(): Promise<Appointment[]> {
    try {
      return await clinicApiRequest.get<Appointment[]>('/api/appointments');
    } catch (error) {
      console.error('Get appointments error:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          patientName: 'Maria Popescu',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-12-05',
          time: '10:00',
          duration: 30,
          type: 'Consultație generală',
          status: 'SCHEDULED',
          notes: 'Control periodic',
          createdAt: '2024-12-04T10:00:00Z'
        },
        {
          id: '2',
          patientId: '2',
          doctorId: '1',
          patientName: 'Ion Gheorghe',
          doctorName: 'Dr. Sarah Johnson',
          date: '2024-12-05',
          time: '14:30',
          duration: 45,
          type: 'Consultație specialistă',
          status: 'CONFIRMED',
          notes: 'Evaluare astm',
          createdAt: '2024-12-04T11:00:00Z'
        }
      ];
    }
  }

  async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    return await clinicApiRequest.post<Appointment>('/api/appointments', appointmentData);
  }

  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment> {
    return await clinicApiRequest.put<Appointment>(`/api/appointments/${id}`, appointmentData);
  }

  // Medical Records API
  async getMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
    try {
      return await clinicApiRequest.get<MedicalRecord[]>(`/api/medical-records/patient/${patientId}`);
    } catch (error) {
      console.error('Get medical records error:', error);
      return [];
    }
  }

  async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return await clinicApiRequest.post<MedicalRecord>('/api/medical-records', recordData);
  }

  // Dashboard Stats
  async getDashboardStats() {
    try {
      return await clinicApiRequest.get('/api/dashboard');
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      // Return mock data for demo
      return {
        totalPatients: 156,
        todayAppointments: 12,
        pendingAppointments: 8,
        completedAppointments: 4,
        recentPatients: 23,
        revenueThisMonth: 15420
      };
    }
  }
}

export const clinicApiService = new ClinicApiService();