import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';


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

    checkClinicStatus();
  }, [isAuthenticated, user]);

  const checkClinicStatus = async () => {
    try {
      // API call pentru a verifica statusul cabinetului utilizatorului
      // const response = await clinicApiRequest.get('/api/user/clinic-status');
      
      // Mock logic pentru demo
      const mockStatus: ClinicStatus = {
        hasClinic: false, // Simulăm că nu are cabinet
        isOwner: user?.role === 'OWNER',
        needsInvitation: user?.role === 'DOCTOR' || user?.role === 'ASSISTANT'
      };

      setClinicStatus(mockStatus);
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