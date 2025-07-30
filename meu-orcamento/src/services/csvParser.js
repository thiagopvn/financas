// src/services/csvParser.js
import Papa from 'papaparse';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { classifyCategory } from './categoryRules';

/**
 * Parse do CSV do Nubank
 * Esperamos as colunas: date, title, amount (categoria será classificada automaticamente)
 */
export const parseNubankCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const transactions = processNubankData(results.data);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Processa os dados do Nubank
 */
const processNubankData = (data) => {
  return data
    .filter(row => row.date && row.amount) // Filtrar linhas vazias
    .map(row => {
      // Parse da data (formato: YYYY-MM-DD)
      const parsedDate = parse(row.date, 'yyyy-MM-dd', new Date());
      
      // Limpar e converter o valor
      let amount = row.amount;
      if (typeof amount === 'string') {
        // Remove símbolos de moeda e converte vírgula para ponto
        amount = parseFloat(
          amount
            .replace(/[R$\s]/g, '')
            .replace(',', '.')
        );
      }
      
      return {
        date: parsedDate,
        category: classifyCategory(row.title || 'Sem descrição'),
        description: row.title || 'Sem descrição',
        amount: Math.abs(amount), // Sempre positivo para despesas
        originalData: row // Manter dados originais para referência
      };
    })
    .filter(transaction => !isNaN(transaction.amount)); // Filtrar transações inválidas
};


/**
 * Valida se o arquivo é um CSV válido
 */
export const validateCSVFile = (file) => {
  const validTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (!validTypes.includes(file.type) && fileExtension !== 'csv') {
    throw new Error('Por favor, selecione um arquivo CSV válido');
  }
  
  // Limitar tamanho do arquivo (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('O arquivo é muito grande. Tamanho máximo: 5MB');
  }
  
  return true;
};

/**
 * Agrupa transações por categoria
 */
export const groupTransactionsByCategory = (transactions) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = {
        category,
        total: 0,
        count: 0,
        transactions: []
      };
    }
    acc[category].total += transaction.amount;
    acc[category].count += 1;
    acc[category].transactions.push(transaction);
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a, b) => b.total - a.total);
};

/**
 * Agrupa transações por mês
 */
export const groupTransactionsByMonth = (transactions) => {
  const grouped = transactions.reduce((acc, transaction) => {
    const monthKey = format(transaction.date, 'yyyy-MM');
    const monthLabel = format(transaction.date, 'MMM yyyy', { locale: ptBR });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        label: monthLabel,
        total: 0,
        count: 0,
        transactions: []
      };
    }
    
    acc[monthKey].total += transaction.amount;
    acc[monthKey].count += 1;
    acc[monthKey].transactions.push(transaction);
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
};