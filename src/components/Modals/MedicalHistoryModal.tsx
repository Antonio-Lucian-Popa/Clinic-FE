import React, { useState, useEffect } from 'react';
import { FileText, User, Heart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { clinicApiService } from '../../services/clinicApiService';

type MedicalRecordSummary = {
  patientId: string;
  medicalHistory: string[];
  allergies: string[];
};

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  // ... restul câmpurilor tale
};

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

function MedicalHistoryModal({ isOpen, onClose, patient }: MedicalHistoryModalProps) {
  const [summary, setSummary] = useState<MedicalRecordSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      loadSummary();
    } else {
      setSummary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, isOpen]);

  const loadSummary = async () => {
    if (!patient) return;
    try {
      setIsLoading(true);
      // IMPORTANT: asigură-te că în clinicApiService ai implementat:
      // getPatientMedicalRecord(patientId: string): Promise<MedicalRecordSummary>
      const data = await clinicApiService.getPatientMedicalRecord(patient.id);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load medical record summary:', err);
      setSummary({ patientId: patient.id, medicalHistory: [], allergies: [] });
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient) return null;

  const med = summary?.medicalHistory ?? [];
  const alg = summary?.allergies ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Medical Record — {patient.firstName} {patient.lastName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rezumat pacient */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Istoric medical */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                    Medical History
                  </p>

                  {isLoading ? (
                    <div className="mt-2 space-y-2">
                      <div className="h-6 w-32 animate-pulse bg-gray-200 rounded" />
                      <div className="h-6 w-24 animate-pulse bg-gray-200 rounded" />
                    </div>
                  ) : med.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {med.map((condition, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">None recorded</p>
                  )}
                </div>

                {/* Alergii */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Allergies
                  </p>

                  {isLoading ? (
                    <div className="mt-2 space-y-2">
                      <div className="h-6 w-28 animate-pulse bg-gray-200 rounded" />
                      <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
                    </div>
                  ) : alg.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {alg.map((allergy, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">None recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* (opțional) acțiuni viitoare: editare istoric/alergii */}
          {/* <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700">Edit</Button>
          </div> */}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MedicalHistoryModal;
