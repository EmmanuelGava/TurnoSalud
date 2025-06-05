
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import type { Pharmacy } from '@/types';
import PharmacyCard from '@/components/PharmacyCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import { AppContext } from './AppStateWrapper';
import { Frown, Loader2 } from 'lucide-react';

export default function HomePage() {
  const context = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  
  if (!context) {
    // This case should ideally be handled by AppStateWrapper's own loading state
    return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />Cargando contexto...</div>;
  }
  const { selectedProvince, setSelectedProvince, getMunicipalities, allPharmacies, isLoadingPharmacies } = context;

  useEffect(() => {
    // On homepage, selectedProvince is managed by Header navigation.
    // Ensure it's cleared if user navigates back to home via logo/link that doesn't set a province.
    if (setSelectedProvince && selectedProvince !== '') {
         // This logic is mostly handled by Header now.
         // If we are on "/", selectedProvince should be ""
    }
    setSelectedMunicipality(''); 
  }, [setSelectedProvince]); // Removed selectedProvince from deps to avoid loop if it's set by URL then cleared here.

  const municipalities = useMemo(() => {
    return getMunicipalities(selectedProvince); // selectedProvince is "" on homepage initially
  }, [selectedProvince, getMunicipalities]);

  useEffect(() => {
    if (isLoadingPharmacies) {
      setFilteredPharmacies([]);
      return;
    }
    let result = allPharmacies;

    // On homepage, selectedProvince from context should be '', so no province filter.
    // If a province IS selected (e.g. user navigated to /turnos/Provincia then back to / via logo),
    // the header select might still show that province, but the homepage content should be all-encompassing
    // UNLESS we want homepage to also reflect the selectedProvince.
    // For now, homepage = all. Filtering by province happens on /turnos/[provinceName]

    if (selectedMunicipality) { // This filter applies if user selects a municipality on homepage (province must be selected first)
      result = result.filter(p => p.province === selectedProvince && p.municipality === selectedMunicipality);
    } else if (selectedProvince) { // If only province is selected (no municipality)
       result = result.filter(p => p.province === selectedProvince);
    }
    // If neither province nor municipality selected, result remains allPharmacies

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        p.address.toLowerCase().includes(lowerSearchTerm) ||
        (p.municipality && p.municipality.toLowerCase().includes(lowerSearchTerm)) ||
        (p.province && p.province.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredPharmacies(result);
  }, [searchTerm, selectedProvince, selectedMunicipality, allPharmacies, isLoadingPharmacies]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
    // If a municipality is chosen, we assume the current selectedProvince is the context for it.
  };
  
  // If still loading, show a global loader (AppStateWrapper also shows one)
  if (isLoadingPharmacies) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-headline font-semibold mb-2">Cargando Farmacias...</h2>
        <p className="text-muted-foreground">
          Estamos obteniendo la información más reciente.
        </p>
      </div>
    );
  }

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
            Prueba ajustando los filtros, ampliando tu término de búsqueda, o seleccionando una provincia.
          </p>
        </div>
      )}
    </div>
  );
}
