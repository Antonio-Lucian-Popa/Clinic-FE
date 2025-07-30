import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Stethoscope, Pill, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { clinicApiService, type MedicalRecord } from '../../services/clinicApiService';
import type { Patient } from '../../services/clinicApiService';

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

function MedicalHistoryModal({ isOpen, onClose, patient }: MedicalHistoryModalProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient && isOpen) {
      loadMedicalRecords();
    }
  }, [patient, isOpen]);

  const loadMedicalRecords = async () => {
    if (!patient) return;
    
    try {
      setIsLoading(true);
      const records = await clinicApiService.getMedicalRecords(patient.id);
      setMedicalRecords(records);
    } catch (error) {
      console.error('Failed to load medical records:', error);
      // Mock data for demo
      setMedicalRecords([
        {
          id: '1',
          patientId: patient.id,
          doctorId: '1',
          date: '2024-11-15',
          diagnosis: 'Hypertension',
          symptoms: ['Headache', 'Dizziness', 'Fatigue'],
          treatment: 'Prescribed ACE inhibitor, lifestyle modifications',
          prescription: ['Lisinopril 10mg daily', 'Low sodium diet'],
          notes: 'Patient responded well to treatment. Follow-up in 3 months.',
          followUpDate: '2025-02-15'
        },
        {
          id: '2',
          patientId: patient.id,
          doctorId: '1',
          date: '2024-10-20',
          diagnosis: 'Annual Physical Examination',
          symptoms: [],
          treatment: 'Routine checkup completed',
          prescription: ['Multivitamin daily'],
          notes: 'All vital signs normal. Continue current medications.',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Medical History - {patient.firstName} {patient.lastName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Summary */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Current Conditions</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.medicalHistory.length > 0 ? (
                      patient.medicalHistory.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Known Allergies</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.allergies.length > 0 ? (
                      patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None recorded</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Records</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {medicalRecords.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Medical Records</h3>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : medicalRecords.length > 0 ? (
              <div className="space-y-4">
                {medicalRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-green-600" />
                          <span>{record.diagnosis}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Symptoms */}
                      {record.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Symptoms:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {record.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treatment */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Treatment:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {record.treatment}
                        </p>
                      </div>

                      {/* Prescription */}
                      {record.prescription.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <Pill className="h-4 w-4 mr-1" />
                            Prescription:
                          </p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {record.prescription.map((med, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                {med}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {record.notes}
                          </p>
                        </div>
                      )}

                      {/* Follow-up */}
                      {record.followUpDate && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Follow-up scheduled: {new Date(record.followUpDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No medical records found for this patient.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MedicalHistoryModal;