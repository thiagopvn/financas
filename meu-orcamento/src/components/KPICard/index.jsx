// src/components/KPICard/index.jsx
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, format = 'currency' }) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (format === 'number') {
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatValue(value)}
          </p>
          
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <FaArrowUp className="text-red-500 mr-1" />
              ) : (
                <FaArrowDown className="text-green-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-red-600' : 'text-green-600'
              }`}>
                {trendValue}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="ml-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Icon className="text-primary-600 text-xl" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;