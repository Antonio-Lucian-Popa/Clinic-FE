import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { clinicApiService } from '@/services/clinicApiService';


interface ClinicStatusCheckerProps {
  children: React.ReactNode;
}

interface ClinicStatus {
  hasClinic: boolean;
  isOwner: boolean;
  clinicId?: string;
  needsInvitation?: boolean;
}

function ClinicStatusChecker({ children }: ClinicStatusCheckerProps) {
  const { user, isAuthenticated } = useAuth();
  const [clinicStatus, setClinicStatus] = useState<ClinicStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    // Check if user has USER role and needs to complete profile
    if (user.roles?.includes('USER')) {
      setIsLoading(false);
      return;
    }
    checkClinicStatus();
  }, [isAuthenticated, user]);

  const checkClinicStatus = async () => {
    try {
      // API call pentru a verifica statusul cabinetului utilizatorului
      // const response = await clinicApiRequest.get('/api/user/clinic-status');
      const clinics = await clinicApiService.getClinics();
      if(clinics && clinics.length > 0) {
        const clinicStatus: ClinicStatus = {
          hasClinic: true,
          isOwner: !!user?.roles?.includes('OWNER'),
          clinicId: clinics[0].id, // Presupunem că utilizatorul are un singur cabinet
          needsInvitation: user?.roles?.includes('DOCTOR') || user?.roles?.includes('ASSISTANT')
        };

         setClinicStatus(clinicStatus);
      }
    } catch (error) {
      console.error('Failed to check clinic status:', error);
      // În caz de eroare, permitem accesul
      setClinicStatus({ hasClinic: true, isOwner: false });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users with USER role to profile edit
  if (user?.roles?.includes('USER')) {
    return <Navigate to="/profile-edit" replace />;
  }
  if (!clinicStatus?.hasClinic) {
    // Dacă utilizatorul este OWNER și nu are cabinet, îl redirecționăm la setup
    if (clinicStatus?.isOwner) {
      return <Navigate to="/clinic-setup" replace />;
    }
    
    // Dacă utilizatorul este DOCTOR/ASSISTANT și nu are cabinet, îl redirecționăm la invitație
    if (clinicStatus?.needsInvitation) {
      return <Navigate to="/invitation" replace />;
    }
  }

  return <>{children}</>;
}

export default ClinicStatusChecker;