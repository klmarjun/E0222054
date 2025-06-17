import './StockPriceAggregator.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw, DollarSign, Clock, AlertCircle } from 'lucide-react';

const StockPriceAggregator = () => {
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mockStockData = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.15, changePercent: 1.22, volume: 45123456, marketCap: '2.8T' },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.45, change: -1.25, changePercent: -0.89, volume: 23456789, marketCap: '1.7T' },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 412.80, change: 5.60, changePercent: 1.38, volume: 18765432, marketCap: '3.1T' },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.15, change: -8.45, changePercent: -3.37, volume: 67890123, marketCap: '765B' },
    'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 168.90, change: 3.25, changePercent: 1.96, volume: 34567890, marketCap: '1.8T' }
  };

  const fetchStockData = useCallback(async (symbols) => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stockData = symbols.map(symbol => {
        const data = mockStockData[symbol.toUpperCase()];
        if (data) {
          return {
            ...data,
            lastUpdated: new Date().toLocaleTimeString()
          };
        }
        return null;
      }).filter(Boolean);
      
      setStocks(stockData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStock = async () => {
    if (!searchQuery.trim()) return;
    
    const symbol = searchQuery.toUpperCase();
    if (mockStockData[symbol]) {
      const stockData = {
        ...mockStockData[symbol],
        lastUpdated: new Date().toLocaleTimeString()
      };
      setSelectedStock(stockData);
      setSearchQuery('');
    } else {
      setError(`Stock symbol "${symbol}" not found`);
    }
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const refreshData = () => {
    fetchStockData(watchlist);
  };

  useEffect(() => {
    fetchStockData(watchlist);
    
    const interval = setInterval(() => {
      fetchStockData(watchlist);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [watchlist, fetchStockData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatChange = (change, changePercent) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {formatPrice(Math.abs(change))} ({Math.abs(changePercent).toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="w-8 h-8 mr-2 text-blue-600" />
              Stock Price Aggregator
            </h1>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {lastUpdated}
                </span>
              )}
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                placeholder="Search for stocks (e.g., AAPL, GOOGL, MSFT)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchStock}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Selected Stock Detail */}
        {selectedStock && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Stock Detail</h2>
              <button
                onClick={() => setSelectedStock(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedStock.name}</h3>
                <p className="text-2xl font-bold text-blue-600">{selectedStock.symbol}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatPrice(selectedStock.price)}</p>
                <div className="mt-2">{formatChange(selectedStock.change, selectedStock.changePercent)}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume:</span>
                  <span className="font-semibold">{selectedStock.volume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap:</span>
                  <span className="font-semibold">{selectedStock.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold">{selectedStock.lastUpdated}</span>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => addToWatchlist(selectedStock.symbol)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Watchlist</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading stock data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
                    <button
                      onClick={() => removeFromWatchlist(stock.symbol)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{stock.name}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(stock.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      {formatChange(stock.change, stock.changePercent)}
                    </div>
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Volume: {stock.volume.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated: {stock.lastUpdated}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {stocks.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No stocks in your watchlist. Search and add some stocks to get started!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Stock data is simulated for demonstration purposes. In production, integrate with real stock market APIs.</p>
        </div>
      </div>
    </div>
  );
};

export default StockPriceAggregator;