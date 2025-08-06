import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, Edit3, Check, TrendingDown, Loader2 } from 'lucide-react';
import { useTransactions, useAccounts, useAnalytics } from '../hooks/useAPI';
import { formatCurrency } from '../services/api';

const Spending = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const { transactions, loading: transactionsLoading, updateTransaction } = useTransactions();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  
  const monthlySpending = analytics.monthlySpending.total;
  const spendingByCategory = analytics.spendingByCategory;
  
  // Filter for expense transactions only
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  
  const chartData = Object.entries(spendingByCategory).map(([category, data]) => ({
    category: category,
    amount: data.total
  }));

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateTransaction = async (transactionId, field, value) => {
    try {
      const updateData = { [field]: value };
      if (field === 'amount') {
        // Ensure expenses are negative
        updateData[field] = -Math.abs(parseFloat(value) || 0);
      }
      await updateTransaction(transactionId, updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getFilteredTransactions = () => {
    if (activeTab === 'all') {
      return expenseTransactions;
    }
    return expenseTransactions.filter(t => t.account_id === activeTab);
  };

  // Get unique account IDs from transactions
  const uniqueAccounts = [...new Set(expenseTransactions.map(t => t.account_id))];

  const isLoading = transactionsLoading || accountsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Spending Analysis</h1>
            <p className="text-gray-400 mt-1">Loading your spending data...</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Spending Analysis</h1>
          <p className="text-gray-400 mt-1">Track and manage your expenses</p>
        </div>
        <Button
          onClick={handleEditToggle}
          className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Done Editing
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Transactions
            </>
          )}
        </Button>
      </div>

      {/* Monthly Spending Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Spent This Month</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-100">{formatCurrency(monthlySpending)}</div>
          <div className="flex items-center text-sm text-gray-400 mt-1">
            <span>Real-time spending total</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Spending by Category</CardTitle>
            <p className="text-sm text-gray-400">Breakdown of expenses by category</p>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Bar dataKey="amount" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-gray-400">
                <p>No spending data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Summary */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Category Summary</CardTitle>
            <p className="text-sm text-gray-400">Spending details by category</p>
          </CardHeader>
          <CardContent>
            {Object.keys(spendingByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(spendingByCategory).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div>
                      <p className="font-medium text-gray-100">{category}</p>
                      <p className="text-sm text-gray-400">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-400">{formatCurrency(data.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No spending categories found</p>
                <p className="text-sm text-gray-500">Add some expense transactions to see spending breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100">Transaction Details</CardTitle>
          <p className="text-sm text-gray-400">All spending transactions with editing capabilities</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="all" className="text-gray-300">All Accounts</TabsTrigger>
              {uniqueAccounts.slice(0, 3).map(accountId => (
                <TabsTrigger key={accountId} value={accountId} className="text-gray-300">
                  {getAccountName(accountId)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {getFilteredTransactions().length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No spending transactions found</h3>
                  <p className="text-gray-400 mb-4">Start by adding some expense transactions through the AI Assistant</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredTransactions().map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <Input
                                type="date"
                                value={transaction.date}
                                onChange={(e) => handleUpdateTransaction(transaction.id, 'date', e.target.value)}
                                className="w-32 bg-gray-800 border-gray-700 text-gray-100"
                              />
                            ) : (
                              <span className="text-gray-300">{new Date(transaction.date).toLocaleDateString()}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <Input
                                value={transaction.description}
                                onChange={(e) => handleUpdateTransaction(transaction.id, 'description', e.target.value)}
                                className="bg-gray-800 border-gray-700 text-gray-100"
                              />
                            ) : (
                              <span className="text-gray-100">{transaction.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isEditing ? (
                              <Select 
                                value={transaction.category}
                                onValueChange={(value) => handleUpdateTransaction(transaction.id, 'category', value)}
                              >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                                  <SelectItem value="Groceries">Groceries</SelectItem>
                                  <SelectItem value="Transportation">Transportation</SelectItem>
                                  <SelectItem value="Utilities">Utilities</SelectItem>
                                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                                  <SelectItem value="Shopping">Shopping</SelectItem>
                                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                                  <SelectItem value="Insurance">Insurance</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                {transaction.category}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={Math.abs(transaction.amount)}
                                onChange={(e) => handleUpdateTransaction(transaction.id, 'amount', e.target.value)}
                                className="w-24 bg-gray-800 border-gray-700 text-gray-100 text-right"
                              />
                            ) : (
                              <span className="font-medium text-red-400">
                                {formatCurrency(transaction.amount)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Spending;