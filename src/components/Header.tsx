
'use client';
import { Hospital, LogIn, LogOut, UserPlus, Wrench } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';

interface HeaderProps {
  provinces: string[];
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
}

const ALL_PROVINCES_SELECT_ITEM_VALUE = "__ALL_PROVINCES__"; 

export default function Header({ provinces, selectedProvince, onProvinceChange }: HeaderProps) {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const handleValueChange = (value: string) => {
    if (value === ALL_PROVINCES_SELECT_ITEM_VALUE) {
      onProvinceChange(""); 
      router.push('/');
    } else {
      onProvinceChange(value);
      router.push(`/turnos/${encodeURIComponent(value)}`);
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Hospital className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">TurnoSalud</h1>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-full max-w-xs hidden sm:block">
            <Select value={selectedProvince || ALL_PROVINCES_SELECT_ITEM_VALUE} onValueChange={handleValueChange}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Seleccionar Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PROVINCES_SELECT_ITEM_VALUE}>Todas las Provincias</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!loading && user && (
            <Link href="/admin/farmacia/dashboard">
              <Button variant="outline" size="sm">
                <Wrench className="mr-2 h-4 w-4" /> Mi Panel
              </Button>
            </Link>
          )}
          {!loading && !user && (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" /> Ingresar
                </Button>
              </Link>
              <Link href="/auth/registro">
                <Button variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                </Button>
              </Link>
            </>
          )}
           {!loading && user && (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
