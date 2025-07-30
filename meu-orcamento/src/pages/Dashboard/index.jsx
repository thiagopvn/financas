// src/pages/Dashboard/index.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMoneyBillWave, 
  FaChartPie, 
  FaCalendarAlt,
  FaCloudUploadAlt,
  FaLightbulb,
  FaCog
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useData } from '../../context/DataContext';
import KPICard from '../../components/KPICard';
import Filters from '../../components/Filters';
import TransactionsList from '../../components/TransactionsList';
import CategoryRulesManager from '../../components/CategoryRulesManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [showRulesManager, setShowRulesManager] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar', 'area'
  const { 
    loading, 
    getFilteredTransactions, 
    getStats, 
    getChartData 
  } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const transactions = getFilteredTransactions();
  const stats = getStats();
  const { categoryData, monthlyData, categoryMonthlyData } = getChartData();

  // Cores para os gráficos
  const COLORS = [
    '#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', 
    '#0369a1', '#075985', '#0c4a6e', '#e0f2fe',
    '#f59e0b', '#d97706', '#92400e', '#78350f'
  ];

  // Formatar dados para o gráfico de barras
  const barChartData = categoryData.slice(0, 10).map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  // Dados filtrados por categoria selecionada
  const filteredTransactions = selectedCategory 
    ? transactions.filter(t => t.category === selectedCategory)
    : transactions;

  // Handler para clique nas barras
  const handleBarClick = (data) => {
    setSelectedCategory(selectedCategory === data.name ? null : data.name);
  };

  // Projeção de gastos
  const calculateProjection = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    if (stats.total === 0 || currentDay === 0) return 0;
    
    return (stats.total / currentDay) * daysInMonth;
  };

  const projection = calculateProjection();

  // Dicas de economia
  const getEconomyTips = () => {
    const tips = [];
    
    // Dica sobre categoria com maior gasto
    if (stats.topCategory && stats.topCategory.amount > stats.total * 0.2) {
      tips.push({
        icon: FaChartPie,
        text: `Você gastou ${((stats.topCategory.amount / stats.total) * 100).toFixed(0)}% em ${stats.topCategory.name}. Considere reduzir gastos nesta categoria.`,
        type: 'warning'
      });
    }
    
    // Dica sobre projeção
    if (projection > stats.monthlyAverage * 1.2) {
      tips.push({
        icon: FaCalendarAlt,
        text: `Seus gastos este mês estão 20% acima da média. Tente economizar nos próximos dias.`,
        type: 'alert'
      });
    }
    
    // Dica genérica se não houver outras
    if (tips.length === 0) {
      tips.push({
        icon: FaLightbulb,
        text: `Acompanhe seus gastos regularmente para manter suas finanças sob controle.`,
        type: 'info'
      });
    }
    
    return tips;
  };

  const tips = getEconomyTips();

  if (transactions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <FaCloudUploadAlt className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma transação encontrada
          </h2>
          <p className="text-gray-600 mb-4">
            Faça upload de suas faturas para começar a visualizar seus gastos.
          </p>
          <Link to="/upload" className="btn-primary inline-flex items-center">
            <FaCloudUploadAlt className="mr-2" />
            Fazer Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Acompanhe seus gastos e mantenha suas finanças sob controle
            </p>
          </div>
          <button
            onClick={() => setShowRulesManager(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            title="Gerenciar regras de classificação"
          >
            <FaCog className="mr-2" />
            Regras
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Filters />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Gasto Total"
          value={stats.total}
          icon={FaMoneyBillWave}
          format="currency"
        />
        <KPICard
          title="Média Mensal"
          value={stats.monthlyAverage}
          icon={FaCalendarAlt}
          format="currency"
        />
        {stats.topCategory && (
          <KPICard
            title="Maior Categoria"
            value={stats.topCategory.amount}
            icon={FaChartPie}
            format="currency"
          />
        )}
        <KPICard
          title="Transações"
          value={stats.transactionCount}
          icon={FaMoneyBillWave}
          format="number"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Barras Interativo */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Gastos por Categoria
              {selectedCategory && (
                <span className="text-sm font-normal text-primary-600 ml-2">
                  (Filtrado: {selectedCategory})
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === 'bar' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Barras
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === 'area' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Área
              </button>
            </div>
          </div>
          
          {selectedCategory && (
            <div className="mb-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-red-600 hover:text-red-800 flex items-center"
              >
                ✕ Limpar filtro de categoria
              </button>
            </div>
          )}

          <ResponsiveContainer width="100%" height={350}>
            {chartType === 'bar' ? (
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  onClick={handleBarClick}
                  cursor="pointer"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            ) : (
              <AreaChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.6}
                  animationDuration={800}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linha Melhorado */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução dos Gastos Mensais
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gastos']}
                labelStyle={{ color: '#333' }}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Gastos"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#0ea5e9', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projeção e Dicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Projeção */}
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            Projeção para o Mês
          </h3>
          <p className="text-3xl font-bold text-primary-900">
            R$ {projection.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-primary-700 mt-2">
            Baseado nos gastos até hoje
          </p>
        </div>

        {/* Dicas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dicas de Economia
          </h3>
          <div className="space-y-3">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="flex items-start">
                  <Icon className={`mt-0.5 mr-3 flex-shrink-0 ${
                    tip.type === 'warning' ? 'text-yellow-500' :
                    tip.type === 'alert' ? 'text-red-500' :
                    'text-blue-500'
                  }`} />
                  <p className="text-sm text-gray-700">{tip.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Análise mensal da categoria selecionada */}
      {selectedCategory && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução Mensal - {selectedCategory}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={categoryMonthlyData.filter(d => d.category === selectedCategory)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Gastos'
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico adicional - Top 5 categorias com detalhamento */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Análise Detalhada das Principais Categorias
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {categoryData.slice(0, 5).map((category, index) => {
            const percentage = ((category.value / stats.total) * 100).toFixed(1);
            const avgPerTransaction = (category.value / category.count).toFixed(2);
            return (
              <div 
                key={category.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.name 
                    ? 'border-primary-500 bg-primary-50 shadow-lg' 
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-md'
                }`}
                onClick={() => handleBarClick(category)}
              >
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg transition-transform duration-200 hover:rotate-12"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {category.name.charAt(0)}
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {category.name}
                  </h4>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {percentage}% do total
                  </p>
                  <p className="text-xs text-blue-600">
                    {category.count} transações
                  </p>
                  <p className="text-xs text-green-600">
                    Média: R$ {avgPerTransaction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Transações com Editor de Categoria */}
      <TransactionsList 
        transactions={filteredTransactions.slice(0, 20)} 
        title={selectedCategory 
          ? `Transações da Categoria: ${selectedCategory}` 
          : "Transações Recentes"
        }
      />

      {/* Modal do Gerenciador de Regras */}
      {showRulesManager && (
        <CategoryRulesManager 
          onClose={() => setShowRulesManager(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;