import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { clinicApiService, type Appointment } from '../services/clinicApiService';
import AppointmentModal from '../components/Modals/AppointmentModal';
import { toast } from 'sonner';

interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

function Calendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const appointmentsData = await clinicApiService.getAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];
    const today = new Date();

    // Add previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        appointments: getAppointmentsForDate(date),
        isToday: isSameDay(date, today),
        isCurrentMonth: false,
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        appointments: getAppointmentsForDate(date),
        isToday: isSameDay(date, today),
        isCurrentMonth: true,
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        appointments: getAppointmentsForDate(date),
        isToday: isSameDay(date, today),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === dateString);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.toDateString() === date2.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getDayAppointments = (date: Date | null) => {
    if (!date) return [];
    return getAppointmentsForDate(date);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl text-left font-bold text-gray-900 dark:text-white">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your appointment schedule
          </p>
        </div>
        <Button 
          onClick={() => setIsAppointmentModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{formatDate(currentDate)}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-24 p-2 border border-gray-200 dark:border-gray-700 cursor-pointer
                      transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                      ${!day.isCurrentMonth ? 'opacity-50' : ''}
                      ${day.isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
                      ${selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500' : ''}
                    `}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        day.isToday ? 'text-blue-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day.date.getDate()}
                      </span>
                      {day.appointments.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {day.appointments.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {day.appointments.slice(0, 2).map((appointment, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded truncate"
                        >
                          {appointment.time} {appointment.patientName}
                        </div>
                      ))}
                      {day.appointments.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{day.appointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {getDayAppointments(selectedDate).length > 0 ? (
                    getDayAppointments(selectedDate).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {appointment.duration}min
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{appointment.patientName}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.type}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No appointments scheduled
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setIsAppointmentModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Appointment
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Click on a date to view appointments
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Appointments
                </span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </span>
                <span className="font-medium text-green-600">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </span>
                <span className="font-medium text-orange-600">
                  {appointments.filter(a => a.status === 'SCHEDULED').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)}
        selectedDate={selectedDate?.toISOString().split('T')[0]}
      />
    </div>
  );
}

export default Calendar;