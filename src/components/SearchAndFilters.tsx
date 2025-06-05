'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  municipalities: string[];
  selectedMunicipality: string;
  onMunicipalityChange: (municipality: string) => void;
  selectedProvince: string; // To enable/disable municipality select
}

const ALL_MUNICIPALITIES_SELECT_ITEM_VALUE = "__ALL_MUNICIPALITIES__"; // Unique non-empty value

export default function SearchAndFilters({
  searchTerm,
  onSearchTermChange,
  municipalities,
  selectedMunicipality,
  onMunicipalityChange,
  selectedProvince,
}: SearchAndFiltersProps) {
  const handleMunicipalityValueChange = (value: string) => {
    if (value === ALL_MUNICIPALITIES_SELECT_ITEM_VALUE) {
      onMunicipalityChange(""); // Translate back to empty string for app state
    } else {
      onMunicipalityChange(value);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="search-location" className="block text-sm font-medium text-foreground mb-1">
            Buscar por Localidad o Barrio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search-location"
              type="text"
              placeholder="Ej: Palermo, La Plata Centro..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="select-municipality" className="block text-sm font-medium text-foreground mb-1">
            Filtrar por Municipio
          </label>
          {/* The Select's value prop correctly uses selectedMunicipality (which can be "") */}
          {/* This allows the placeholder to be shown when selectedMunicipality is "" */}
          <Select
            value={selectedMunicipality}
            onValueChange={handleMunicipalityValueChange}
            disabled={!selectedProvince || municipalities.length === 0}
          >
            <SelectTrigger id="select-municipality" className="w-full">
              <SelectValue placeholder="Seleccionar Municipio" />
            </SelectTrigger>
            <SelectContent>
              {/* This SelectItem now has a non-empty value */}
              <SelectItem value={ALL_MUNICIPALITIES_SELECT_ITEM_VALUE}>Todos los Municipios</SelectItem>
              {municipalities.map((municipality) => (
                <SelectItem key={municipality} value={municipality}>
                  {municipality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
