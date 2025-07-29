import { clinicApiRequest } from './api';

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
  async getPatients(): Promise<Patient[]> {
    try {
      return await clinicApiRequest.get<Patient[]>('/api/patients');
    } catch (error) {
      console.error('Get patients error:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          firstName: 'Maria',
          lastName: 'Popescu',
          email: 'maria.popescu@email.com',
          phone: '+40 123 456 789',
          dateOfBirth: '1985-03-15',
          gender: 'female',
          address: 'Str. Florilor 10, București',
          emergencyContact: '+40 987 654 321',
          medicalHistory: ['Hipertensiune', 'Diabet tip 2'],
          allergies: ['Penicilină'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          firstName: 'Ion',
          lastName: 'Gheorghe',
          email: 'ion.gheorghe@email.com',
          phone: '+40 123 456 790',
          dateOfBirth: '1990-07-22',
          gender: 'male',
          address: 'Bd. Unirii 25, București',
          emergencyContact: '+40 987 654 322',
          medicalHistory: ['Astm bronșic'],
          allergies: [],
          createdAt: '2024-01-16T11:00:00Z',
          updatedAt: '2024-01-16T11:00:00Z'
        }
      ];
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