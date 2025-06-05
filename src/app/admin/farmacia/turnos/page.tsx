
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CalendarClock, PlusCircle, Trash2, Edit3, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface DutyShift {
  id?: string; // Firestore document ID
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  is24hs: boolean;
  notes?: string;
  createdAt?: any; // Firestore ServerTimestamp
  updatedAt?: any; // Firestore ServerTimestamp
}

export default function PharmacyTurnsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [shifts, setShifts] = useState<DutyShift[]>([]);
  const [newShift, setNewShift] = useState<Omit<DutyShift, 'id'>>({ date: '', startTime: '08:00', endTime: '08:00', is24hs: false, notes: '' });
  const [editingShift, setEditingShift] = useState<DutyShift | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);
  const [showManualConfirm, setShowManualConfirm] = useState(false);

  const fetchShifts = useCallback(async () => {
    if (!user) return;
    setIsLoadingShifts(true);
    try {
      const shiftsCollectionRef = collection(db, 'pharmacies', user.uid, 'dutyShifts');
      // Query to order by date, and optionally filter past shifts if needed
      // For now, fetching all and sorting client-side. Can optimize with Firestore query for future dates.
      const q = query(shiftsCollectionRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedShifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DutyShift));
      setShifts(fetchedShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast({ title: "Error", description: "No se pudieron cargar los turnos.", variant: "destructive" });
    } finally {
      setIsLoadingShifts(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchShifts();
    }
  }, [user, loading, router, fetchShifts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string, value: any, type?: string, checked?: boolean } }, shiftType: 'new' | 'edit') => {
    const { name, value } = e.target;
    const type = e.target.type;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
  
    const targetShift = shiftType === 'new' ? newShift : editingShift;
    if (!targetShift && shiftType === 'edit') return; // Should not happen if editingShift is not null
  
    const updatedValue = type === 'checkbox' ? checked : value;
    
    if (shiftType === 'new') {
      setNewShift(prev => ({ ...prev, [name]: updatedValue }));
    } else if (editingShift) { // Ensure editingShift is not null
      setEditingShift(prev => prev ? ({ ...prev, [name]: updatedValue }) : null);
    }
  };
  

  const handleAddOrUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const shiftData = editingShift ? { ...editingShift } : { ...newShift };
    if (!shiftData.date || (!shiftData.is24hs && (!shiftData.startTime || !shiftData.endTime))) {
      toast({ title: "Datos incompletos", description: "Por favor, completa la fecha y horarios.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShift && editingShift.id) {
        const shiftDocRef = doc(db, 'pharmacies', user.uid, 'dutyShifts', editingShift.id);
        // Remove id from data to be saved
        const { id, ...dataToUpdate } = editingShift;
        await updateDoc(shiftDocRef, { ...dataToUpdate, updatedAt: serverTimestamp() });
        toast({ title: "Turno Actualizado", description: "El turno ha sido modificado." });
      } else {
        const shiftsCollectionRef = collection(db, 'pharmacies', user.uid, 'dutyShifts');
        await addDoc(shiftsCollectionRef, { ...shiftData, pharmacyId: user.uid, createdAt: serverTimestamp() });
        toast({ title: "Turno Agregado", description: "El nuevo turno ha sido guardado." });
      }
      setNewShift({ date: '', startTime: '08:00', endTime: '08:00', is24hs: false, notes: '' });
      setEditingShift(null);
      fetchShifts(); // Re-fetch shifts to show the latest data
    } catch (error) {
      console.error("Error saving shift:", error);
      toast({ title: "Error al Guardar", description: "No se pudo guardar el turno.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShift = async (shiftId?: string) => {
    if (!user || !shiftId) return;
    try {
      await deleteDoc(doc(db, 'pharmacies', user.uid, 'dutyShifts', shiftId));
      toast({ title: "Turno Eliminado", description: "El turno ha sido borrado." });
      fetchShifts(); // Re-fetch shifts
    } catch (error) {
        console.error("Error deleting shift:", error);
        toast({ title: "Error al Eliminar", description: "No se pudo borrar el turno.", variant: "destructive" });
    }
  };
  
  const handleManualConfirmTurno = async () => {
    if(!user) return;
    // This is a mock action for now.
    // In a real scenario, this might update a field in `pharmacies/{user.uid}`
    // or create a temporary "override" document.
    try {
      // Example: Update pharmacy document
      // const pharmacyDocRef = doc(db, 'pharmacies', user.uid);
      // await updateDoc(pharmacyDocRef, { 
      //   manuallyConfirmedOnDuty: true, 
      //   manuallyConfirmedAt: serverTimestamp(),
      //   manuallyConfirmedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // e.g., for 24 hours
      // });
      toast({ title: "Turno Confirmado Manualmente", description: "Has indicado que tu farmacia está de turno AHORA (simulación)."});
      setShowManualConfirm(false);
      // Potentially re-fetch pharmacy status or update UI to reflect this confirmation
    } catch (error) {
      console.error("Error manually confirming shift:", error);
      toast({ title: "Error", description: "No se pudo confirmar el turno manualmente.", variant: "destructive"});
    }
  }

  if (loading || isLoadingShifts) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando gestión de turnos...</div>;
  }
  if (!user) return null; // Should be redirected by useEffect

  const currentShiftData = editingShift || newShift;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin/farmacia/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Link>
      </Button>

      <Card className="max-w-4xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <CalendarClock className="h-7 w-7 text-primary" />
            {editingShift ? 'Editar Turno Especial' : 'Cargar Nuevo Turno Especial'}
          </CardTitle>
          <CardDescription>
            Define los días y horarios en que tu farmacia estará de turno. Estos se sumarán a tus horarios fijos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOrUpdateShift} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date">Fecha del Turno</Label>
                <Input id="date" name="date" type="date" value={currentShiftData.date} onChange={(e) => handleInputChange(e, editingShift ? 'edit' : 'new')} required />
              </div>
              <div className="flex items-end space-x-2 pb-1">
                 <Checkbox 
                    id="is24hs" 
                    name="is24hs" 
                    checked={!!currentShiftData.is24hs} 
                    onCheckedChange={(checked) => handleInputChange({ target: { name: 'is24hs', value: checked, type: 'checkbox', checked: !!checked } } as any, editingShift ? 'edit' : 'new')}
                  />
                <Label htmlFor="is24hs" className="text-sm font-medium">Turno 24hs</Label>
              </div>
            </div>
            {!currentShiftData.is24hs && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input id="startTime" name="startTime" type="time" value={currentShiftData.startTime} onChange={(e) => handleInputChange(e, editingShift ? 'edit' : 'new')} required={!currentShiftData.is24hs} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime">Hora Fin</Label>
                  <Input id="endTime" name="endTime" type="time" value={currentShiftData.endTime} onChange={(e) => handleInputChange(e, editingShift ? 'edit' : 'new')} required={!currentShiftData.is24hs} />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
              <Input id="notes" name="notes" value={currentShiftData.notes || ''} onChange={(e) => handleInputChange(e, editingShift ? 'edit' : 'new')} placeholder="Ej: Entrada por calle lateral después de las 22hs" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" /> {editingShift ? (isSubmitting ? 'Guardando...' : 'Guardar Cambios') : (isSubmitting ? 'Agregando...' : 'Agregar Turno')}
              </Button>
              {editingShift && (
                <Button type="button" variant="outline" onClick={() => {setEditingShift(null); setNewShift({ date: '', startTime: '08:00', endTime: '08:00', is24hs: false, notes: '' });}}>Cancelar Edición</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-headline">Turnos Cargados</CardTitle>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <p className="text-muted-foreground">No hay turnos especiales cargados.</p>
          ) : (
            <ul className="space-y-3">
              {shifts.map(shift => (
                <li key={shift.id} className="p-3 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold">{new Date(shift.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {shift.is24hs ? '24 horas' : `${shift.startTime} - ${shift.endTime}`}
                      {shift.notes && <span className="block sm:inline sm:ml-1">({shift.notes})</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <Button variant="outline" size="icon" onClick={() => setEditingShift(shift)}>
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteShift(shift.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Card className="max-w-4xl mx-auto mt-8 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" /> Confirmación Manual Rápida
          </CardTitle>
          <CardDescription className="dark:text-amber-300">
            Si tu farmacia está de turno AHORA MISMO por una situación imprevista o para asegurar visibilidad inmediata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showManualConfirm ? (
            <Button 
              onClick={() => setShowManualConfirm(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Activar: "Estoy de Turno Hoy"
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-amber-300 rounded-md bg-amber-100 dark:bg-amber-800/50 dark:border-amber-600">
              <p className="font-semibold text-amber-800 dark:text-amber-200">¿Confirmas que tu farmacia está de turno en este preciso momento?</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">Esta acción sobrescribirá temporalmente los turnos programados para la visualización pública (simulación).</p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleManualConfirmTurno}
                  className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                >Sí, confirmar ahora</Button>
                <Button variant="outline" onClick={() => setShowManualConfirm(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

    