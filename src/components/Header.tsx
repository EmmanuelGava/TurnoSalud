import { Hospital } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface HeaderProps {
  provinces: string[];
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
}

export default function Header({ provinces, selectedProvince, onProvinceChange }: HeaderProps) {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Hospital className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">TurnoSalud</h1>
        </Link>
        <div className="w-full max-w-xs">
          <Select value={selectedProvince} onValueChange={onProvinceChange}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Seleccionar Provincia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las Provincias</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
