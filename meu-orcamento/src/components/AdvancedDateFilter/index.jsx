import { useState, useRef, useEffect } from 'react';
import { format, startOfDay, endOfDay, isValid, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCalendarAlt, FaTimes, FaCheck, FaChevronDown, FaHistory, FaFilter } from 'react-icons/fa';

const AdvancedDateFilter = ({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  onClear,
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [tempStartDate, setTempStartDate] = useState(startDate ? format(startDate, 'yyyy-MM-dd') : '');
  const [tempEndDate, setTempEndDate] = useState(endDate ? format(endDate, 'yyyy-MM-dd') : '');
  const [quickFilters, setQuickFilters] = useState([]);
  const dropdownRef = useRef(null);

  // Presets de data
  const datePresets = [
    { id: 'today', label: 'Hoje', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
    { id: 'yesterday', label: 'Ontem', getValue: () => { 
      const yesterday = subDays(new Date(), 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }},
    { id: 'last7days', label: 'Últimos 7 dias', getValue: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }) },
    { id: 'last15days', label: 'Últimos 15 dias', getValue: () => ({ start: startOfDay(subDays(new Date(), 14)), end: endOfDay(new Date()) }) },
    { id: 'last30days', label: 'Últimos 30 dias', getValue: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }) },
    { id: 'thisWeek', label: 'Esta semana', getValue: () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = subDays(now, dayOfWeek === 0 ? 6 : dayOfWeek - 1);
      return { start: startOfDay(startOfWeek), end: endOfDay(now) };
    }},
    { id: 'thisMonth', label: 'Este mês', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { id: 'lastMonth', label: 'Mês passado', getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }},
    { id: 'thisQuarter', label: 'Este trimestre', getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startMonth = quarter * 3;
      return { 
        start: startOfMonth(new Date(now.getFullYear(), startMonth, 1)), 
        end: endOfMonth(new Date(now.getFullYear(), startMonth + 2, 1)) 
      };
    }},
    { id: 'thisYear', label: 'Este ano', getValue: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
    { id: 'lastYear', label: 'Ano passado', getValue: () => {
      const lastYear = subYears(new Date(), 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    }},
    { id: 'custom', label: 'Período personalizado', getValue: null }
  ];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('dateFilters');
    if (savedFilters) {
      try {
        setQuickFilters(JSON.parse(savedFilters));
      } catch (error) {
        console.error('Erro ao carregar filtros salvos:', error);
      }
    }
  }, []);

  // Determinar preset ativo
  useEffect(() => {
    if (!startDate || !endDate) {
      setSelectedPreset('custom');
      return;
    }

    const activePreset = datePresets.find(preset => {
      if (!preset.getValue) return false;
      const { start, end } = preset.getValue();
      return Math.abs(startDate.getTime() - start.getTime()) < 60000 && 
             Math.abs(endDate.getTime() - end.getTime()) < 60000;
    });

    setSelectedPreset(activePreset ? activePreset.id : 'custom');
  }, [startDate, endDate]);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    if (preset.getValue) {
      const { start, end } = preset.getValue();
      onDateRangeChange(start, end);
      setTempStartDate(format(start, 'yyyy-MM-dd'));
      setTempEndDate(format(end, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const handleCustomDateApply = () => {
    if (!tempStartDate || !tempEndDate) return;

    try {
      const start = startOfDay(parseISO(tempStartDate));
      const end = endOfDay(parseISO(tempEndDate));

      if (!isValid(start) || !isValid(end)) {
        alert('Por favor, insira datas válidas');
        return;
      }

      if (start > end) {
        alert('A data inicial deve ser anterior à data final');
        return;
      }

      onDateRangeChange(start, end);
      setSelectedPreset('custom');
      setIsOpen(false);
    } catch (error) {
      alert('Erro ao processar as datas. Verifique o formato.');
    }
  };

  const saveCurrentFilter = () => {
    if (!startDate || !endDate) return;

    const filterName = prompt('Nome para este filtro:');
    if (!filterName) return;

    const newFilter = {
      id: Date.now().toString(),
      name: filterName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: new Date().toISOString()
    };

    const updatedFilters = [...quickFilters, newFilter];
    setQuickFilters(updatedFilters);
    localStorage.setItem('dateFilters', JSON.stringify(updatedFilters));
  };

  const loadSavedFilter = (filter) => {
    const start = startOfDay(new Date(filter.startDate));
    const end = endOfDay(new Date(filter.endDate));
    onDateRangeChange(start, end);
    setTempStartDate(format(start, 'yyyy-MM-dd'));
    setTempEndDate(format(end, 'yyyy-MM-dd'));
    setSelectedPreset('custom');
    setIsOpen(false);
  };

  const deleteSavedFilter = (filterId) => {
    const updatedFilters = quickFilters.filter(f => f.id !== filterId);
    setQuickFilters(updatedFilters);
    localStorage.setItem('dateFilters', JSON.stringify(updatedFilters));
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Selecionar período';

    const start = format(startDate, 'dd/MM/yyyy', { locale: ptBR });
    const end = format(endDate, 'dd/MM/yyyy', { locale: ptBR });

    if (start === end) {
      return start;
    }

    // Verificar se é um preset conhecido
    const activePreset = datePresets.find(p => p.id === selectedPreset);
    if (activePreset && activePreset.id !== 'custom') {
      return activePreset.label;
    }

    return `${start} - ${end}`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 min-w-[200px] justify-between ${
          startDate && endDate
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 hover:border-gray-400 text-gray-700'
        }`}
      >
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-sm" />
          <span className="text-sm font-medium">{formatDateRange()}</span>
        </div>
        <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Presets rápidos */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Períodos rápidos</h4>
            <div className="grid grid-cols-2 gap-2">
              {datePresets.filter(p => p.id !== 'custom').map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Período personalizado */}
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Período personalizado</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data final
                  </label>
                  <input
                    type="date"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomDateApply}
                  disabled={!tempStartDate || !tempEndDate}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <FaCheck size={12} />
                  <span>Aplicar</span>
                </button>
                {(startDate || endDate) && (
                  <button
                    onClick={saveCurrentFilter}
                    className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    title="Salvar este filtro"
                  >
                    <FaHistory size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtros salvos */}
          {quickFilters.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Filtros salvos</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {quickFilters.map(filter => (
                  <div key={filter.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <button
                      onClick={() => loadSavedFilter(filter)}
                      className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(filter.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Excluir filtro"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="p-4">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  onClear();
                  setTempStartDate('');
                  setTempEndDate('');
                  setSelectedPreset('custom');
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 text-sm"
              >
                <FaTimes size={12} />
                <span>Limpar</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDateFilter;