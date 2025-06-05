
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPharmacyById } from '@/lib/pharmacyService';
import type { Pharmacy, DutyShiftData, FixedHours } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Phone, Clock, CalendarDays, AlertTriangle, ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';

// Helper to convert HH:MM string to minutes from midnight (copied from PharmacyCard)
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || !timeStr.includes(':')) return NaN;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
};

// Helper to get day name in Spanish, lowercase, matching FixedHours keys (copied from PharmacyCard)
const getDayName = (date: Date): keyof FixedHours => {
  const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const days: (keyof FixedHours)[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return days[dayIndex];
};


export default function PharmacyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pharmacyId = typeof params.pharmacyId === 'string' ? params.pharmacyId : '';

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [displayHours, setDisplayHours] = useState<string>('Consultar horario');

  useEffect(() => {
    if (pharmacyId) {
      const loadPharmacy = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchPharmacyById(pharmacyId);
          if (data) {
            setPharmacy(data);
          } else {
            setError('Farmacia no encontrada.');
          }
        } catch (err) {
          console.error("Error loading pharmacy details:", err);
          setError('Error al cargar la información de la farmacia.');
        } finally {
          setLoading(false);
        }
      };
      loadPharmacy();
    } else {
      setError('ID de farmacia no válido.');
      setLoading(false);
    }
  }, [pharmacyId]);

  useEffect(() => {
    if (!pharmacy) return;

    const checkOpenStatus = () => {
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDayName = getDayName(now);

      let pharmacyIsOpen = false;
      let calculatedDisplayHours = 'Consultar horario';

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
              if (endTime <= startTime) { 
                if (startTime === endTime) pharmacyIsOpen = true;
                else if (currentTimeInMinutes >= startTime || currentTimeInMinutes < endTime) pharmacyIsOpen = true;
              } else { 
                if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) pharmacyIsOpen = true;
              }
              if (pharmacyIsOpen) {
                calculatedDisplayHours = `${todayShift.startTime} - ${todayShift.endTime} (Turno especial)`;
              }
            }
          }
          setIsOpen(pharmacyIsOpen);
          setDisplayHours(calculatedDisplayHours);
          return; 
        }
      }

      // 2. Check Fixed Hours
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
                  if (currentTimeInMinutes >= startTime && currentTimeInMinutes < endTime) pharmacyIsOpen = true;
                }
                if (pharmacyIsOpen) {
                  calculatedDisplayHours = `${fixedHoursTodayString} (Horario fijo)`; // Show full day string
                  break; 
                }
              }
            }
          }
        }
      }
      setIsOpen(pharmacyIsOpen);
      if (pharmacyIsOpen && calculatedDisplayHours === 'Consultar horario' && pharmacy.fixedHours && pharmacy.fixedHours[currentDayName]) {
         setDisplayHours(pharmacy.fixedHours[currentDayName] || 'Consultar horario');
      } else if (pharmacyIsOpen) {
        setDisplayHours(calculatedDisplayHours);
      } else if (pharmacy.fixedHours && pharmacy.fixedHours[currentDayName]) {
         setDisplayHours(pharmacy.fixedHours[currentDayName] || 'Consultar horario');
      } else {
         setDisplayHours('Consultar horario');
      }
    };

    checkOpenStatus();
    const intervalId = setInterval(checkOpenStatus, 60000); 
    return () => clearInterval(intervalId);
  }, [pharmacy]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">Cargando detalles de la farmacia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">{error}</h2>
        <p className="text-muted-foreground mb-6">No pudimos encontrar o cargar la farmacia que buscas.</p>
        <Button onClick={() => router.push('/')}>
          <Home className="mr-2" /> Volver al Inicio
        </Button>
      </div>
    );
  }

  if (!pharmacy) {
    return null; // Should be covered by error state, but as a fallback
  }

  const daysOfWeek: (keyof FixedHours)[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href={pharmacy.province ? `/turnos/${encodeURIComponent(pharmacy.province)}` : '/'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a {pharmacy.province || 'la búsqueda'}
        </Link>
      </Button>

      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
            <CardTitle className="text-3xl font-headline">{pharmacy.name}</CardTitle>
            <div className={`text-sm px-3 py-1.5 rounded-full font-semibold flex items-center whitespace-nowrap ${isOpen ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'}`}>
              {isOpen ? <Clock className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
              {isOpen ? 'Abierta Ahora' : 'Cerrada Ahora'}
            </div>
          </div>
          <CardDescription className="text-base flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-5 w-5 shrink-0 text-primary" />
            {pharmacy.address}, {pharmacy.municipality}, {pharmacy.province}
          </CardDescription>
          {pharmacy.phone && (
            <CardDescription className="text-base flex items-center text-muted-foreground pt-1">
              <Phone className="mr-2 h-5 w-5 shrink-0 text-primary" />
              {pharmacy.phone}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" /> Horario Actual de Referencia
            </h3>
            <p className="text-lg">{displayHours}</p>
            {pharmacy.email && (
              <p className="text-sm text-muted-foreground mt-1">Email: {pharmacy.email}</p>
            )}
          </section>

          {pharmacy.fixedHours && Object.values(pharmacy.fixedHours).some(h => h) && (
            <section>
              <h3 className="text-xl font-semibold mb-3 border-t pt-4 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Horarios Fijos Semanales
              </h3>
              <ul className="space-y-1 list-inside">
                {daysOfWeek.map(day => (
                  pharmacy.fixedHours?.[day] && (
                    <li key={day} className="flex">
                      <span className="capitalize font-medium w-28">{day}:</span>
                      <span>{pharmacy.fixedHours[day]}</span>
                    </li>
                  )
                ))}
              </ul>
            </section>
          )}

          {pharmacy.dutyShifts && pharmacy.dutyShifts.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-3 border-t pt-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" /> Próximos Turnos Especiales
              </h3>
              <div className="space-y-2">
                {pharmacy.dutyShifts
                  .filter(shift => new Date(shift.date + 'T00:00:00') >= new Date(new Date().toDateString())) // Show today and future shifts
                  .slice(0, 5) // Limit to next 5 for brevity
                  .map(shift => (
                  <Card key={shift.id} className="bg-muted/50 p-3">
                    <p className="font-semibold">
                      {new Date(shift.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm">
                      {shift.is24hs ? '24 horas' : `${shift.startTime} - ${shift.endTime}`}
                      {shift.notes && <span className="block text-xs text-muted-foreground">({shift.notes})</span>}
                    </p>
                  </Card>
                ))}
                {pharmacy.dutyShifts.filter(shift => new Date(shift.date + 'T00:00:00') >= new Date(new Date().toDateString())).length === 0 && (
                   <p className="text-muted-foreground">No hay próximos turnos especiales cargados.</p>
                )}
              </div>
            </section>
          )}
          
          {pharmacy.phone && (
            <Button asChild className="w-full mt-6" size="lg">
              <a href={`tel:${pharmacy.phone}`}>
                <Phone className="mr-2" /> Llamar a la Farmacia
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
