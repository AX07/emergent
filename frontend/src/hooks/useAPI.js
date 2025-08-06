import { useState, useEffect } from 'react';
import { 
  accountsAPI, 
  transactionsAPI, 
  analyticsAPI, 
  aiAPI,
  holdingsAPI,
  handleAPIError 
} from '../services/api';

// ============ ACCOUNTS HOOK ============

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountsAPI.getAll();
      setAccounts(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch accounts'));
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData) => {
    try {
      const newAccount = await accountsAPI.create(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to create account');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateAccount = async (id, accountData) => {
    try {
      const updatedAccount = await accountsAPI.update(id, accountData);
      setAccounts(prev => 
        prev.map(account => account.id === id ? updatedAccount : account)
      );
      return updatedAccount;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to update account');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteAccount = async (id) => {
    try {
      await accountsAPI.delete(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to delete account');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};

// ============ TRANSACTIONS HOOK ============

export const useTransactions = (accountId = null) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = accountId ? { account_id: accountId } : {};
      const data = await transactionsAPI.getAll(params);
      setTransactions(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch transactions'));
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      const newTransaction = await transactionsAPI.create(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to create transaction');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const updatedTransaction = await transactionsAPI.update(id, transactionData);
      setTransactions(prev => 
        prev.map(transaction => transaction.id === id ? updatedTransaction : transaction)
      );
      return updatedTransaction;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to update transaction');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to delete transaction');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accountId]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};

// ============ ANALYTICS HOOK ============

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    spendingByCategory: {},
    monthlySpending: { total: 0 },
    assetAllocation: { allocation: [], total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [spendingByCategory, monthlySpending, assetAllocation] = await Promise.all([
        analyticsAPI.getSpendingByCategory(),
        analyticsAPI.getMonthlySpending(),
        analyticsAPI.getAssetAllocation()
      ]);

      setAnalytics({
        spendingByCategory,
        monthlySpending,
        assetAllocation
      });
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch analytics'));
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

// ============ AI CHAT HOOK ============

export const useAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiAPI.getMessages();
      setMessages(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch chat messages'));
      console.error('Error fetching chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message) => {
    try {
      setError(null);
      
      // Add user message to UI immediately
      const userMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);

      // Send to AI and get response
      const response = await aiAPI.chat(message);
      
      // Add AI response to UI
      const aiMessage = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      return response;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to send message');
      setError(errorMsg);
      
      // Add error message to UI
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'ai',
        content: `Sorry, I encountered an error: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file) => {
    try {
      setError(null);
      setLoading(true);

      // Add upload message to UI
      const uploadMessage = {
        id: `upload_${Date.now()}`,
        role: 'user',
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, uploadMessage]);

      // Upload file
      const response = await aiAPI.uploadDocument(file);

      // Add response message
      const responseMessage = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        content: response.message || 'File processed successfully',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, responseMessage]);

      return response;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to upload document');
      setError(errorMsg);
      
      // Add error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        role: 'ai',
        content: `Sorry, I couldn't process your file: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    uploadDocument,
    refetch: fetchMessages,
  };
};

// ============ HOLDINGS HOOK ============

export const useHoldings = (accountId) => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHoldings = async () => {
    if (!accountId) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await holdingsAPI.getByAccount(accountId);
      setHoldings(data);
    } catch (err) {
      setError(handleAPIError(err, 'Failed to fetch holdings'));
      console.error('Error fetching holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createHolding = async (holdingData) => {
    try {
      const newHolding = await holdingsAPI.create(accountId, holdingData);
      setHoldings(prev => [...prev, newHolding]);
      return newHolding;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to create holding');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateHolding = async (id, holdingData) => {
    try {
      const updatedHolding = await holdingsAPI.update(id, holdingData);
      setHoldings(prev => 
        prev.map(holding => holding.id === id ? updatedHolding : holding)
      );
      return updatedHolding;
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to update holding');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteHolding = async (id) => {
    try {
      await holdingsAPI.delete(id);
      setHoldings(prev => prev.filter(holding => holding.id !== id));
    } catch (err) {
      const errorMsg = handleAPIError(err, 'Failed to delete holding');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, [accountId]);

  return {
    holdings,
    loading,
    error,
    refetch: fetchHoldings,
    createHolding,
    updateHolding,
    deleteHolding,
  };
};

// ============ PORTFOLIO MOCK DATA HOOK (for now) ============
export const usePortfolioHistory = () => {
  // This would typically come from analytics API
  // For now, using mock data since backend doesn't have this endpoint yet
  const portfolioData = [
    { month: 'Aug 2024', value: 520000 },
    { month: 'Sep 2024', value: 535000 },
    { month: 'Oct 2024', value: 548000 },
    { month: 'Nov 2024', value: 562000 },
    { month: 'Dec 2024', value: 571000 },
    { month: 'Jan 2025', value: 583500 }
  ];

  return {
    portfolioData,
    loading: false,
    error: null
  };
};