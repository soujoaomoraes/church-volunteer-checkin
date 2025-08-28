
const Helpers = {
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  sanitizeForLog(data) {
    const sensitiveFields = ['telefone', 'password', 'token'];
    try {
        const sanitized = JSON.parse(JSON.stringify(data));
        const sanitizeObject = (obj) => {
          for (const key in obj) {
            if (sensitiveFields.includes(key.toLowerCase())) {
              obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              sanitizeObject(obj[key]);
            }
          }
        };
        sanitizeObject(sanitized);
        return sanitized;
    } catch (error) {
        return { error: 'Could not sanitize object' };
    }
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  formatDateTime(isoString, format = 'dd/mm/yyyy hh:mm') {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    switch (format) {
      case 'dd/mm/yyyy hh:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      default:
        return date.toLocaleString('pt-BR');
    }
  },

  formatDuration(minutes) {
    if (minutes === null || isNaN(minutes)) return 'N/A';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  },

  fuzzyMatch(text, search) {
    if (!text || !search) return false;
    const textLower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const searchLower = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let searchIndex = 0;
    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  }
};
