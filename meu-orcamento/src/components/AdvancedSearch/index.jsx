import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaFilter, FaChevronDown, FaHistory, FaSave, FaTrash, FaMagic, FaSort } from 'react-icons/fa';

const AdvancedSearch = ({ 
  onSearchChange, 
  onFiltersChange,
  availableCategories = [],
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    description: '',
    categories: [],
    amountMin: '',
    amountMax: '',
    searchMode: 'contains', // contains, exact, starts, ends, regex
    caseSensitive: false,
    excludeTerms: '',
    includeTerms: ''
  });
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('basic'); // basic, advanced, saved
  
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Modos de busca
  const searchModes = [
    { value: 'contains', label: 'Contém', description: 'Busca qualquer ocorrência do termo' },
    { value: 'exact', label: 'Exato', description: 'Busca termo exato' },
    { value: 'starts', label: 'Inicia com', description: 'Busca termos que iniciam com o texto' },
    { value: 'ends', label: 'Termina com', description: 'Busca termos que terminam com o texto' },
    { value: 'regex', label: 'Regex', description: 'Busca usando expressão regular' },
    { value: 'fuzzy', label: 'Fuzzy', description: 'Busca aproximada (ignora pequenos erros)' }
  ];

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    const recent = localStorage.getItem('recentSearches');
    
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar buscas salvas:', e);
      }
    }
    
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (e) {
        console.error('Erro ao carregar buscas recentes:', e);
      }
    }
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
        setShowSavedSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Aplicar filtros
  const applyFilters = (newFilters = searchFilters, newSearchTerm = searchTerm) => {
    // Construir objeto de busca complexo
    const searchConfig = {
      term: newSearchTerm,
      filters: newFilters,
      mode: newFilters.searchMode,
      caseSensitive: newFilters.caseSensitive
    };

    // Adicionar à lista de buscas recentes
    if (newSearchTerm.trim()) {
      addToRecentSearches(newSearchTerm, newFilters);
    }

    onSearchChange(searchConfig);
    onFiltersChange && onFiltersChange(newFilters);
  };

  // Adicionar busca recente
  const addToRecentSearches = (term, filters) => {
    const searchEntry = {
      id: Date.now().toString(),
      term,
      filters: { ...filters },
      timestamp: new Date().toISOString()
    };

    const updated = [searchEntry, ...recentSearches.filter(s => s.term !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Salvar busca atual
  const saveCurrentSearch = () => {
    const name = prompt('Nome para esta busca:');
    if (!name || !searchTerm.trim()) return;

    const savedSearch = {
      id: Date.now().toString(),
      name,
      term: searchTerm,
      filters: { ...searchFilters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedSearches, savedSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Carregar busca salva
  const loadSavedSearch = (saved) => {
    setSearchTerm(saved.term);
    setSearchFilters(saved.filters);
    applyFilters(saved.filters, saved.term);
    setIsExpanded(false);
    setShowSavedSearches(false);
  };

  // Deletar busca salva
  const deleteSavedSearch = (id) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  // Busca inteligente com sugestões
  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    
    // Gerar sugestões baseadas em buscas recentes
    if (value.length > 1) {
      const suggestions = recentSearches
        .filter(s => s.term.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }

    // Aplicar busca em tempo real
    if (value.length > 2 || value === '') {
      applyFilters(searchFilters, value);
    }
  };

  // Limpar todos os filtros
  const clearAll = () => {
    setSearchTerm('');
    setSearchFilters({
      description: '',
      categories: [],
      amountMin: '',
      amountMax: '',
      searchMode: 'contains',
      caseSensitive: false,
      excludeTerms: '',
      includeTerms: ''
    });
    applyFilters({
      description: '',
      categories: [],
      amountMin: '',
      amountMax: '',
      searchMode: 'contains',
      caseSensitive: false,
      excludeTerms: '',
      includeTerms: ''
    }, '');
  };

  // Validar regex
  const isValidRegex = (pattern) => {
    try {
      new RegExp(pattern);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return searchTerm || 
           searchFilters.categories.length > 0 ||
           searchFilters.amountMin ||
           searchFilters.amountMax ||
           searchFilters.excludeTerms ||
           searchFilters.includeTerms;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Campo de busca principal */}
      <div className="relative">
        <div className={`flex items-center border rounded-lg transition-all duration-200 ${
          hasActiveFilters() ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <div className="flex items-center flex-1">
            <FaSearch className="text-gray-400 ml-3" size={16} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar transações... (descrição, valor, categoria)"
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
              className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-sm"
              onFocus={() => setIsExpanded(true)}
            />
          </div>
          
          <div className="flex items-center px-2 space-x-1">
            {hasActiveFilters() && (
              <button
                onClick={clearAll}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpar busca"
              >
                <FaTimes size={14} />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded transition-colors ${
                isExpanded ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Filtros avançados"
            >
              <FaFilter size={14} />
            </button>
          </div>
        </div>

        {/* Sugestões de busca */}
        {searchSuggestions.length > 0 && isExpanded && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
            {searchSuggestions.map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setSearchTerm(suggestion.term);
                  setSearchFilters(suggestion.filters);
                  applyFilters(suggestion.filters, suggestion.term);
                  setIsExpanded(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <FaHistory className="text-gray-400" size={12} />
                  <span>{suggestion.term}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Painel de filtros avançados */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'basic', label: 'Básico', icon: FaSearch },
              { id: 'advanced', label: 'Avançado', icon: FaMagic },
              { id: 'saved', label: 'Salvos', icon: FaSave }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 max-h-80 overflow-y-auto">
            {/* Tab: Básico */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Categorias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorias
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {availableCategories.map(category => (
                      <label key={category} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={searchFilters.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...searchFilters.categories, category]
                              : searchFilters.categories.filter(c => c !== category);
                            const newFilters = { ...searchFilters, categories: newCategories };
                            setSearchFilters(newFilters);
                            applyFilters(newFilters);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Faixa de valores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa de valores
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Valor mínimo"
                      value={searchFilters.amountMin}
                      onChange={(e) => {
                        const newFilters = { ...searchFilters, amountMin: e.target.value };
                        setSearchFilters(newFilters);
                        applyFilters(newFilters);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Valor máximo"
                      value={searchFilters.amountMax}
                      onChange={(e) => {
                        const newFilters = { ...searchFilters, amountMax: e.target.value };
                        setSearchFilters(newFilters);
                        applyFilters(newFilters);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Avançado */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                {/* Modo de busca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo de busca
                  </label>
                  <select
                    value={searchFilters.searchMode}
                    onChange={(e) => {
                      const newFilters = { ...searchFilters, searchMode: e.target.value };
                      setSearchFilters(newFilters);
                      applyFilters(newFilters);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {searchModes.map(mode => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label} - {mode.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Termos obrigatórios */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deve conter (separar por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="termo1, termo2, termo3"
                    value={searchFilters.includeTerms}
                    onChange={(e) => {
                      const newFilters = { ...searchFilters, includeTerms: e.target.value };
                      setSearchFilters(newFilters);
                      applyFilters(newFilters);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Termos excluídos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Não deve conter (separar por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="termo1, termo2, termo3"
                    value={searchFilters.excludeTerms}
                    onChange={(e) => {
                      const newFilters = { ...searchFilters, excludeTerms: e.target.value };
                      setSearchFilters(newFilters);
                      applyFilters(newFilters);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Opções */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={searchFilters.caseSensitive}
                      onChange={(e) => {
                        const newFilters = { ...searchFilters, caseSensitive: e.target.checked };
                        setSearchFilters(newFilters);
                        applyFilters(newFilters);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Diferenciar maiúsculas/minúsculas</span>
                  </label>
                </div>

                {/* Validação de regex */}
                {searchFilters.searchMode === 'regex' && searchTerm && (
                  <div className={`text-xs p-2 rounded ${
                    isValidRegex(searchTerm) 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {isValidRegex(searchTerm) ? '✓ Regex válida' : '✗ Regex inválida'}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Salvos */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                {/* Buscas salvas */}
                {savedSearches.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Buscas salvas</h4>
                    <div className="space-y-2">
                      {savedSearches.map(saved => (
                        <div key={saved.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <button
                            onClick={() => loadSavedSearch(saved)}
                            className="flex-1 text-left"
                          >
                            <div className="font-medium text-sm">{saved.name}</div>
                            <div className="text-xs text-gray-500">{saved.term}</div>
                          </button>
                          <button
                            onClick={() => deleteSavedSearch(saved.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buscas recentes */}
                {recentSearches.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Buscas recentes</h4>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map(recent => (
                        <button
                          key={recent.id}
                          onClick={() => loadSavedSearch(recent)}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <FaHistory className="text-gray-400" size={12} />
                            <span>{recent.term}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={saveCurrentSearch}
                disabled={!searchTerm.trim()}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm"
              >
                <FaSave size={12} />
                <span>Salvar busca</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  className="px-3 py-2 text-gray-600 hover:text-red-600 text-sm"
                >
                  Limpar tudo
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;