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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
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
  const { categoryData, monthlyData } = getChartData();

  // Cores para o gráfico de pizza
  const COLORS = [
    '#0ea5e9', // primary-500
    '#38bdf8', // primary-400
    '#7dd3fc', // primary-300
    '#0284c7', // primary-600
    '#0369a1', // primary-700
    '#075985', // primary-800
    '#0c4a6e', // primary-900
    '#e0f2fe', // primary-100
  ];

  // Formatar dados para o gráfico de pizza
  const pieChartData = categoryData.slice(0, 8); // Limitar a 8 categorias

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
        {/* Gráfico de Pizza */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gastos por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linha */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução dos Gastos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Gastos"
                stroke="#0ea5e9"
                strokeWidth={2}
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

      {/* Lista de Transações com Editor de Categoria */}
      <TransactionsList 
        transactions={transactions.slice(0, 20)} 
        title="Transações Recentes"
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