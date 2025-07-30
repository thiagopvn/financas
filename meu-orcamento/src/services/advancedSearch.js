// Serviço para busca avançada e complexa de transações

export class AdvancedSearchService {
  constructor() {
    this.stopWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'a', 'o', 'as', 'os', 'em', 'no', 'na', 'nos', 'nas'];
  }

  /**
   * Busca fuzzy - permite pequenos erros de digitação
   */
  fuzzyMatch(text, pattern, threshold = 0.8) {
    if (!text || !pattern) return false;
    
    const textLower = text.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // Distância de Levenshtein simplificada
    const distance = this.levenshteinDistance(textLower, patternLower);
    const maxLength = Math.max(textLower.length, patternLower.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity >= threshold;
  }

  /**
   * Calcula distância de Levenshtein entre duas strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Busca por soundex (busca fonética)
   */
  soundex(text) {
    if (!text) return '';
    
    const soundexMap = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    };
    
    let soundexCode = text.charAt(0).toUpperCase();
    let previousCode = soundexMap[text.charAt(0).toLowerCase()] || '';
    
    for (let i = 1; i < text.length && soundexCode.length < 4; i++) {
      const char = text.charAt(i).toLowerCase();
      const code = soundexMap[char] || '';
      
      if (code && code !== previousCode) {
        soundexCode += code;
        previousCode = code;
      } else if (!soundexMap[char]) {
        previousCode = '';
      }
    }
    
    return soundexCode.padEnd(4, '0');
  }

  /**
   * Normaliza texto removendo acentos e caracteres especiais
   */
  normalizeText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Extrai termos relevantes do texto
   */
  extractTerms(text) {
    if (!text) return [];
    
    const normalized = this.normalizeText(text);
    const terms = normalized.split(/\s+/).filter(term => 
      term.length > 2 && !this.stopWords.includes(term)
    );
    
    return [...new Set(terms)]; // Remove duplicatas
  }

  /**
   * Verifica se um texto corresponde aos critérios de busca
   */
  matchesSearch(text, searchConfig) {
    if (!text || !searchConfig.term) return true;
    
    const { term, mode, caseSensitive, filters } = searchConfig;
    
    let searchText = caseSensitive ? text : text.toLowerCase();
    let searchTerm = caseSensitive ? term : term.toLowerCase();
    
    // Aplicar normalização se não for case sensitive
    if (!caseSensitive) {
      searchText = this.normalizeText(searchText);
      searchTerm = this.normalizeText(searchTerm);
    }
    
    switch (mode) {
      case 'exact':
        return searchText === searchTerm;
      
      case 'starts':
        return searchText.startsWith(searchTerm);
      
      case 'ends':
        return searchText.endsWith(searchTerm);
      
      case 'regex':
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(term, flags);
          return regex.test(text);
        } catch (e) {
          return false;
        }
      
      case 'fuzzy':
        return this.fuzzyMatch(searchText, searchTerm);
      
      case 'contains':
      default:
        return searchText.includes(searchTerm);
    }
  }

  /**
   * Verifica termos obrigatórios e excluídos
   */
  checkTerms(text, includeTerms, excludeTerms, caseSensitive = false) {
    const normalizedText = caseSensitive ? text : this.normalizeText(text);
    
    // Verificar termos obrigatórios
    if (includeTerms) {
      const required = includeTerms.split(',').map(t => t.trim()).filter(t => t);
      for (const term of required) {
        const normalizedTerm = caseSensitive ? term : this.normalizeText(term);
        if (!normalizedText.includes(normalizedTerm)) {
          return false;
        }
      }
    }
    
    // Verificar termos excluídos
    if (excludeTerms) {
      const excluded = excludeTerms.split(',').map(t => t.trim()).filter(t => t);
      for (const term of excluded) {
        const normalizedTerm = caseSensitive ? term : this.normalizeText(term);
        if (normalizedText.includes(normalizedTerm)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Filtra transações baseado na configuração de busca avançada
   */
  filterTransactions(transactions, searchConfig) {
    if (!transactions?.length) return [];
    
    const { term, filters } = searchConfig;
    
    return transactions.filter(transaction => {
      // Busca no texto principal
      if (term) {
        const searchableText = `${transaction.description} ${transaction.category}`.toLowerCase();
        if (!this.matchesSearch(searchableText, searchConfig)) {
          return false;
        }
      }
      
      // Filtro por categorias
      if (filters.categories?.length > 0) {
        if (!filters.categories.includes(transaction.category)) {
          return false;
        }
      }
      
      // Filtro por faixa de valores
      if (filters.amountMin !== '' && parseFloat(transaction.amount) < parseFloat(filters.amountMin)) {
        return false;
      }
      
      if (filters.amountMax !== '' && parseFloat(transaction.amount) > parseFloat(filters.amountMax)) {
        return false;
      }
      
      // Verificar termos obrigatórios e excluídos
      const searchableText = `${transaction.description} ${transaction.category}`;
      if (!this.checkTerms(searchableText, filters.includeTerms, filters.excludeTerms, filters.caseSensitive)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Ordena resultados por relevância
   */
  sortByRelevance(transactions, searchConfig) {
    if (!searchConfig.term || !transactions?.length) return transactions;
    
    const term = searchConfig.caseSensitive ? searchConfig.term : searchConfig.term.toLowerCase();
    
    return transactions.map(transaction => {
      let relevanceScore = 0;
      const description = searchConfig.caseSensitive ? 
        transaction.description : transaction.description.toLowerCase();
      const category = searchConfig.caseSensitive ? 
        transaction.category : transaction.category.toLowerCase();
      
      // Pontuação por correspondência exata
      if (description.includes(term)) relevanceScore += 10;
      if (category.includes(term)) relevanceScore += 8;
      
      // Pontuação por posição no texto
      const descIndex = description.indexOf(term);
      if (descIndex === 0) relevanceScore += 5; // Início da descrição
      else if (descIndex > 0) relevanceScore += 2; // Meio da descrição
      
      // Pontuação por comprimento da correspondência
      const matchRatio = term.length / description.length;
      relevanceScore += matchRatio * 3;
      
      return { ...transaction, relevanceScore };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Destaca termos encontrados no texto
   */
  highlightMatches(text, searchTerm, caseSensitive = false) {
    if (!text || !searchTerm) return text;
    
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, flags);
    
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }

  /**
   * Escapa caracteres especiais para uso em regex
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Gera sugestões de busca baseadas no histórico
   */
  generateSuggestions(query, searchHistory) {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set();
    const queryLower = query.toLowerCase();
    
    // Sugestões do histórico
    searchHistory.forEach(item => {
      if (item.term.toLowerCase().includes(queryLower)) {
        suggestions.add(item.term);
      }
    });
    
    // Sugestões de auto-completar baseadas em termos comuns
    const commonTerms = [
      'supermercado', 'restaurante', 'farmacia', 'posto', 'uber', 'ifood',
      'netflix', 'spotify', 'amazon', 'mercado', 'padaria', 'transporte'
    ];
    
    commonTerms.forEach(term => {
      if (term.includes(queryLower)) {
        suggestions.add(term);
      }
    });
    
    return Array.from(suggestions).slice(0, 8);
  }

  /**
   * Analisa padrões de busca do usuário
   */
  analyzeSearchPatterns(searchHistory) {
    const patterns = {
      mostSearchedTerms: {},
      mostSearchedCategories: {},
      averageSearchLength: 0,
      searchModes: {},
      timeOfDay: {}
    };
    
    if (!searchHistory.length) return patterns;
    
    searchHistory.forEach(search => {
      // Termos mais buscados
      const terms = this.extractTerms(search.term);
      terms.forEach(term => {
        patterns.mostSearchedTerms[term] = (patterns.mostSearchedTerms[term] || 0) + 1;
      });
      
      // Categorias mais filtradas
      if (search.filters?.categories) {
        search.filters.categories.forEach(cat => {
          patterns.mostSearchedCategories[cat] = (patterns.mostSearchedCategories[cat] || 0) + 1;
        });
      }
      
      // Modos de busca
      const mode = search.filters?.searchMode || 'contains';
      patterns.searchModes[mode] = (patterns.searchModes[mode] || 0) + 1;
      
      // Horário das buscas
      if (search.timestamp) {
        const hour = new Date(search.timestamp).getHours();
        const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        patterns.timeOfDay[period] = (patterns.timeOfDay[period] || 0) + 1;
      }
    });
    
    // Calcular média de comprimento das buscas
    patterns.averageSearchLength = searchHistory.reduce((sum, search) => 
      sum + search.term.length, 0) / searchHistory.length;
    
    return patterns;
  }
}

// Instância singleton do serviço
export const advancedSearchService = new AdvancedSearchService();