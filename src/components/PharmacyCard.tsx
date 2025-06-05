'use client';

import type { Pharmacy } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export default function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');

  useEffect(() => {
    const checkOpenStatus = () => {
      if (pharmacy.dutyHours.toLowerCase().includes('24hs')) {
        setIsOpen(true);
        return;
      }

      const now = new Date();
      setCurrentTimeDisplay(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

      const timeParts = pharmacy.dutyHours.split(' - ');
      if (timeParts.length === 2) {
        const [startStr, endStr] = timeParts;
        const [startHour, startMinute] = startStr.split(':').map(Number);
        const [endHour, endMinute] = endStr.split(':').map(Number);

        if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
          setIsOpen(false); // Invalid time format
          return;
        }

        const startTimeInMinutes = startHour * 60 + startMinute;
        let endTimeInMinutes = endHour * 60 + endMinute;

        // Handle cases where duty hours span past midnight
        if (endTimeInMinutes < startTimeInMinutes) {
          // e.g. 20:00 - 04:00
          if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        } else {
          // e.g. 08:00 - 22:00
          if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        }
      } else {
        setIsOpen(false); // Default to closed if format is unexpected
      }
    };

    checkOpenStatus();
    // Optionally, update every minute if you want live status without page reload
    const intervalId = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(intervalId);

  }, [pharmacy.dutyHours]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-xl mb-1">{pharmacy.name}</CardTitle>
          {isOpen ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Abierta Ahora
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-4 w-4" /> Cerrada Ahora
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2 shrink-0" /> {pharmacy.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-primary shrink-0" />
          <span className="text-sm">Horario de turno: {pharmacy.dutyHours}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-primary shrink-0" />
          <span className="text-sm">{pharmacy.phone}</span>
        </div>
        <Button asChild variant="outline" className="w-full mt-2 border-primary text-primary hover:bg-primary/10">
          <a href={`tel:${pharmacy.phone}`}>
            <Phone className="mr-2 h-4 w-4" /> Llamar
          </a>
        </Button>
         {/* currentTimeDisplay && <p className="text-xs text-muted-foreground text-center mt-1">Hora actual: {currentTimeDisplay}</p> */}
      </CardContent>
    </Card>
  );
}
