// src/context/DataContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';

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
  const [dateFilter, setDateFilter] = useState('thisMonth');
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  const [categoryFilter, setCategoryFilter] = useState([]);
  const { user } = useAuth();

  // Calcular range de datas baseado no filtro
  const getDateRange = () => {
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
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { start, end };
  };

  // Buscar transações do Firestore
  useEffect(() => {
    console.log('DataContext useEffect executado, user:', user);
    if (!user) {
      console.log('Usuário não autenticado, não carregando transações');
      return;
    }

    console.log('Iniciando carregamento de transações para userId:', user.uid);
    setLoading(true);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot recebido:', snapshot.size, 'documentos');
      
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Documento:', doc.id, data);
        
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date) // Converter Timestamp para Date
        };
      });
      
      console.log('Transações processadas:', transactionsData.length);
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
    
    // Filtro de categoria
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(t => 
        categoryFilter.includes(t.category)
      );
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
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);
    
    // Dados por mês (para gráfico de linha)
    const monthlyData = filtered.reduce((acc, t) => {
      const monthKey = format(t.date, 'MMM yyyy');
      const existing = acc.find(item => item.month === monthKey);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ 
          month: monthKey, 
          amount: t.amount,
          date: t.date 
        });
      }
      return acc;
    }, []);
    
    // Ordenar por data
    monthlyData.sort((a, b) => a.date - b.date);
    
    return {
      categoryData: categoryData.sort((a, b) => b.value - a.value),
      monthlyData: monthlyData.map(({ month, amount }) => ({ month, amount }))
    };
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
    getFilteredTransactions,
    getAllCategories,
    getStats,
    getChartData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};