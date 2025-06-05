
'use client';

import type { Pharmacy, DutyShiftData, FixedHours } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

// Helper to convert HH:MM string to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return NaN;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
};

// Helper to get day name in Spanish, lowercase, matching FixedHours keys
const getDayName = (date: Date): keyof FixedHours => {
  const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const days: (keyof FixedHours)[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return days[dayIndex];
};

export default function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayHours, setDisplayHours] = useState<string>(pharmacy.dutyHours || 'Consultar horario');
  // const [currentTimeDisplay, setCurrentTimeDisplay] = useState(''); // Optional: for debugging

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      // setCurrentTimeDisplay(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })); // For debugging
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDayName = getDayName(now);

      let pharmacyIsOpen = false;
      let calculatedDisplayHours = pharmacy.dutyHours || 'Consultar horario';

      // 1. Check Special Duty Shifts
      if (pharmacy.dutyShifts && pharmacy.dutyShifts.length > 0) {
        const todayShift = pharmacy.dutyShifts.find(shift => shift.date === currentDateStr);
        if (todayShift) {
          if (todayShift.is24hs) {
            pharmacyIsOpen = true;
            calculatedDisplayHours = '24 horas (Turno especial)';
          } else {
            const startTime = timeToMinutes(todayShift.startTime);
            let endTime = timeToMinutes(todayShift.endTime);

            if (!isNaN(startTime) && !isNaN(endTime)) {
              if (endTime <= startTime) { // Handles overnight shifts (e.g., 20:00 - 08:00 next day)
                 // This logic means if start is 08:00 and end is 08:00, it's a 24h cycle unless is24hs=true
                if (startTime === endTime) { // Assumed 24h if start and end are same and not is24hs explicitly
                    pharmacyIsOpen = true;
                } else if (currentTimeInMinutes >= startTime || currentTimeInMinutes < endTime) {
                    pharmacyIsOpen = true;
                }
              } else { // Normal same-day shift
                if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) {
                  pharmacyIsOpen = true;
                }
              }
              if (pharmacyIsOpen) {
                calculatedDisplayHours = `${todayShift.startTime} - ${todayShift.endTime} (Turno especial)`;
              }
            }
          }
          setIsOpen(pharmacyIsOpen);
          setDisplayHours(calculatedDisplayHours);
          return; // Special shift found and processed, no need to check fixed hours
        }
      }

      // 2. Check Fixed Hours if no applicable special shift
      if (pharmacy.fixedHours && pharmacy.fixedHours[currentDayName]) {
        const fixedHoursTodayString = pharmacy.fixedHours[currentDayName];
        if (fixedHoursTodayString && fixedHoursTodayString.toLowerCase().includes('24hs')) {
          pharmacyIsOpen = true;
          calculatedDisplayHours = '24 horas (Horario fijo)';
        } else if (fixedHoursTodayString) {
          const slots = fixedHoursTodayString.split(',').map(slot => slot.trim());
          for (const slot of slots) {
            const timeParts = slot.split('-');
            if (timeParts.length === 2) {
              const startTime = timeToMinutes(timeParts[0]);
              let endTime = timeToMinutes(timeParts[1]);

              if (!isNaN(startTime) && !isNaN(endTime)) {
                 if (endTime <= startTime) { // Handles overnight for fixed hours
                    if (startTime === endTime) pharmacyIsOpen = true; // 08:00-08:00 means 24h
                    else if (currentTimeInMinutes >= startTime || currentTimeInMinutes < endTime) pharmacyIsOpen = true;
                } else { // Normal same-day fixed hours
                  if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) {
                    pharmacyIsOpen = true;
                  }
                }
                if (pharmacyIsOpen) {
                  calculatedDisplayHours = `${timeParts[0]} - ${timeParts[1]} (Horario fijo)`;
                  break; // Found an open slot
                }
              }
            }
          }
        }
      }
      
      setIsOpen(pharmacyIsOpen);
      // If no specific hours made it open, displayHours remains pharmacy.dutyHours or "Consultar horario"
      // If it IS open due to fixed hours, calculatedDisplayHours would have been updated.
      if (pharmacyIsOpen && (calculatedDisplayHours === (pharmacy.dutyHours || 'Consultar horario'))) {
        // This case should be covered by the specific logic above, but as a fallback.
      } else {
         setDisplayHours(calculatedDisplayHours);
      }

    };

    checkOpenStatus();
    const intervalId = setInterval(checkOpenStatus, 60000); // Re-check every minute
    return () => clearInterval(intervalId);

  }, [pharmacy]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="font-headline text-xl">{pharmacy.name}</CardTitle>
          {isOpen ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Abierta Ahora
            </Badge>
          ) : (
            <Badge variant="destructive" className="whitespace-nowrap">
              <XCircle className="mr-1 h-4 w-4" /> Cerrada Ahora
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 mr-2 shrink-0" /> {pharmacy.address}
        </CardDescription>
        <CardDescription className="flex items-center text-muted-foreground text-xs">
           {pharmacy.municipality}, {pharmacy.province}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary shrink-0" />
            <span className="text-sm">Horario de Referencia: {displayHours}</span>
          </div>
          {pharmacy.phone && (
            <div className="flex items-center mt-2">
              <Phone className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span className="text-sm">{pharmacy.phone}</span>
            </div>
          )}
        </div>
        
        {pharmacy.phone && (
          <Button asChild variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary/10">
            <a href={`tel:${pharmacy.phone}`}>
              <Phone className="mr-2 h-4 w-4" /> Llamar
            </a>
          </Button>
        )}
        {/* Optional: For debugging time
         {currentTimeDisplay && <p className="text-xs text-muted-foreground text-center mt-1">Hora actual: {currentTimeDisplay}</p>}
        */}
      </CardContent>
    </Card>
  );
}
