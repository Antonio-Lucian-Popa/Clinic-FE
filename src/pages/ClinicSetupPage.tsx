import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { clinicApiService } from '@/services/clinicApiService';

function ClinicSetupPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    specialties: '',
    workingHours: {
      monday: { start: '09:00', end: '17:00', closed: false },
      tuesday: { start: '09:00', end: '17:00', closed: false },
      wednesday: { start: '09:00', end: '17:00', closed: false },
      thursday: { start: '09:00', end: '17:00', closed: false },
      friday: { start: '09:00', end: '17:00', closed: false },
      saturday: { start: '09:00', end: '13:00', closed: false },
      sunday: { start: '09:00', end: '13:00', closed: true }
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // API call pentru crearea cabinetului
      console.log('Creating clinic:', formData);
      const data = await clinicApiService.createClinic(formData);
      if(data) {
        toast.success('Cabinetul a fost creat cu succes!');
        // Redirect la dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('Eroare la crearea cabinetului');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configurează-ți Cabinetul
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completează informațiile despre cabinetul tău medical
          </p>
        </div>

        {/* Setup Form */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Informații Cabinet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Numele Cabinetului</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Cabinet Medical Dr. Popescu"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="description">Descriere</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrierea serviciilor oferite..."
                    rows={3}
                  />
                 */}
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+40 123 456 789"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@cabinet.ro"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Strada Medicilor 15, București"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="specialties">Specialități</Label>
                  <Input
                    id="specialties"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    placeholder="Medicină generală, Cardiologie, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (opțional)</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.cabinet.ro"
                  />
                </div> */}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Mai târziu
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Creez cabinetul...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Creează Cabinetul
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ClinicSetupPage;