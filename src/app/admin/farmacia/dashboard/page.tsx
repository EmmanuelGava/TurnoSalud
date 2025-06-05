
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, UserCog, CalendarClock, LogOut } from 'lucide-react';

export default function PharmacyDashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando panel...</div>;
  }

  if (!user) {
    // This should ideally not be reached if useEffect redirect works, but as a fallback.
    return null; 
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Panel de Administración de Farmacia
          </CardTitle>
          <CardDescription>
            Bienvenido, {user.email}. Desde aquí puedes gestionar la información y los turnos de tu farmacia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/farmacia/perfil" passHref>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center justify-center space-y-2 text-lg">
                <UserCog className="h-10 w-10 mb-2 text-primary" />
                <span>Gestionar Perfil</span>
                <span className="text-xs text-muted-foreground">Actualiza datos de contacto y horarios.</span>
              </Button>
            </Link>
            <Link href="/admin/farmacia/turnos" passHref>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center justify-center space-y-2 text-lg">
                <CalendarClock className="h-10 w-10 mb-2 text-primary" />
                <span>Gestionar Turnos</span>
                 <span className="text-xs text-muted-foreground">Carga, edita o elimina turnos.</span>
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Esta es la primera versión del panel. Próximamente agregaremos más funcionalidades como carga masiva de turnos y estadísticas.
            </p>
            <Button onClick={signOut} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
