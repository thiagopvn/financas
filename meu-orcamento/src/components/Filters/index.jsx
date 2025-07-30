// src/components/Filters/index.jsx
import { useState } from 'react';
import { FaCalendarAlt, FaFilter, FaTimes } from 'react-icons/fa';
import { useData } from '../../context/DataContext';

const Filters = () => {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const {
    dateFilter,
    setDateFilter,
    categoryFilter,
    setCategoryFilter,
    getAllCategories
  } = useData();

  const dateOptions = [
    { value: 'all', label: 'Todas as transações' },
    { value: 'last30', label: 'Últimos 30 dias' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'lastMonth', label: 'Mês passado' },
  ];

  const categories = getAllCategories();

  const handleCategoryToggle = (category) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const clearCategoryFilter = () => {
    setCategoryFilter([]);
    setShowCategoryFilter(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Filtro de Data */}
      <div className="flex items-center space-x-2">
        <FaCalendarAlt className="text-gray-500" />
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {dateOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Categoria */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors duration-200 ${
            categoryFilter.length > 0
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FaFilter />
          <span>
            Categorias
            {categoryFilter.length > 0 && ` (${categoryFilter.length})`}
          </span>
        </button>

        {/* Dropdown de Categorias */}
        {showCategoryFilter && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Filtrar Categorias</h4>
                <button
                  onClick={() => setShowCategoryFilter(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2">
              {categories.map(category => (
                <label
                  key={category}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>

            {categoryFilter.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={clearCategoryFilter}
                  className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tags de categorias selecionadas */}
      {categoryFilter.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
            >
              {category}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="ml-2 hover:text-primary-900"
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filters;