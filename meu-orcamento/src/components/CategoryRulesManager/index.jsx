import { useState, useEffect } from 'react';
import { FiDownload, FiUpload, FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi';
import { 
  getActiveRules, 
  saveCustomRules, 
  resetToDefaultRules, 
  exportRules, 
  importRules 
} from '../../services/categoryRules';

const CategoryRulesManager = ({ onClose }) => {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    setRules(getActiveRules());
  }, []);

  const handleSaveRules = async () => {
    setLoading(true);
    try {
      if (saveCustomRules(rules)) {
        alert('Regras salvas com sucesso!');
      } else {
        alert('Erro ao salvar regras');
      }
    } catch (error) {
      alert('Erro ao salvar regras: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRules = () => {
    if (confirm('Tem certeza que deseja resetar para as regras padrão? Isso irá apagar todas as personalizações.')) {
      resetToDefaultRules();
      setRules(getActiveRules());
    }
  };

  const handleImportRules = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      importRules(file)
        .then((importedRules) => {
          setRules(importedRules);
          alert('Regras importadas com sucesso!');
        })
        .catch((error) => {
          alert('Erro ao importar regras: ' + error.message);
        })
        .finally(() => {
          setLoading(false);
          event.target.value = '';
        });
    }
  };

  const addKeyword = (category) => {
    if (newKeyword.trim()) {
      setRules(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), newKeyword.trim().toLowerCase()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (category, keyword) => {
    setRules(prev => ({
      ...prev,
      [category]: prev[category].filter(k => k !== keyword)
    }));
  };

  const categories = Object.keys(rules).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gerenciar Regras de Classificação</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Configure as palavras-chave que determinam como as transações são classificadas automaticamente.
          </p>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveRules}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FiDownload className="mr-2" size={16} />
              Salvar Regras
            </button>
            
            <button
              onClick={exportRules}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FiDownload className="mr-2" size={16} />
              Exportar
            </button>
            
            <label className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer">
              <FiUpload className="mr-2" size={16} />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={handleImportRules}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleResetRules}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <FiRefreshCw className="mr-2" size={16} />
              Resetar
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div className="grid gap-6">
            {categories.map(category => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{category}</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {rules[category]?.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(category, keyword)}
                        className="ml-2 text-blue-600 hover:text-red-600"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {editingCategory === category ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Nova palavra-chave..."
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addKeyword(category);
                          setEditingCategory(null);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        addKeyword(category);
                        setEditingCategory(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setNewKeyword('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="flex items-center px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    <FiPlus className="mr-2" size={16} />
                    Adicionar palavra-chave
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Dica:</strong> As palavras-chave são verificadas no título das transações (não diferencia maiúsculas/minúsculas).
            </p>
            <p>
              Por exemplo, uma transação com título "IFOOD RESTAURANTE" será classificada como "Alimentação" 
              porque contém a palavra-chave "ifood".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRulesManager;