
'use client';

import type { Pharmacy, DutyShiftData, FixedHours } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDayName = getDayName(now);

      let pharmacyIsOpen = false;
      let calculatedDisplayHours = 'Consultar horario'; // Default

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
              if (endTime <= startTime) { // Handles overnight shifts or 24h denoted by same start/end
                 // If start and end are same, it's effectively 24h for that day part
                if (startTime === endTime) pharmacyIsOpen = true;
                // If current time is past start OR before end (next day part)
                else if (currentTimeInMinutes >= startTime || currentTimeInMinutes < endTime) pharmacyIsOpen = true;
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
          return; // Special shift found and processed
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
                 if (endTime <= startTime) { 
                    if (startTime === endTime) pharmacyIsOpen = true; 
                    else if (currentTimeInMinutes >= startTime || currentTimeInMinutes < endTime) pharmacyIsOpen = true;
                } else { 
                  if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) {
                    pharmacyIsOpen = true;
                  }
                }
                if (pharmacyIsOpen) {
                  // Show the full day's fixed schedule string if open by fixed hours
                  calculatedDisplayHours = `${fixedHoursTodayString} (Horario fijo)`;
                  break; 
                }
              }
            }
          }
        }
      }
      
      setIsOpen(pharmacyIsOpen);
      // Update displayHours based on whether it's open and what schedule applies
      if (pharmacyIsOpen) {
          setDisplayHours(calculatedDisplayHours);
      } else {
          // If closed, show today's fixed hours if available, otherwise the default
          const fixedToday = pharmacy.fixedHours?.[currentDayName];
          setDisplayHours(fixedToday || 'Consultar horario');
      }
    };

    checkOpenStatus();
    const intervalId = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(intervalId);

  }, [pharmacy]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-1">
          <CardTitle className="font-headline text-xl hover:text-primary transition-colors">
            <Link href={`/farmacia/${pharmacy.id}`}>
              {pharmacy.name}
            </Link>
          </CardTitle>
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
      <CardContent className="space-y-3 flex-grow flex flex-col justify-between pt-0">
        <div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-primary shrink-0" />
            <span>{displayHours}</span>
          </div>
          {pharmacy.phone && (
            <div className="flex items-center mt-1 text-sm">
              <Phone className="h-4 w-4 mr-2 text-primary shrink-0" />
              <span>{pharmacy.phone}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
            {pharmacy.phone && (
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                <a href={`tel:${pharmacy.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Llamar
                </a>
              </Button>
            )}
            <Button asChild variant="default" className="w-full">
              <Link href={`/farmacia/${pharmacy.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalles
              </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
