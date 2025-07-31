import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Plus, Trash2, Building, TrendingUp, Edit3, Check } from 'lucide-react';
import { mockAccounts } from '../data/mock';

const AccountDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  
  const account = mockAccounts.find(acc => acc.id === accountId);
  const [isEditing, setIsEditing] = useState(false);
  const [holdings, setHoldings] = useState(account?.holdings || []);
  
  if (!account) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Account Not Found</h1>
          <Button onClick={() => navigate('/assets')} className="bg-blue-600 hover:bg-blue-700">
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getTotalValue = () => {
    return holdings.reduce((total, holding) => total + (holding.value || 0), 0);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      console.log('Saving holdings changes:', holdings);
    }
  };

  const updateHolding = (id, field, value) => {
    setHoldings(prev =>
      prev.map(holding =>
        holding.id === id ? { 
          ...holding, 
          [field]: field === 'value' || field === 'quantity' ? parseFloat(value) || 0 : value 
        } : holding
      )
    );
  };

  const addHolding = () => {
    const newHolding = {
      id: `h${Date.now()}`,
      name: 'New Holding',
      ticker: '',
      quantity: 0,
      value: 0
    };
    setHoldings(prev => [...prev, newHolding]);
    setIsEditing(true);
  };

  const removeHolding = (id) => {
    if (window.confirm('Are you sure you want to remove this holding?')) {
      setHoldings(prev => prev.filter(holding => holding.id !== id));
    }
  };

  const getCategoryIcon = () => {
    switch (account.category) {
      case 'Equities':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'Crypto':
        return <Building className="h-6 w-6 text-orange-500" />;
      default:
        return <Building className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/assets')}
            className="text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{account.name}</h1>
            <p className="text-gray-400 mt-1">
              {account.institution && `${account.institution} • `}
              {account.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
                Edit Holdings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getCategoryIcon()}
              <div>
                <h2 className="text-lg font-semibold text-gray-100">Account Summary</h2>
                <p className="text-sm text-gray-400">{account.category}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-100">
                {formatCurrency(getTotalValue())}
              </div>
              <p className="text-sm text-gray-400">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Management */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-100">Holdings</CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Manage individual assets within this account
              </p>
            </div>
            <Button
              onClick={addHolding}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No holdings in this account</p>
              <Button
                onClick={addHolding}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Holding
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Ticker</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Quantity</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Value</th>
                    <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            value={holding.name}
                            onChange={(e) => updateHolding(holding.id, 'name', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-gray-100"
                          />
                        ) : (
                          <span className="text-gray-100 font-medium">{holding.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            value={holding.ticker}
                            onChange={(e) => updateHolding(holding.id, 'ticker', e.target.value)}
                            className="w-20 bg-gray-800 border-gray-700 text-gray-100"
                            placeholder="AAPL"
                          />
                        ) : (
                          <span className="text-gray-300 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                            {holding.ticker}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={holding.quantity}
                            onChange={(e) => updateHolding(holding.id, 'quantity', e.target.value)}
                            className="w-24 bg-gray-800 border-gray-700 text-gray-100 text-right"
                          />
                        ) : (
                          <span className="text-gray-300">{holding.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={holding.value}
                            onChange={(e) => updateHolding(holding.id, 'value', e.target.value)}
                            className="w-32 bg-gray-800 border-gray-700 text-gray-100 text-right"
                          />
                        ) : (
                          <span className="text-gray-100 font-medium">
                            {formatCurrency(holding.value)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeHolding(holding.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-600">
                    <td colSpan="3" className="py-3 px-4 text-right font-medium text-gray-300">
                      Total Account Value:
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-lg font-bold text-gray-100">
                        {formatCurrency(getTotalValue())}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDetail;