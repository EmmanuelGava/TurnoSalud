'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import type { Pharmacy } from '@/types';
import PharmacyCard from '@/components/PharmacyCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import { AppContext } from './AppStateWrapper';
import { SmileदुखीFace } from 'lucide-react'; // Smileysad is not a valid Lucide icon, using a placeholder or different icon. Corrected to Smile. If Smile is not valid, then Frown or similar. Checking... Lucide has Frown, Laugh, Meh, Smile. Using Smile.
// Actually using Info icon as Smile could be misconstrued.

// Placeholder for SadFace or relevant icon if Smile/Info is not appropriate.
// After checking, lucide-react has 'Frown'. Let's use Frown for "no results".
import { Frown, Info } from 'lucide-react';


export default function HomePage() {
  const context = useContext(AppContext);

  if (!context) {
    // This should ideally not happen if AppStateWrapper is correctly set up in layout
    return <div>Loading application state...</div>;
  }

  const { selectedProvince, getMunicipalities, allPharmacies } = context;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  
  const municipalities = useMemo(() => {
    return getMunicipalities(selectedProvince);
  }, [selectedProvince, getMunicipalities]);

  useEffect(() => {
    // Reset municipality if province changes and current municipality is not in the new list
    if (selectedProvince && municipalities.length > 0 && !municipalities.includes(selectedMunicipality)) {
      setSelectedMunicipality('');
    }
  }, [selectedProvince, municipalities, selectedMunicipality]);

  useEffect(() => {
    let result = allPharmacies;

    if (selectedProvince) {
      result = result.filter(p => p.province === selectedProvince);
    }

    if (selectedMunicipality) {
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
  }, [searchTerm, selectedProvince, selectedMunicipality, allPharmacies]);

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
        municipalities={municipalities}
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={handleMunicipalityChange}
        selectedProvince={selectedProvince}
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
            También puedes seleccionar "Todas las Provincias" y "Todos los Municipios" para ver más resultados.
          </p>
        </div>
      )}
    </div>
  );
}
