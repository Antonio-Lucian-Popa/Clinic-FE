import React, { createContext, useContext, useState, useEffect } from 'react';
import { clinicApiService } from '../services/clinicApiService';
import { toast } from 'sonner';

export interface Clinic {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserClinicRole {
  clinicId: string;
  clinic: Clinic;
}

interface ClinicContextType {
  currentClinic: Clinic | null;
  userClinics: UserClinicRole[];
  isLoading: boolean;
  setCurrentClinic: (clinic: Clinic) => void;
  loadUserClinics: () => Promise<void>;
  switchClinic: (clinicId: string) => Promise<void>;
  createClinic: (clinicData: Partial<Clinic>) => Promise<Clinic>;
  joinClinic: (inviteCode: string) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [currentClinic, setCurrentClinicState] = useState<Clinic | null>(null);
  const [userClinics, setUserClinics] = useState<UserClinicRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserClinics();
  }, []);

  const loadUserClinics = async () => {
  try {
    setIsLoading(true);
    const apiClinics = await clinicApiService.getUserClinics(); // returns Clinic[]
    const clinics: Clinic[] = apiClinics.map((clinic: any) => ({
      id: clinic.id,
      name: clinic.name,
      description: clinic.description,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email ?? '',
      website: clinic.website,
      ownerId: clinic.ownerId ?? '',
      createdAt: clinic.createdAt ?? '',
      updatedAt: clinic.updatedAt ?? '',
    }));

    const mapped: UserClinicRole[] = clinics.map((clinic) => ({
      clinicId: clinic.id,
      clinic: {
        ...clinic,
        ownerId: clinic.ownerId ?? '',
        email: clinic.email ?? '',
      },
    }));

    setUserClinics(mapped);

    const savedClinicId = localStorage.getItem('currentClinicId');
    const foundClinic = mapped.find(c => c.clinicId === savedClinicId);

    if (foundClinic) {
      setCurrentClinicState(foundClinic.clinic);
    } else if (mapped.length > 0) {
      setCurrentClinicState(mapped[0].clinic);
      localStorage.setItem('currentClinicId', mapped[0].clinicId);
    }
  } catch (error) {
    console.error('Failed to load clinics:', error);
    toast.error('Failed to load your clinics');
  } finally {
    setIsLoading(false);
  }
};

  const setCurrentClinic = (clinic: Clinic) => {
    setCurrentClinicState(clinic);
    localStorage.setItem('currentClinicId', clinic.id);
  };

  const switchClinic = async (clinicId: string) => {
    const clinic = userClinics.find(c => c.clinicId === clinicId);
    if (clinic) {
      setCurrentClinic(clinic.clinic);
      toast.success(`Switched to ${clinic.clinic.name}`);
    }
  };

  const createClinic = async (clinicData: Partial<Clinic>): Promise<Clinic> => {
    try {
      const newClinic = await clinicApiService.createClinic(clinicData);
      await loadUserClinics(); // Reload to get updated list
      // Ensure newClinic has all required properties
      const completeClinic: Clinic = {
          ...newClinic,
          createdAt: newClinic.createdAt ?? '',
          updatedAt: newClinic.updatedAt ?? '',
          id: newClinic.id,
          name: newClinic.name,
          address: newClinic.address,
          phone: newClinic.phone,
          description: newClinic.description,
          ownerId: '',
          email: newClinic.email ?? ''
      };
      setCurrentClinic(completeClinic);
      toast.success('Clinic created successfully!');
      return completeClinic;
    } catch (error) {
      toast.error('Failed to create clinic');
      throw error;
    }
  };

  const joinClinic = async (inviteCode: string): Promise<void> => {
    try {
      await clinicApiService.joinClinic(inviteCode);
      await loadUserClinics(); // Reload to get updated list
      toast.success('Successfully joined clinic!');
    } catch (error) {
      toast.error('Failed to join clinic');
      throw error;
    }
  };

  const value = {
    currentClinic,
    userClinics,
    isLoading,
    setCurrentClinic,
    loadUserClinics,
    switchClinic,
    createClinic,
    joinClinic,
  };

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}