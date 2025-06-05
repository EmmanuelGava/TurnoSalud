
'use client';

import { useState, useEffect, useMemo, useContext } from 'react';
import type { Pharmacy } from '@/types';
import PharmacyCard from '@/components/PharmacyCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import { AppContext } from '@/app/AppStateWrapper';
import { Frown } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProvincePharmaciesPage() {
  const params = useParams();
  const context = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  
  const provinceNameFromUrl = useMemo(() => {
    const name = params.provinceName;
    return typeof name === 'string' ? decodeURIComponent(name) : '';
  }, [params.provinceName]);

  // Ensure context is loaded before proceeding
  if (!context) {
    return <div>Cargando estado de la aplicación...</div>;
  }
  const { setSelectedProvince, getMunicipalities, allPharmacies, provinces } = context;

  // Effect to update selectedProvince in context based on URL parameter
  useEffect(() => {
    if (provinceNameFromUrl && setSelectedProvince) {
      // Check if provinceNameFromUrl is a valid province
      if (provinces.includes(provinceNameFromUrl)) {
        setSelectedProvince(provinceNameFromUrl);
      } else {
        // Handle invalid province in URL, e.g., redirect or show error
        // For now, clearing selected province might be one option, or redirect to 404
        // console.warn("Invalid province in URL:", provinceNameFromUrl);
        // router.push('/404') or setSelectedProvince('') to show no results
      }
    }
  }, [provinceNameFromUrl, setSelectedProvince, provinces]);

  const municipalities = useMemo(() => {
    return getMunicipalities(provinceNameFromUrl);
  }, [provinceNameFromUrl, getMunicipalities]);

  useEffect(() => {
    // Reset municipality if province changes (e.g. user types different URL) 
    // and current municipality is not in the new list
    if (provinceNameFromUrl && municipalities.length > 0 && !municipalities.includes(selectedMunicipality)) {
      setSelectedMunicipality('');
    }
  }, [provinceNameFromUrl, municipalities, selectedMunicipality]);


  useEffect(() => {
    if (!provinceNameFromUrl || !provinces.includes(provinceNameFromUrl)) {
      setFilteredPharmacies([]); // If province is invalid or not yet loaded from URL, show no pharmacies
      return;
    }

    let result = allPharmacies.filter(p => p.province === provinceNameFromUrl);

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
  }, [searchTerm, provinceNameFromUrl, selectedMunicipality, allPharmacies, provinces]);

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleMunicipalityChange = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  if (!provinceNameFromUrl || !provinces.includes(provinceNameFromUrl)) {
     // Optional: Add a more specific message or a redirect for invalid provinces
     // For now, relies on the empty filteredPharmacies to show "No hay farmacias"
  }

  return (
    <div>
      <h2 className="text-3xl font-headline font-bold mb-6 text-center">
        Farmacias de Turno en {provinceNameFromUrl || 'Provincia Desconocida'}
      </h2>
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        municipalities={municipalities}
        selectedMunicipality={selectedMunicipality}
        onMunicipalityChange={handleMunicipalityChange}
        selectedProvince={provinceNameFromUrl} // Pass the province from URL
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
          <h2 className="text-2xl font-headline font-semibold mb-2">No hay farmacias para mostrar en {provinceNameFromUrl || 'esta provincia'}</h2>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros o verificando la selección de provincia.
          </p>
          { !provinces.includes(provinceNameFromUrl) && provinceNameFromUrl && (
            <p className="text-red-500 mt-2">La provincia "{provinceNameFromUrl}" no es válida o no tiene farmacias registradas.</p>
          )}
        </div>
      )}
    </div>
  );
}

