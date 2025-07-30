import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiSave, FiX } from 'react-icons/fi';

const CategoryEditor = ({ transaction, onClose, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState(transaction.category);
  const [loading, setLoading] = useState(false);

  const categories = [
    'Alimentação',
    'Mercado',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Serviços',
    'Casa',
    'Vestuário',
    'Eletrônicos',
    'Viagem',
    'Outros'
  ];

  const handleSave = async () => {
    if (selectedCategory === transaction.category) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const transactionRef = doc(db, 'transactions', transaction.id);
      await updateDoc(transactionRef, {
        category: selectedCategory,
        updatedAt: Timestamp.now()
      });
      
      onUpdate && onUpdate({ ...transaction, category: selectedCategory });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Editar Categoria</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Transação:</p>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-gray-500">R$ {transaction.amount.toFixed(2)}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <FiX className="mr-2" size={16} />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selectedCategory === transaction.category}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <FiSave className="mr-2" size={16} />
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryEditor;