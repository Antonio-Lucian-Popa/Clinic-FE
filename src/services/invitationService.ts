import { clinicApiRequest } from './api';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  clinicName: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
  acceptedAt?: string;
}

export interface InviteRequest {
  email: string;
  role: string;
  cabinetId: string;
  doctorId?: string; // Pentru ASSISTANT
}

export interface InvitationAcceptRequest {
  token: string;
  encodedPassword: string;
  firstName: string;
  lastName: string;
}

export interface InvitationVerifyResponse {
  email: string;
  role: string;
  cabinet_id: string;
  doctor_id?: string;
}

class InvitationService {
  // Trimite o invitație
  async sendInvitation(inviteData: InviteRequest): Promise<void> {
    try {
      await clinicApiRequest.post('/api/invitations', inviteData);
    } catch (error) {
      console.error('Send invitation error:', error);
      throw error;
    }
  }

  // Obține toate invitațiile trimise de utilizatorul curent
  async getMyInvitations(): Promise<Invitation[]> {
    try {
      return await clinicApiRequest.get<Invitation[]>('/api/invitations/my');
    } catch (error) {
      console.error('Get invitations error:', error);
      // Mock data pentru demo
      return [
        {
          id: '1',
          email: 'doctor@example.com',
          role: 'DOCTOR',
          clinicName: 'Cabinet Medical Central',
          status: 'PENDING',
          createdAt: '2024-12-05T10:00:00Z'
        },
        {
          id: '2',
          email: 'nurse@example.com',
          role: 'ASSISTANT',
          clinicName: 'Cabinet Medical Central',
          status: 'ACCEPTED',
          createdAt: '2024-12-04T14:30:00Z',
          acceptedAt: '2024-12-04T16:45:00Z'
        },
        {
          id: '3',
          email: 'receptionist@example.com',
          role: 'RECEPTIONIST',
          clinicName: 'Cabinet Medical Central',
          status: 'EXPIRED',
          createdAt: '2024-11-28T09:15:00Z'
        }
      ];
    }
  }

  // Acceptă o invitație
  async acceptInvitation(acceptData: InvitationAcceptRequest): Promise<void> {
    try {
      await clinicApiRequest.post('/api/invitations/accept', acceptData);
    } catch (error) {
      console.error('Accept invitation error:', error);
      throw error;
    }
  }

  // Anulează o invitație
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await clinicApiRequest.delete(`/api/invitations/${invitationId}`);
    } catch (error) {
      console.error('Cancel invitation error:', error);
      throw error;
    }
  }

  // Retrimite o invitație (pentru cele expirate)
  async resendInvitation(invitationId: string): Promise<void> {
    try {
      await clinicApiRequest.post(`/api/invitations/${invitationId}/resend`);
    } catch (error) {
      console.error('Resend invitation error:', error);
      throw error;
    }
  }

  // Verifică validitatea unui token de invitație
  async verifyInvitation(token: string): Promise<InvitationVerifyResponse> {
    try {
      return await clinicApiRequest.get<InvitationVerifyResponse>(`/api/invitations/verify?token=${token}`);
    } catch (error) {
      console.error('Verify invitation error:', error);
      throw error;
    }
  }

  // Obține lista doctorilor pentru invitarea asistenților
  async getDoctorsForClinic(clinicId: string): Promise<Array<{id: string, name: string}>> {
    try {
      return await clinicApiRequest.get<Array<{id: string, name: string}>>(`/api/clinics/${clinicId}/doctors`);
    } catch (error) {
      console.error('Get doctors error:', error);
      // Mock data pentru demo
      return [
        { id: '1', name: 'Dr. Sarah Johnson' },
        { id: '2', name: 'Dr. Michael Brown' },
        { id: '3', name: 'Dr. Emily Davis' }
      ];
    }
  }
}

export const invitationService = new InvitationService();