
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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface PharmacyProfile {
  name: string;
  address: string;
  phone: string;
  province: string;
  municipality: string;
  email?: string; // Added email for reference
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

const initialProfileState: PharmacyProfile = {
  name: '',
  address: '',
  phone: '',
  province: '',
  municipality: '',
  email: '',
  fixedHours: {
    lunes: '',
    martes: '',
    miercoles: '',
    jueves: '',
    viernes: '',
    sabado: '',
    domingo: '',
  },
};

export default function PharmacyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PharmacyProfile>(initialProfileState);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      const fetchProfile = async () => {
        setInitialLoading(true);
        try {
          const pharmacyDocRef = doc(db, 'pharmacies', user.uid);
          const docSnap = await getDoc(pharmacyDocRef);
          if (docSnap.exists()) {
            // Ensure all fields from initialProfileState are present, even if undefined in Firestore
            const fetchedData = docSnap.data();
            const completeProfile: PharmacyProfile = {
              ...initialProfileState, // Start with defaults
              ...(fetchedData as Partial<PharmacyProfile>), // Override with fetched data
              email: user.email || '', // Always ensure email is from auth user
              fixedHours: { // Ensure fixedHours object and its keys exist
                ...initialProfileState.fixedHours,
                ...(fetchedData.fixedHours || {}),
              }
            };
            setProfile(completeProfile);
          } else {
            // Initialize with user's email if available, and prompt to complete
            setProfile(prev => ({...initialProfileState, email: user.email || ''}));
            toast({ title: "Bienvenido/a", description: "Por favor, completa los datos de tu farmacia."});
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({ title: "Error al cargar perfil", description: "No se pudo cargar el perfil de la farmacia.", variant: "destructive" });
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, loading, router, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("fixedHours.")) {
      const day = name.split('.')[1] as keyof PharmacyProfile['fixedHours'];
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
    if (!user) {
      toast({ title: "Error", description: "Debes estar autenticado para guardar.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const pharmacyDocRef = doc(db, 'pharmacies', user.uid);
      // Ensure email is part of the profile, typically from the authenticated user
      const profileToSave = { ...profile, email: user.email || profile.email };
      await setDoc(pharmacyDocRef, profileToSave, { merge: true }); 

      toast({
        title: "Perfil Actualizado",
        description: "La información de tu farmacia ha sido guardada con éxito.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error al Guardar",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || initialLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando perfil...</div>;
  }

  if (!user) return null; // Should be redirected by useEffect, but good fallback

  const daysOfWeek: (keyof PharmacyProfile['fixedHours'])[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

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
            Actualiza los datos de contacto y horarios fijos de tu farmacia. El email asociado es {user.email}.
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
                <Input id="province" name="province" value={profile.province} onChange={handleChange} placeholder="Ej: Buenos Aires" required/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="municipality">Localidad/Municipio</Label>
                <Input id="municipality" name="municipality" value={profile.municipality} onChange={handleChange} placeholder="Ej: La Plata" required/>
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
                    value={profile.fixedHours[day] || ''}
                    onChange={handleChange}
                    placeholder="Ej: 09:00-20:00 o 24hs"
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
