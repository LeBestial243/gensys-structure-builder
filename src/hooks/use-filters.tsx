import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personnalisé pour gérer les filtres de recherche pour les listes
 * @param initialFilters Filtres initiaux
 * @param items Liste d'éléments à filtrer
 * @param filterFn Fonction de filtrage à appliquer
 * @returns Objet contenant les filtres, les fonctions de mise à jour et les éléments filtrés
 */
export function useFilters<T, F extends Record<string, any>>(
  initialFilters: F,
  items: T[],
  filterFn: (item: T, filters: F) => boolean
) {
  // État pour les filtres
  const [filters, setFilters] = useState<F>(initialFilters);
  
  // Fonction pour mettre à jour un filtre spécifique
  const updateFilter = useCallback((key: keyof F, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  
  // Appliquer les filtres aux éléments
  const filteredItems = useMemo(() => {
    return items.filter(item => filterFn(item, filters));
  }, [items, filters, filterFn]);
  
  // Détermine si des filtres sont actifs
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const initialValue = initialFilters[key];
      const currentValue = filters[key];
      
      if (Array.isArray(initialValue) && Array.isArray(currentValue)) {
        return currentValue.length > 0 && JSON.stringify(initialValue) !== JSON.stringify(currentValue);
      }
      
      return initialValue !== currentValue && (
        currentValue !== '' && 
        currentValue !== null && 
        currentValue !== undefined
      );
    });
  }, [filters, initialFilters]);
  
  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    filteredItems,
    hasActiveFilters
  };
}