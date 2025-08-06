import React from 'react';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClinic } from '@/contexts/ClinicContex';

function ClinicSelector() {
  const { currentClinic, userClinics, switchClinic } = useClinic();

  if (!currentClinic) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-3 h-auto">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentClinic.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentClinic.address}
              </p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Your Clinics</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userClinics.map((clinic) => (
          <DropdownMenuItem
            key={clinic.id}
            onClick={() => switchClinic(clinic)}
            className="flex items-center justify-between p-3 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                <Building2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{clinic.name}</p>
                <p className="text-xs text-gray-500">{clinic.address}</p>
              </div>
            </div>
            {currentClinic.id === clinic.id && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center space-x-2 text-blue-600">
          <Plus className="h-4 w-4" />
          <span>Create New Clinic</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ClinicSelector;
