import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'https://73dec375-74fa-435b-b04c-652d66b377bf.preview.emergentagent.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error Message:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============ ACCOUNT API METHODS ============

export const accountsAPI = {
  // Get all accounts
  getAll: async () => {
    const response = await api.get('/api/accounts');
    return response.data;
  },

  // Get account by ID
  getById: async (id) => {
    const response = await api.get(`/api/accounts/${id}`);
    return response.data;
  },

  // Create new account
  create: async (accountData) => {
    const response = await api.post('/api/accounts', accountData);
    return response.data;
  },

  // Update account
  update: async (id, accountData) => {
    const response = await api.put(`/api/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete account
  delete: async (id) => {
    const response = await api.delete(`/api/accounts/${id}`);
    return response.data;
  },
};

// ============ HOLDINGS API METHODS ============

export const holdingsAPI = {
  // Get holdings for an account
  getByAccount: async (accountId) => {
    const response = await api.get(`/api/accounts/${accountId}/holdings`);
    return response.data;
  },

  // Create new holding
  create: async (accountId, holdingData) => {
    const response = await api.post(`/api/accounts/${accountId}/holdings`, holdingData);
    return response.data;
  },

  // Update holding
  update: async (id, holdingData) => {
    const response = await api.put(`/api/holdings/${id}`, holdingData);
    return response.data;
  },

  // Delete holding
  delete: async (id) => {
    const response = await api.delete(`/api/holdings/${id}`);
    return response.data;
  },
};

// ============ TRANSACTIONS API METHODS ============

export const transactionsAPI = {
  // Get all transactions with optional filtering
  getAll: async (params = {}) => {
    const response = await api.get('/api/transactions', { params });
    return response.data;
  },

  // Create new transaction
  create: async (transactionData) => {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  },

  // Update transaction
  update: async (id, transactionData) => {
    const response = await api.put(`/api/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  delete: async (id) => {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  },
};

// ============ ANALYTICS API METHODS ============

export const analyticsAPI = {
  // Get spending by category
  getSpendingByCategory: async () => {
    const response = await api.get('/api/analytics/spending-by-category');
    return response.data;
  },

  // Get monthly spending
  getMonthlySpending: async () => {
    const response = await api.get('/api/analytics/monthly-spending');
    return response.data;
  },

  // Get asset allocation
  getAssetAllocation: async () => {
    const response = await api.get('/api/analytics/asset-allocation');
    return response.data;
  },
};

// ============ AI API METHODS ============

export const aiAPI = {
  // Send chat message
  chat: async (message) => {
    const response = await api.post('/api/ai/chat', { message });
    return response.data;
  },

  // Get chat messages
  getMessages: async (limit = 50) => {
    const response = await api.get('/api/ai/messages', { params: { limit } });
    return response.data;
  },

  // Upload document
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/ai/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Clear chat history (if needed)
  clearMessages: async () => {
    const response = await api.delete('/api/ai/messages');
    return response.data;
  },
};

// ============ HELPER FUNCTIONS ============

// Format currency for display
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
};

// Group accounts by category
export const groupAccountsByCategory = (accounts) => {
  const categories = {};
  accounts.forEach(account => {
    if (!categories[account.category]) {
      categories[account.category] = [];
    }
    categories[account.category].push(account);
  });
  return categories;
};

// Calculate total assets from accounts
export const calculateTotalAssets = (accounts) => {
  return accounts.reduce((total, account) => total + (account.balance || 0), 0);
};

// Get recent transactions (sorted by date)
export const getRecentTransactions = (transactions, limit = 5) => {
  return transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

// Error handling utilities
export const handleAPIError = (error, fallbackMessage = 'An error occurred') => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  } else if (error.message) {
    return error.message;
  } else {
    return fallbackMessage;
  }
};

// Default export
export default api;