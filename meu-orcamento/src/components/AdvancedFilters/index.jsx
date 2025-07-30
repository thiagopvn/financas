import { useState } from 'react';
import { FaRedo, FaFilter, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useData } from '../../context/DataContext';
import AdvancedDateFilter from '../AdvancedDateFilter';
import AdvancedSearch from '../AdvancedSearch';
import Filters from '../Filters'; // Filtros tradicionais

const AdvancedFilters = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    advancedSearch,
    setAdvancedSearch,
    advancedDateRange,
    setAdvancedDateRange,
    getAllCategories,
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter
  } = useData();

  const categories = getAllCategories();

  // Limpar filtro de data avançado
  const clearAdvancedDateFilter = () => {
    setAdvancedDateRange({ start: null, end: null });
  };

  // Handler para mudança de busca avançada
  const handleSearchChange = (searchConfig) => {
    setAdvancedSearch(searchConfig);
  };

  // Handler para mudança de filtros na busca avançada
  const handleFiltersChange = (filters) => {
    // Sincronizar com os filtros tradicionais se necessário
    if (filters.categories && filters.categories.length > 0) {
      setCategoryFilter(filters.categories);
    }
  };

  // Handler para mudança de datas
  const handleDateRangeChange = (start, end) => {
    setAdvancedDateRange({ start, end });
    // Limpar filtro de data tradicional quando usar o avançado
    if (dateFilter !== 'all') {
      setDateFilter('all');
    }
  };

  // Verificar se há filtros avançados ativos
  const hasAdvancedFilters = () => {
    return (
      (advancedSearch && (advancedSearch.term || 
       (advancedSearch.filters && (
         advancedSearch.filters.categories?.length > 0 ||
         advancedSearch.filters.amountMin ||
         advancedSearch.filters.amountMax ||
         advancedSearch.filters.includeTerms ||
         advancedSearch.filters.excludeTerms
       )))) ||
      (advancedDateRange.start && advancedDateRange.end)
    );
  };

  // Limpar todos os filtros avançados
  const clearAllAdvancedFilters = () => {
    setAdvancedSearch(null);
    setAdvancedDateRange({ start: null, end: null });
    // Também limpar filtros tradicionais
    setDateFilter('all');
    setCategoryFilter([]);
  };

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    
    if (advancedSearch?.term) count++;
    if (advancedSearch?.filters?.categories?.length > 0) count++;
    if (advancedSearch?.filters?.amountMin || advancedSearch?.filters?.amountMax) count++;
    if (advancedSearch?.filters?.includeTerms) count++;
    if (advancedSearch?.filters?.excludeTerms) count++;
    if (advancedDateRange.start && advancedDateRange.end) count++;
    if (dateFilter !== 'all') count++;
    if (categoryFilter.length > 0) count++;
    
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Cabeçalho com controles */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" size={16} />
              <h3 className="font-medium text-gray-900">
                Filtros e Busca
              </h3>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasAdvancedFilters() && (
              <button
                onClick={clearAllAdvancedFilters}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                title="Limpar todos os filtros"
              >
                <FaRedo size={12} />
                <span>Limpar tudo</span>
              </button>
            )}
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-1 px-2 py-1.5 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
              title={isCollapsed ? 'Expandir filtros' : 'Recolher filtros'}
            >
              {isCollapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo dos filtros */}
      {!isCollapsed && (
        <div className="p-6 space-y-6">
          {/* Busca Avançada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Busca Inteligente
            </label>
            <AdvancedSearch
              onSearchChange={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              availableCategories={categories}
            />
            {advancedSearch?.term && (
              <div className="mt-2 text-xs text-gray-600">
                <span>Modo: </span>
                <span className="font-medium capitalize">
                  {advancedSearch.mode === 'contains' ? 'Contém' :
                   advancedSearch.mode === 'exact' ? 'Exato' :
                   advancedSearch.mode === 'starts' ? 'Inicia com' :
                   advancedSearch.mode === 'ends' ? 'Termina com' :
                   advancedSearch.mode === 'regex' ? 'Regex' :
                   advancedSearch.mode === 'fuzzy' ? 'Busca aproximada' :
                   advancedSearch.mode}
                </span>
                {advancedSearch.caseSensitive && (
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    Case sensitive
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filtro de Data Avançado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Período
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <AdvancedDateFilter
                startDate={advancedDateRange.start}
                endDate={advancedDateRange.end}
                onDateRangeChange={handleDateRangeChange}
                onClear={clearAdvancedDateFilter}
                className="flex-1"
              />
              
              {/* Mostrar filtros tradicionais como fallback */}
              {!advancedDateRange.start && !advancedDateRange.end && (
                <div className="text-sm text-gray-500 flex items-center">
                  <span>ou use os </span>
                  <button 
                    onClick={() => setIsCollapsed(true)}
                    className="text-blue-600 hover:text-blue-700 ml-1 underline"
                  >
                    filtros rápidos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resumo dos filtros ativos */}
          {hasAdvancedFilters() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Filtros Ativos
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                {advancedSearch?.term && (
                  <div>• Busca: "{advancedSearch.term}"</div>
                )}
                {advancedSearch?.filters?.categories?.length > 0 && (
                  <div>• Categorias: {advancedSearch.filters.categories.join(', ')}</div>
                )}
                {(advancedSearch?.filters?.amountMin || advancedSearch?.filters?.amountMax) && (
                  <div>
                    • Valores: 
                    {advancedSearch.filters.amountMin && ` >= R$ ${advancedSearch.filters.amountMin}`}
                    {advancedSearch.filters.amountMin && advancedSearch.filters.amountMax && ' e'}
                    {advancedSearch.filters.amountMax && ` <= R$ ${advancedSearch.filters.amountMax}`}
                  </div>
                )}
                {advancedSearch?.filters?.includeTerms && (
                  <div>• Deve conter: {advancedSearch.filters.includeTerms}</div>
                )}
                {advancedSearch?.filters?.excludeTerms && (
                  <div>• Não deve conter: {advancedSearch.filters.excludeTerms}</div>
                )}
                {advancedDateRange.start && advancedDateRange.end && (
                  <div>
                    • Período: {advancedDateRange.start.toLocaleDateString('pt-BR')} - {advancedDateRange.end.toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros tradicionais quando recolhido */}
      {isCollapsed && (
        <div className="px-6 py-3 border-t border-gray-200">
          <Filters />
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;