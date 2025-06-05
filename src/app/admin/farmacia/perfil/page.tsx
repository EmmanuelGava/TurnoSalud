
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Save, UserCog } from 'lucide-react';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebaseConfig';

// Mocked data structure for now
interface PharmacyProfile {
  name: string;
  address: string;
  phone: string;
  province: string;
  municipality: string;
  fixedHours: {
    lunes?: string;
    martes?: string;
    miercoles?: string;
    jueves?: string;
    viernes?: string;
    sabado?: string;
    domingo?: string;
  };
}

export default function PharmacyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PharmacyProfile>({
    name: '',
    address: '',
    phone: '',
    province: '',
    municipality: '',
    fixedHours: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      // TODO: Fetch profile from Firestore
      // const fetchProfile = async () => {
      //   try {
      //     const pharmacyDocRef = doc(db, 'pharmacies', user.uid);
      //     const docSnap = await getDoc(pharmacyDocRef);
      //     if (docSnap.exists()) {
      //       setProfile(docSnap.data() as PharmacyProfile);
      //     } else {
      //       // Initialize with some defaults or leave blank if it's a new pharmacy
      //       setProfile(prev => ({...prev, name: user.displayName || '', /* other fields */ }));
      //       toast({ title: "Perfil no encontrado", description: "Completa los datos de tu farmacia."});
      //     }
      //   } catch (error) {
      //     console.error("Error fetching profile:", error);
      //     toast({ title: "Error", description: "No se pudo cargar el perfil.", variant: "destructive" });
      //   } finally {
      //     setInitialLoading(false);
      //   }
      // };
      // fetchProfile();
      
      // Using mock data for now:
      setProfile({
        name: 'Farmacia Ejemplo (Cargar desde DB)',
        address: 'Calle Falsa 123',
        phone: '011-1234-5678',
        province: 'CABA',
        municipality: 'Palermo',
        fixedHours: { lunes: '09:00-20:00', martes: '09:00-20:00' }
      });
      setInitialLoading(false);
    }
  }, [user, loading, router, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("fixedHours.")) {
      const day = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        fixedHours: { ...prev.fixedHours, [day]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      // TODO: Save profile to Firestore
      // const pharmacyDocRef = doc(db, 'pharmacies', user.uid);
      // await setDoc(pharmacyDocRef, profile, { merge: true }); // Use setDoc with merge:true or updateDoc
      console.log("Saving profile:", profile); // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Perfil Actualizado",
        description: "La información de tu farmacia ha sido guardada.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || initialLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando perfil...</div>;
  }

  if (!user) return null;

  const daysOfWeek = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/admin/farmacia/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Link>
      </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <UserCog className="h-7 w-7 text-primary" />
            Gestionar Perfil de Farmacia
          </CardTitle>
          <CardDescription>
            Actualiza los datos de contacto y horarios fijos de tu farmacia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nombre de la Farmacia</Label>
                <Input id="name" name="name" value={profile.name} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address">Dirección Completa</Label>
              <Input id="address" name="address" value={profile.address} onChange={handleChange} required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="province">Provincia</Label>
                <Input id="province" name="province" value={profile.province} onChange={handleChange} placeholder="Ej: Buenos Aires"/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="municipality">Localidad/Municipio</Label>
                <Input id="municipality" name="municipality" value={profile.municipality} onChange={handleChange} placeholder="Ej: La Plata"/>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold pt-4 border-t mt-6">Horarios Fijos Semanales</h3>
            <CardDescription>Deja en blanco si un día está cerrado. Formato ej: 09:00-13:00, 16:00-20:00 o 24hs.</CardDescription>
            <div className="space-y-3">
              {daysOfWeek.map(day => (
                <div key={day} className="grid grid-cols-3 gap-2 items-center">
                  <Label htmlFor={`fixedHours.${day}`} className="capitalize">{day}</Label>
                  <Input
                    id={`fixedHours.${day}`}
                    name={`fixedHours.${day}`}
                    value={(profile.fixedHours as any)[day] || ''}
                    onChange={handleChange}
                    placeholder="Ej: 09:00-20:00"
                    className="col-span-2"
                  />
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
