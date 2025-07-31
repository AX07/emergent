// Mock data for FinTrack AI
export const mockTransactions = [
  {
    id: '1',
    date: '2025-01-15',
    description: 'Starbucks Coffee',
    amount: -15.50,
    category: 'Food & Dining',
    accountId: 'acc1'
  },
  {
    id: '2',
    date: '2025-01-14',
    description: 'Salary Deposit',
    amount: 5500.00,
    category: 'Income',
    accountId: 'acc1'
  },
  {
    id: '3',
    date: '2025-01-13',
    description: 'Electric Bill',
    amount: -120.00,
    category: 'Utilities',
    accountId: 'acc1'
  },
  {
    id: '4',
    date: '2025-01-12',
    description: 'Grocery Store',
    amount: -85.30,
    category: 'Groceries',
    accountId: 'acc1'
  },
  {
    id: '5',
    date: '2025-01-11',
    description: 'Gas Station',
    amount: -45.00,
    category: 'Transportation',
    accountId: 'acc1'
  },
  {
    id: '6',
    date: '2025-01-10',
    description: 'Netflix Subscription',
    amount: -15.99,
    category: 'Entertainment',
    accountId: 'acc1'
  },
  {
    id: '7',
    date: '2025-01-09',
    description: 'Freelance Payment',
    amount: 800.00,
    category: 'Income',
    accountId: 'acc2'
  },
  {
    id: '8',
    date: '2025-01-08',
    description: 'Restaurant Dinner',
    amount: -65.50,
    category: 'Food & Dining',
    accountId: 'acc1'
  }
];

export const mockAccounts = [
  {
    id: 'acc1',
    name: 'Chase Checking',
    institution: 'Chase Bank',
    category: 'Bank Accounts',
    balance: 8500.00,
    holdings: []
  },
  {
    id: 'acc2',
    name: 'Savings Account',
    institution: 'Wells Fargo',
    category: 'Bank Accounts', 
    balance: 25000.00,
    holdings: []
  },
  {
    id: 'acc3',
    name: 'Fidelity 401k',
    institution: 'Fidelity',
    category: 'Equities',
    balance: 85000.00,
    holdings: [
      { id: 'h1', name: 'S&P 500 Index Fund', ticker: 'FXAIX', quantity: 200, value: 45000 },
      { id: 'h2', name: 'Total Stock Market', ticker: 'FZROX', quantity: 150, value: 40000 }
    ]
  },
  {
    id: 'acc4',
    name: 'Coinbase Wallet',
    institution: 'Coinbase',
    category: 'Crypto',
    balance: 15000.00,
    holdings: [
      { id: 'h3', name: 'Bitcoin', ticker: 'BTC', quantity: 0.25, value: 10000 },
      { id: 'h4', name: 'Ethereum', ticker: 'ETH', quantity: 1.5, value: 5000 }
    ]
  },
  {
    id: 'acc5',
    name: 'Primary Residence',
    institution: '',
    category: 'Real Estate',
    balance: 450000.00,
    holdings: []
  }
];

export const mockPortfolioData = [
  { month: 'Aug 2024', value: 520000 },
  { month: 'Sep 2024', value: 535000 },
  { month: 'Oct 2024', value: 548000 },
  { month: 'Nov 2024', value: 562000 },
  { month: 'Dec 2024', value: 571000 },
  { month: 'Jan 2025', value: 583500 }
];

export const mockChatMessages = [
  {
    id: '1',
    role: 'ai',
    content: 'Hello! I\'m your FinTrack AI assistant. I can help you manage your finances, add transactions, analyze spending, and answer questions about your financial data. What would you like to do today?',
    timestamp: new Date('2025-01-15T10:00:00')
  },
  {
    id: '2', 
    role: 'user',
    content: 'I spent $15 on coffee this morning',
    timestamp: new Date('2025-01-15T10:01:00')
  },
  {
    id: '3',
    role: 'ai', 
    content: 'I\'ve recorded your coffee purchase of $15. This has been categorized under "Food & Dining" and added to your Chase Checking account. Your total spending on Food & Dining this month is now $81.',
    timestamp: new Date('2025-01-15T10:01:30')
  }
];

// Helper functions for data manipulation
export const getAccountsByCategory = () => {
  const categories = {};
  mockAccounts.forEach(account => {
    if (!categories[account.category]) {
      categories[account.category] = [];
    }
    categories[account.category].push(account);
  });
  return categories;
};

export const getTotalAssets = () => {
  return mockAccounts.reduce((total, account) => total + account.balance, 0);
};

export const getSpendingByCategory = () => {
  const spending = {};
  mockTransactions
    .filter(t => t.amount < 0)
    .forEach(transaction => {
      const category = transaction.category;
      if (!spending[category]) {
        spending[category] = { total: 0, count: 0 };
      }
      spending[category].total += Math.abs(transaction.amount);
      spending[category].count += 1;
    });
  return spending;
};

export const getMonthlySpending = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return mockTransactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.amount < 0 && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((total, t) => total + Math.abs(t.amount), 0);
};

export const getRecentTransactions = (limit = 5) => {
  return mockTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

export const getAssetAllocation = () => {
  const allocation = {};
  mockAccounts.forEach(account => {
    if (!allocation[account.category]) {
      allocation[account.category] = 0;
    }
    allocation[account.category] += account.balance;
  });
  return Object.entries(allocation).map(([name, value]) => ({ name, value }));
};