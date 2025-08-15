import { UserClinicRole } from '@/contexts/ClinicContex';
import { clinicApiRequest } from './api';

import {
  Appointment,
  Clinic,
  Doctor,
  MedicalRecord,
  PageAppointments,
  PagePacients,
  Patient
} from '../services/types';

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
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true
      };
    }
  }

  async getUserClinics(): Promise<Clinic[]> {
    try {
      return await clinicApiRequest.get<Clinic[]>('/api/cabinets');
    } catch (error) {
      console.error('Get user clinics error:', error);
      throw error;
    }
  }

  async joinClinic(inviteCode: string): Promise<void> {
    try {
      await clinicApiRequest.post('/api/clinics/join', { inviteCode });
    } catch (error) {
      console.error('Join clinic error:', error);
      throw error;
    }
  }

  async createClinic(clinicData: Partial<Clinic>): Promise<Clinic> {
    return await clinicApiRequest.post<Clinic>('/api/cabinets', clinicData);
  }

    async generateInviteCode(clinicId: string): Promise<{ inviteCode: string; expiresAt: string }> {
    try {
      return await clinicApiRequest.post(`/api/clinics/${clinicId}/invite`);
    } catch (error) {
      console.error('Generate invite code error:', error);
      throw error;
    }
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
  async getAppointments(): Promise<PageAppointments> {
    try {
      return await clinicApiRequest.get<PageAppointments>('/api/appointments');
    } catch (error) {
      console.error('Get appointments error:', error);
      // Return mock data for demo
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 0,
        number: 0,
        numberOfElements: 0,
        first: true,
        last: true,
        empty: true
      };
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

  getDoctorsByClinic(clinicId: string): Promise<Doctor[]> {
    return clinicApiRequest.get<Doctor[]>(`/api/doctor-assistants/doctor/by-clinic/${clinicId}`);
  }

  // +++ NEW: caută pacienți dintr-un cabinet, cu paginare + query
async getPatientsByCabinet(
  cabinetId: string,
  opts: { page: number; size: number; q?: string }
): Promise<PagePacients> {
  const params = new URLSearchParams({
    page: String(opts.page),
    size: String(opts.size),
  });
  if (opts.q && opts.q.trim().length > 0) {
    params.set('q', opts.q.trim()); // <-- back-end-ul tău așteaptă 'q'
  }
  return await clinicApiRequest.get<PagePacients>(
    `/api/patients/by-cabinet/${cabinetId}?${params.toString()}`
  );
}

}

export const clinicApiService = new ClinicApiService();