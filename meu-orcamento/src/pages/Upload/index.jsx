// src/pages/Upload/index.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FaCloudUploadAlt, 
  FaFileCsv, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaSpinner 
} from 'react-icons/fa';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { parseNubankCSV, validateCSVFile } from '../../services/csvParser';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      validateCSVFile(file);
      setFile(file);
      setError('');
      setUploadStatus(null);
      
      // Processar o arquivo
      await processFile(file);
    } catch (error) {
      setError(error.message);
      setFile(null);
    }
  }, []);

  const processFile = async (file) => {
    setIsProcessing(true);
    setError('');

    try {
      // Parse do CSV
      const parsedTransactions = await parseNubankCSV(file);
      setTransactions(parsedTransactions);
      setUploadStatus('parsed');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setError('Erro ao processar arquivo. Verifique se o formato está correto.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTransactions = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const batch = [];
      
      // Preparar todas as transações para salvar
      for (const transaction of transactions) {
        const docData = {
          userId: user.uid,
          date: Timestamp.fromDate(transaction.date),
          category: transaction.category,
          description: transaction.description,
          amount: transaction.amount,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        batch.push(addDoc(collection(db, 'transactions'), docData));
      }

      // Salvar todas as transações
      await Promise.all(batch);
      
      setUploadStatus('success');
      
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
      setError('Erro ao salvar transações no banco de dados.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const renderUploadArea = () => {
    if (uploadStatus === 'success') {
      return (
        <div className="text-center py-12">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload realizado com sucesso!
          </h3>
          <p className="text-gray-600">
            {transactions.length} transações foram importadas.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Redirecionando para o dashboard...
          </p>
        </div>
      );
    }

    if (file && transactions.length > 0 && uploadStatus === 'parsed') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaFileCsv className="text-3xl text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {transactions.length} transações encontradas
                </p>
              </div>
            </div>
          </div>

          {/* Preview das transações */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Preview das transações</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Descrição
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {transaction.date.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {transaction.category}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        R$ {transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-600">
                  ... e mais {transactions.length - 10} transações
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setFile(null);
                setTransactions([]);
                setUploadStatus(null);
              }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={saveTransactions}
              disabled={isProcessing}
              className="btn-primary flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Confirmar e Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive
            ? 'Solte o arquivo aqui'
            : 'Arraste um arquivo CSV ou clique para selecionar'}
        </h3>
        <p className="text-gray-600 mb-4">
          Formatos aceitos: CSV do Nubank
        </p>
        <button type="button" className="btn-primary">
          Selecionar Arquivo
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload de Faturas</h1>
        <p className="text-gray-600 mt-2">
          Importe suas faturas do Nubank em formato CSV
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <FaExclamationCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Erro</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {isProcessing && !uploadStatus && (
          <div className="text-center py-12">
            <FaSpinner className="text-4xl text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Processando arquivo...</p>
          </div>
        )}

        {!isProcessing && renderUploadArea()}
      </div>

      {/* Instruções */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Como exportar do Nubank:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Acesse sua conta Nubank no computador</li>
          <li>Vá até a seção de faturas do cartão</li>
          <li>Selecione o período desejado</li>
          <li>Clique em "Exportar" e escolha o formato CSV</li>
          <li>Faça o upload do arquivo aqui</li>
        </ol>
      </div>
    </div>
  );
};

export default Upload;