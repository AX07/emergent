import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Plus, Trash2, Building, TrendingUp, Edit3, Check, Loader2 } from 'lucide-react';
import { useHoldings } from '../hooks/useAPI';
import { accountsAPI, formatCurrency } from '../services/api';

const AccountDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    holdings, 
    loading: holdingsLoading, 
    createHolding, 
    updateHolding, 
    deleteHolding,
    refetch: refetchHoldings
  } = useHoldings(accountId);

  // Fetch account details
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setAccountLoading(true);
        const accountData = await accountsAPI.getById(accountId);
        setAccount(accountData);
      } catch (error) {
        console.error('Error fetching account:', error);
        setAccount(null);
      } finally {
        setAccountLoading(false);
      }
    };

    if (accountId) {
      fetchAccount();
    }
  }, [accountId]);

  const getTotalValue = () => {
    return holdings.reduce((total, holding) => total + (holding.value || 0), 0);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateHolding = async (holdingId, field, value) => {
    try {
      const updateData = { 
        [field]: field === 'value' || field === 'quantity' ? parseFloat(value) || 0 : value 
      };
      await updateHolding(holdingId, updateData);
      
      // Update account balance if it's an investment account
      if (field === 'value') {
        const newTotal = getTotalValue();
        await accountsAPI.update(accountId, { balance: newTotal });
      }
    } catch (error) {
      console.error('Error updating holding:', error);
    }
  };

  const handleAddHolding = async () => {
    try {
      const newHolding = {
        name: 'New Holding',
        ticker: '',
        quantity: 0,
        value: 0
      };
      await createHolding(newHolding);
      setIsEditing(true);
    } catch (error) {
      console.error('Error adding holding:', error);
    }
  };

  const handleRemoveHolding = async (holdingId) => {
    if (window.confirm('Are you sure you want to remove this holding?')) {
      try {
        await deleteHolding(holdingId);
        
        // Update account balance
        const newTotal = getTotalValue();
        await accountsAPI.update(accountId, { balance: newTotal });
      } catch (error) {
        console.error('Error removing holding:', error);
      }
    }
  };

  const getCategoryIcon = () => {
    if (!account) return <Building className="h-6 w-6 text-blue-500" />;
    
    switch (account.category) {
      case 'Equities':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'Crypto':
        return <Building className="h-6 w-6 text-orange-500" />;
      default:
        return <Building className="h-6 w-6 text-blue-500" />;
    }
  };

  if (accountLoading) {
    return (
      <div className="p-6 space-y-6">
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
              <div className="h-8 bg-gray-700 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-32 mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">Account Not Found</h1>
          <p className="text-gray-400 mb-4">The account you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/assets')} className="bg-blue-600 hover:bg-blue-700">
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

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
                Done Editing
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
              onClick={handleAddHolding}
              disabled={holdingsLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {holdingsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Holding
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {holdingsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No holdings in this account</p>
              <Button
                onClick={handleAddHolding}
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
                            onChange={(e) => handleUpdateHolding(holding.id, 'name', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-gray-100"
                          />
                        ) : (
                          <span className="text-gray-100 font-medium">{holding.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <Input
                            value={holding.ticker || ''}
                            onChange={(e) => handleUpdateHolding(holding.id, 'ticker', e.target.value)}
                            className="w-20 bg-gray-800 border-gray-700 text-gray-100"
                            placeholder="AAPL"
                          />
                        ) : (
                          <span className="text-gray-300 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                            {holding.ticker || '---'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={holding.quantity || 0}
                            onChange={(e) => handleUpdateHolding(holding.id, 'quantity', e.target.value)}
                            className="w-24 bg-gray-800 border-gray-700 text-gray-100 text-right"
                          />
                        ) : (
                          <span className="text-gray-300">{holding.quantity || 0}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={holding.value || 0}
                            onChange={(e) => handleUpdateHolding(holding.id, 'value', e.target.value)}
                            className="w-32 bg-gray-800 border-gray-700 text-gray-100 text-right"
                          />
                        ) : (
                          <span className="text-gray-100 font-medium">
                            {formatCurrency(holding.value || 0)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveHolding(holding.id)}
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