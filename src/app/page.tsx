
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import type { Pharmacy } from '@/types';
import PharmacyCard from '@/components/PharmacyCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import { AppContext } from './AppStateWrapper';
import { Frown } from 'lucide-react';

export default function HomePage() {
  const context = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  
  // Ensure context is loaded before proceeding
  if (!context) {
    return <div>Cargando estado de la aplicación...</div>;
  }
  const { selectedProvince, setSelectedProvince, getMunicipalities, allPharmacies } = context;

  // Effect to clear selectedProvince when navigating to the homepage
  useEffect(() => {
    if (setSelectedProvince && selectedProvince !== '') {
      setSelectedProvince('');
    }
    // Always reset municipality when on home page as province context is now ""
    setSelectedMunicipality(''); 
  }, [setSelectedProvince]); // Only re-run if setSelectedProvince changes (on mount)

  const municipalities = useMemo(() => {
    // On homepage, selectedProvince from context should be '', so municipalities list will be empty
    // and SearchAndFilters will disable municipality selection, which is correct.
    return getMunicipalities(selectedProvince); 
  }, [selectedProvince, getMunicipalities]);

  useEffect(() => {
    let result = allPharmacies;

    // Homepage shows all provinces, so no province filter here.
    // selectedProvince from context should be '' here.

    if (selectedMunicipality) {
      // This filter will only apply if a municipality was somehow selected,
      // but typically municipality dropdown is disabled if no province is selected.
      // Keeping it for edge cases or future enhancements.
      result = result.filter(p => p.municipality === selectedMunicipality);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.address.toLowerCase().includes(lowerSearchTerm) ||
        p.municipality.toLowerCase().includes(lowerSearchTerm) 
      );
    }
    setFilteredPharmacies(result);
  }, [searchTerm, selectedMunicipality, allPharmacies]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  return (
    <div>
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        municipalities={municipalities} // Will be empty if selectedProvince is ''
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={handleMunicipalityChange}
        selectedProvince={selectedProvince} // Pass current selectedProvince (should be '' here)
      />

      {filteredPharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Frown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-headline font-semibold mb-2">No hay farmacias para mostrar</h2>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros o ampliando tu término de búsqueda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Selecciona una provincia desde el menú superior para ver farmacias específicas.
          </p>
        </div>
      )}
    </div>
  );
}
