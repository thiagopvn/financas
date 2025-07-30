import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiEdit2 } from 'react-icons/fi';
import CategoryEditor from '../CategoryEditor';

const TransactionsList = ({ transactions, title = "Transações" }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);

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
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{transactions.length} transações</p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate mr-4">
                      {transaction.description}
                    </h4>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                        {transaction.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(transaction.date, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar categoria"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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