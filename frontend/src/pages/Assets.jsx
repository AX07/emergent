import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PiggyBank, Edit3, Check, Building, Wallet, TrendingUp, Home } from 'lucide-react';
import { mockAccounts, getAccountsByCategory, getTotalAssets, getAssetAllocation } from '../data/mock';

const Assets = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editableAccounts, setEditableAccounts] = useState(mockAccounts);
  
  const totalAssets = getTotalAssets();
  const accountsByCategory = getAccountsByCategory();
  const assetAllocation = getAssetAllocation();
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Bank Accounts':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'Equities':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'Crypto':
        return <Building className="h-5 w-5 text-orange-500" />;
      case 'Real Estate':
        return <Home className="h-5 w-5 text-purple-500" />;
      default:
        return <PiggyBank className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      console.log('Saving account changes:', editableAccounts);
    }
  };

  const updateAccount = (id, field, value) => {
    setEditableAccounts(prev =>
      prev.map(account =>
        account.id === id ? { ...account, [field]: parseFloat(value) || 0 } : account
      )
    );
  };

  const updateAccountName = (id, name) => {
    setEditableAccounts(prev =>
      prev.map(account =>
        account.id === id ? { ...account, name: name } : account
      )
    );
  };

  const handleAccountClick = (account) => {
    if (account.holdings && account.holdings.length > 0) {
      navigate(`/assets/${account.id}`);
    }
  };

  const getCategoryTotal = (accounts) => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const canEditAccount = (account) => {
    return !account.holdings || account.holdings.length === 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Assets Overview</h1>
          <p className="text-gray-400 mt-1">Manage your accounts and portfolio</p>
        </div>
        <Button
          onClick={handleEditToggle}
          className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Accounts
            </>
          )}
        </Button>
      </div>

      {/* Net Worth Summary */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Total Net Worth</h2>
                <PiggyBank className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-100 mb-2">
                {formatCurrency(totalAssets)}
              </div>
              <div className="flex items-center text-sm text-green-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Asset Allocation</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ color: '#D1D5DB', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Listings by Category */}
      <div className="space-y-6">
        {Object.entries(accountsByCategory).map(([category, accounts]) => (
          <Card key={category} className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <div>
                    <CardTitle className="text-gray-100">{category}</CardTitle>
                    <p className="text-sm text-gray-400">
                      Total: {formatCurrency(getCategoryTotal(accounts))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{accounts.length} accounts</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`bg-gray-800 border-gray-700 transition-all duration-200 ${
                      account.holdings && account.holdings.length > 0
                        ? 'hover:bg-gray-750 cursor-pointer hover:border-blue-500'
                        : ''
                    }`}
                    onClick={() => handleAccountClick(account)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {isEditing && canEditAccount(account) ? (
                              <Input
                                value={account.name}
                                onChange={(e) => updateAccountName(account.id, e.target.value)}
                                className="bg-gray-700 border-gray-600 text-gray-100 mb-2"
                              />
                            ) : (
                              <h3 className="font-semibold text-gray-100">{account.name}</h3>
                            )}
                            {account.institution && (
                              <p className="text-sm text-gray-400">{account.institution}</p>
                            )}
                          </div>
                          {account.holdings && account.holdings.length > 0 && (
                            <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                              {account.holdings.length} holdings
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-700 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Balance</span>
                            {isEditing && canEditAccount(account) ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={account.balance}
                                onChange={(e) => updateAccount(account.id, 'balance', e.target.value)}
                                className="w-32 bg-gray-700 border-gray-600 text-gray-100 text-right"
                              />
                            ) : (
                              <span className="font-bold text-gray-100">
                                {formatCurrency(account.balance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Assets;