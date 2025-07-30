import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiEdit2, FiTrash2, FiFilter, FiDownload, FiEye } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import CategoryEditor from '../CategoryEditor';

const TransactionsList = ({ transactions, title = "Transações", showActions = true, enableDelete = true, onDeleteTransaction }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Alimentação': 'bg-orange-100 text-orange-800',
      'Mercado': 'bg-green-100 text-green-800',
      'Transporte': 'bg-blue-100 text-blue-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Educação': 'bg-purple-100 text-purple-800',
      'Lazer': 'bg-pink-100 text-pink-800',
      'Serviços': 'bg-yellow-100 text-yellow-800',
      'Casa': 'bg-indigo-100 text-indigo-800',
      'Vestuário': 'bg-cyan-100 text-cyan-800',
      'Eletrônicos': 'bg-gray-100 text-gray-800',
      'Viagem': 'bg-teal-100 text-teal-800',
      'Outros': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Funções de ordenação e filtragem
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  // Filtrar e ordenar transações
  const filteredAndSortedTransactions = transactions
    .filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'date') {
        aVal = new Date(a.date);
        bVal = new Date(b.date);
      } else if (sortField === 'amount') {
        aVal = parseFloat(a.amount);
        bVal = parseFloat(b.amount);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Seleção de transações
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (transactionId, checked) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    }
  };

  // Ações em lote
  const handleBulkDelete = () => {
    if (selectedTransactions.length === 0) return;
    
    if (confirm(`Deseja realmente excluir ${selectedTransactions.length} transação(ões) selecionada(s)?`)) {
      selectedTransactions.forEach(transactionId => {
        onDeleteTransaction && onDeleteTransaction(transactionId);
      });
      setSelectedTransactions([]);
    }
  };

  // Exportar dados
  const handleExportCSV = () => {
    const dataToExport = selectedTransactions.length > 0 
      ? filteredAndSortedTransactions.filter(t => selectedTransactions.includes(t.id))
      : filteredAndSortedTransactions;
    
    const csvContent = [
      ['Data', 'Descrição', 'Categoria', 'Valor'],
      ...dataToExport.map(t => [
        format(t.date, 'dd/MM/yyyy'),
        t.description,
        t.category,
        t.amount.toFixed(2).replace('.', ',')
      ])
    ].map(row => row.join(';')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-500 text-center">Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cabeçalho com controles */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">
                {filteredAndSortedTransactions.length} de {transactions.length} transações
                {selectedTransactions.length > 0 && ` (${selectedTransactions.length} selecionadas)`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Busca */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <FiFilter className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>
              
              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  title="Exportar para CSV"
                >
                  <FiDownload size={16} className="mr-1" />
                  Exportar
                </button>
                
                {selectedTransactions.length > 0 && enableDelete && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    title="Excluir selecionadas"
                  >
                    <FiTrash2 size={16} className="mr-1" />
                    Excluir ({selectedTransactions.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Data</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Descrição</span>
                    {getSortIcon('description')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Categoria</span>
                    {getSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Valor</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={(e) => handleSelectTransaction(transaction.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(transaction.date, 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(transaction.amount)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar categoria"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        {enableDelete && onDeleteTransaction && (
                          <button
                            onClick={() => {
                              if (confirm('Deseja realmente excluir esta transação?')) {
                                onDeleteTransaction(transaction.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Excluir transação"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedTransactions.length)} de {filteredAndSortedTransactions.length}
                </span>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 text-sm border rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingTransaction && (
        <CategoryEditor
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onUpdate={(updatedTransaction) => {
            // O componente pai pode implementar uma função para atualizar a lista
            console.log('Transação atualizada:', updatedTransaction);
          }}
        />
      )}
    </>
  );
};

export default TransactionsList;