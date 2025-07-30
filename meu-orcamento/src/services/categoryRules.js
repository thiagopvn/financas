// Regras de classificação de categorias
// Este arquivo contém as regras inteligentes para classificar transações automaticamente

export const defaultCategoryRules = {
  'Alimentação': [
    'restaurante', 'lanchonete', 'pizzaria', 'hamburger', 'mcdonalds', 'burger king',
    'subway', 'dominos', 'ifood', 'uber eats', 'rappi', 'delivery', 'padaria',
    'açougue', 'sorveteria', 'cafeteria', 'cafe', 'bar', 'pub', 'boteco',
    'food', 'eat', 'pizza', 'burger', 'hot dog', 'comida'
  ],
  'Mercado': [
    'supermercado', 'mercado', 'extra', 'carrefour', 'pao de acucar', 
    'walmart', 'big', 'assai', 'sam\'s club', 'atacadao', 'makro',
    'hipermercado', 'supermarket', 'grocery', 'feira'
  ],
  'Transporte': [
    'uber', 'taxi', '99', 'lyft', 'metro', 'onibus', 'trem', 'metrô',
    'bilhete unico', 'vlt', 'brt', 'cptm', 'combustivel', 'gasolina',
    'etanol', 'diesel', 'posto', 'ipiranga', 'shell', 'br', 'petrobras',
    'transport', 'gas station', 'fuel', 'parking', 'estacionamento'
  ],
  'Saúde': [
    'farmacia', 'drogaria', 'droga', 'medico', 'hospital', 'clinica',
    'laboratorio', 'exame', 'consulta', 'dentista', 'oculista',
    'pharmacy', 'medicine', 'health', 'dental', 'vision', 'saude'
  ],
  'Educação': [
    'escola', 'faculdade', 'universidade', 'curso', 'livro', 'livraria',
    'material escolar', 'papelaria', 'education', 'university', 'school',
    'book', 'study', 'biblioteca'
  ],
  'Lazer': [
    'cinema', 'teatro', 'show', 'ingresso', 'netflix', 'spotify',
    'amazon prime', 'disney plus', 'youtube', 'streaming', 'games',
    'steam', 'playstation', 'xbox', 'nintendo', 'entretenimento',
    'entertainment', 'movie', 'music', 'game'
  ],
  'Serviços': [
    'banco', 'tarifa', 'anuidade', 'taxa', 'cartorio', 'correios',
    'servico', 'manutencao', 'reparo', 'service', 'maintenance',
    'repair', 'fee', 'charge'
  ],
  'Casa': [
    'casa', 'lar', 'construcao', 'reforma', 'mobilia', 'decoracao',
    'eletrodomestico', 'home', 'house', 'furniture', 'appliance',
    'decoration', 'cleaning', 'limpeza', 'supermercado material'
  ],
  'Vestuário': [
    'roupas', 'roupa', 'vestuario', 'sapato', 'tenis', 'calcado',
    'clothing', 'shoes', 'fashion', 'moda', 'loja', 'magazine',
    'zara', 'h&m', 'nike', 'adidas'
  ],
  'Eletrônicos': [
    'eletronicos', 'smartphone', 'celular', 'computador', 'notebook',
    'tablet', 'tv', 'electronics', 'tech', 'technology', 'apple',
    'samsung', 'lg', 'sony'
  ],
  'Viagem': [
    'hotel', 'pousada', 'passagem', 'aviao', 'voo', 'viagem',
    'travel', 'flight', 'airline', 'booking', 'airbnb', 'hospedagem'
  ]
};

// Função para carregar regras personalizadas do localStorage
export const loadCustomRules = () => {
  try {
    const stored = localStorage.getItem('customCategoryRules');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar regras personalizadas:', error);
  }
  return null;
};

// Função para salvar regras personalizadas no localStorage
export const saveCustomRules = (rules) => {
  try {
    localStorage.setItem('customCategoryRules', JSON.stringify(rules));
    return true;
  } catch (error) {
    console.error('Erro ao salvar regras personalizadas:', error);
    return false;
  }
};

// Função para obter as regras ativas (personalizadas ou padrão)
export const getActiveRules = () => {
  const customRules = loadCustomRules();
  return customRules || defaultCategoryRules;
};

// Função principal de classificação
export const classifyCategory = (title) => {
  const titleLower = title.toLowerCase();
  const rules = getActiveRules();
  
  // Verificar cada categoria
  for (const [category, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Se não encontrar nenhuma categoria, retornar 'Outros'
  return 'Outros';
};

// Função para resetar para regras padrão
export const resetToDefaultRules = () => {
  try {
    localStorage.removeItem('customCategoryRules');
    return true;
  } catch (error) {
    console.error('Erro ao resetar regras:', error);
    return false;
  }
};

// Função para exportar regras como JSON
export const exportRules = () => {
  const rules = getActiveRules();
  const dataStr = JSON.stringify(rules, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'regras-categoria.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função para importar regras de um arquivo JSON
export const importRules = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rules = JSON.parse(e.target.result);
        if (saveCustomRules(rules)) {
          resolve(rules);
        } else {
          reject(new Error('Erro ao salvar regras importadas'));
        }
      } catch (error) {
        reject(new Error('Arquivo JSON inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
};