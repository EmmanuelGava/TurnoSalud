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

const ALL_PROVINCES_SELECT_ITEM_VALUE = "__ALL_PROVINCES__"; // Unique non-empty value

export default function Header({ provinces, selectedProvince, onProvinceChange }: HeaderProps) {
  const handleValueChange = (value: string) => {
    if (value === ALL_PROVINCES_SELECT_ITEM_VALUE) {
      onProvinceChange(""); // Translate back to empty string for app state
    } else {
      onProvinceChange(value);
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Hospital className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">TurnoSalud</h1>
        </Link>
        <div className="w-full max-w-xs">
          {/* The Select's value prop correctly uses selectedProvince (which can be "") */}
          {/* This allows the placeholder to be shown when selectedProvince is "" */}
          <Select value={selectedProvince} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Seleccionar Provincia" />
            </SelectTrigger>
            <SelectContent>
              {/* This SelectItem now has a non-empty value */}
              <SelectItem value={ALL_PROVINCES_SELECT_ITEM_VALUE}>Todas las Provincias</SelectItem>
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
