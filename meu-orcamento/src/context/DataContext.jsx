// src/context/DataContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { advancedSearchService } from '../services/advancedSearch';

const DataContext = createContext({});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [advancedSearch, setAdvancedSearch] = useState(null);
  const [advancedDateRange, setAdvancedDateRange] = useState({ start: null, end: null });
  const { user } = useAuth();

  // Calcular range de datas baseado no filtro
  const getDateRange = () => {
    // Priorizar filtro avançado de datas
    if (advancedDateRange.start && advancedDateRange.end) {
      return { start: advancedDateRange.start, end: advancedDateRange.end };
    }

    const now = new Date();
    let start, end;

    switch (dateFilter) {
      case 'last30':
        start = subDays(now, 30);
        end = now;
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(now), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'custom':
        start = customDateRange.start;
        end = customDateRange.end;
        break;
      case 'all':
        start = null;
        end = null;
        break;
      default:
        start = null;
        end = null;
    }

    return { start, end };
  };

  // Buscar transações do Firestore
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date) // Converter Timestamp para Date
        };
      });
      
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
      // Ignorar erros QUIC que são comuns e temporários
      if (error.message && error.message.includes('QUIC_PROTOCOL_ERROR')) {
        console.warn('Erro QUIC temporário - continuando operação normalmente');
        return;
      }
      console.error('Erro ao buscar transações:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtrar transações baseado nos filtros ativos
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    // Filtro de data
    const { start, end } = getDateRange();
    if (start && end) {
      filtered = filtered.filter(t => 
        t.date >= start && t.date <= end
      );
    }
    
    // Filtro de categoria (tradicional - mantido para compatibilidade)
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(t => 
        categoryFilter.includes(t.category)
      );
    }
    
    // Aplicar busca avançada
    if (advancedSearch) {
      filtered = advancedSearchService.filterTransactions(filtered, advancedSearch);
      // Ordenar por relevância se houver termo de busca
      if (advancedSearch.term) {
        filtered = advancedSearchService.sortByRelevance(filtered, advancedSearch);
      }
    }
    
    return filtered;
  };

  // Obter todas as categorias únicas
  const getAllCategories = () => {
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories).sort();
  };

  // Calcular estatísticas
  const getStats = () => {
    const filtered = getFilteredTransactions();
    
    // Total gasto
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    
    // Média mensal (considerando o período filtrado)
    const { start, end } = getDateRange();
    let monthlyAverage = total;
    if (start && end) {
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      monthlyAverage = (total / days) * 30;
    }
    
    // Categoria com maior gasto
    const categoryTotals = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      total,
      monthlyAverage,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      transactionCount: filtered.length
    };
  };

  // Dados para gráficos
  const getChartData = () => {
    const filtered = getFilteredTransactions();
    
    // Dados por categoria (para gráfico de pizza)
    const categoryData = filtered.reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
        existing.count += 1;
      } else {
        acc.push({ name: t.category, value: t.amount, count: 1 });
      }
      return acc;
    }, []);
    
    // Dados por mês (para gráfico de linha)
    const monthlyData = filtered.reduce((acc, t) => {
      const monthKey = format(t.date, 'MMM yyyy');
      const existing = acc.find(item => item.month === monthKey);
      if (existing) {
        existing.amount += t.amount;
        existing.transactions += 1;
      } else {
        acc.push({ 
          month: monthKey, 
          amount: t.amount,
          transactions: 1,
          date: t.date 
        });
      }
      return acc;
    }, []);
    
    // Dados por categoria e mês (para análise detalhada)
    const categoryMonthlyData = filtered.reduce((acc, t) => {
      const monthKey = format(t.date, 'MMM yyyy');
      const key = `${t.category}-${monthKey}`;
      
      if (acc[key]) {
        acc[key].amount += t.amount;
        acc[key].count += 1;
      } else {
        acc[key] = {
          category: t.category,
          month: monthKey,
          amount: t.amount,
          count: 1,
          date: t.date
        };
      }
      return acc;
    }, {});
    
    // Ordenar por data
    monthlyData.sort((a, b) => a.date - b.date);
    
    return {
      categoryData: categoryData.sort((a, b) => b.value - a.value),
      monthlyData: monthlyData.map(({ month, amount, transactions }) => ({ month, amount, transactions })),
      categoryMonthlyData: Object.values(categoryMonthlyData).sort((a, b) => a.date - b.date)
    };
  };

  // Função para deletar transação
  const deleteTransaction = async (transactionId) => {
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return false;
    }
  };

  const value = {
    transactions,
    loading,
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    categoryFilter,
    setCategoryFilter,
    advancedSearch,
    setAdvancedSearch,
    advancedDateRange,
    setAdvancedDateRange,
    getFilteredTransactions,
    getAllCategories,
    getStats,
    getChartData,
    deleteTransaction
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};