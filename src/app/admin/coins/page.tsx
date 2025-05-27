'use client';

import { useEffect, useState } from 'react';

interface Coin {
  id: string; 
  coin_id: string; 
  symbol: string;
  name: string;
  image_url?: string | null; 
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Using sessionStorage to avoid re-prompting during the same session.
const ADMIN_AUTH_KEY = 'ADMIN_COINS_AUTHENTICATED';
const ADMIN_PASSWORD_STORE_KEY = 'ADMIN_COINS_PASSWORD';


export default function AdminCoinsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState<string | null>(null);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load and subsequent operations
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  // New coin form state
  const [newCoinId, setNewCoinId] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    const storedPass = sessionStorage.getItem(ADMIN_PASSWORD_STORE_KEY);

    if (sessionAuth === 'true' && storedPass) {
      setAuthPassword(storedPass);
      setIsAuthenticated(true);
    } else {
      const passwordAttempt = window.prompt('Enter admin password:');
      const actualAdminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'; // Fallback for dev

      if (passwordAttempt === actualAdminPassword) {
        setAuthPassword(passwordAttempt);
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        sessionStorage.setItem(ADMIN_PASSWORD_STORE_KEY, passwordAttempt);
      } else {
        if (passwordAttempt !== null) { // Avoid alert if user cancels prompt
            alert('Incorrect password. Access denied.');
        }
        setListError('Access Denied. Please refresh and enter the correct password.');
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authPassword) {
      fetchCoins();
    }
  }, [isAuthenticated, authPassword]);


  const fetchCoins = async () => {
    if (!authPassword) return;
    setIsLoading(true);
    setListError(null);
    try {
      const response = await fetch('/api/admin/coins', {
        headers: { 'Authorization': `Bearer ${authPassword}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to fetch coins: ${response.statusText}`);
      }
      const data: Coin[] = await response.json();
      setCoins(data);
    } catch (err) {
      console.error('Error fetching coins:', err);
      setListError(err instanceof Error ? err.message : 'An unknown error occurred while fetching coins.');
      setCoins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
        setFormError("Authentication error. Please refresh.");
        return;
    }
    if (!newCoinId || !newSymbol || !newName) {
      setFormError('Coin ID, Symbol, and Name are required.');
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    try {
      const response = await fetch('/api/admin/coins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authPassword}`,
        },
        body: JSON.stringify({
          coin_id: newCoinId,
          symbol: newSymbol,
          name: newName,
          image_url: newImageUrl || null,
          is_active: true, 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to add coin: ${response.statusText}`);
      }
      
      await fetchCoins(); 
      setNewCoinId('');
      setNewSymbol('');
      setNewName('');
      setNewImageUrl('');
      // Optionally, add a success message state for the form
    } catch (err) {
      console.error('Error adding coin:', err);
      setFormError(err instanceof Error ? err.message : 'Unknown error adding coin');
    } finally {
        setIsLoading(false);
    }
  };

  const handleToggleActive = async (coin: Coin) => {
    if (!authPassword) {
        setListError("Authentication error. Please refresh.");
        return;
    }
    setIsLoading(true);
    setListError(null);
    try {
      const response = await fetch(`/api/admin/coins/${coin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authPassword}`,
        },
        body: JSON.stringify({ is_active: !coin.is_active }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to update coin status: ${response.statusText}`);
      }
      await fetchCoins(); 
    } catch (err) {
      console.error('Error updating coin status:', err);
      setListError(err instanceof Error ? err.message : 'Unknown error updating status');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteCoin = async (coinId: string, coinName: string) => {
    if (!authPassword) {
        setListError("Authentication error. Please refresh.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete "${coinName}"? This action cannot be undone.`)) {
        return;
    }

    setIsLoading(true);
    setListError(null);
    try {
        const response = await fetch(`/api/admin/coins/${coinId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authPassword}` },
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Failed to delete coin: ${response.statusText}`);
        }
        await fetchCoins(); 
    } catch (err) {
        console.error('Error deleting coin:', err);
        setListError(err instanceof Error ? err.message : 'Unknown error deleting coin');
    } finally {
        setIsLoading(false);
    }
  };

  // Common button classes
  const primaryButtonClass = "font-semibold py-2 px-5 rounded-lg transition-all transform focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-400 hover:scale-105";
  const actionButtonClass = "py-1 px-3 rounded-md text-xs font-medium transition-colors disabled:opacity-50";


  if (!isAuthenticated && isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex items-center justify-center">
            <div className="animate-pulse text-xl">Verifying credentials...</div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-700 text-white p-6 flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-4">🚫 Access Denied</h1>
            <p className="text-lg mb-6">{listError || 'You do not have permission to view this page. Please refresh and enter the correct password.'}</p>
            <button onClick={() => window.location.reload()} className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded-lg">
                Refresh
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 md:p-8 selection:bg-purple-500 selection:text-white">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400">
          ⚙️ Admin - Manage Coins
        </h1>
      </header>

      {/* Add New Coin Form */}
      <section className="max-w-xl mx-auto mb-12 p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-purple-700/30">
        <h2 className="text-2xl font-semibold mb-5 text-purple-300">Add New Coin</h2>
        {formError && (
            <div className="mb-4 p-3 bg-red-700/80 text-red-100 border border-red-500 rounded-lg text-sm">
                {formError}
            </div>
        )}
        <form onSubmit={handleAddCoin} className="space-y-4">
          <div>
            <label htmlFor="coinId" className="block text-sm font-medium text-purple-200 mb-1">CoinGecko ID (e.g., bitcoin)</label>
            <input type="text" id="coinId" value={newCoinId} onChange={e => setNewCoinId(e.target.value)} required 
                   className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-400" />
          </div>
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-purple-200 mb-1">Symbol (e.g., BTC)</label>
            <input type="text" id="symbol" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} required 
                   className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-400" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-1">Name (e.g., Bitcoin)</label>
            <input type="text" id="name" value={newName} onChange={e => setNewName(e.target.value)} required 
                   className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-400" />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-purple-200 mb-1">Image URL (optional)</label>
            <input type="text" id="imageUrl" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} 
                   className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-slate-400" />
          </div>
          <button type="submit" disabled={isLoading} className={`${primaryButtonClass} w-auto px-8`}>
            {isLoading ? 'Adding...' : '✨ Add Coin'}
          </button>
        </form>
      </section>

      {/* Managed Coins List */}
      <section className="max-w-4xl mx-auto p-6 bg-slate-800/70 backdrop-blur-md rounded-xl shadow-2xl border border-purple-700/30">
        <h2 className="text-2xl font-semibold mb-5 text-purple-300">Current Managed Coins</h2>
        {listError && (
            <div className="mb-4 p-3 bg-red-700/80 text-red-100 border border-red-500 rounded-lg text-sm">
                {listError}
            </div>
        )}
        {(isLoading && coins.length === 0) && <p className="text-center text-purple-300 py-5">Loading coins...</p>}
        {(!isLoading && !listError && coins.length === 0) && <p className="text-center text-gray-400 py-5">No coins found. Add one above to get started!</p>}
        
        {coins.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-sm">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">CoinGecko ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800/60 divide-y divide-slate-700">
                {coins.map(coin => (
                  <tr key={coin.id} className="hover:bg-slate-700/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-purple-100">{coin.symbol}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{coin.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">{coin.coin_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {coin.image_url && <img src={coin.image_url} alt={coin.name} className="w-8 h-8 rounded-full object-cover border border-slate-600" />}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${coin.is_active ? 'bg-green-600/30 text-green-300 border border-green-500/50' : 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50'}`}>
                        {coin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleActive(coin)}
                        disabled={isLoading}
                        className={`${actionButtonClass} ${coin.is_active ? 'bg-yellow-500/80 hover:bg-yellow-600 text-white focus:ring-yellow-400' : 'bg-green-500/80 hover:bg-green-600 text-white focus:ring-green-400'}`}
                      >
                        {isLoading ? '...' : (coin.is_active ? 'Deactivate' : 'Activate')}
                      </button>
                      <button
                        onClick={() => handleDeleteCoin(coin.id, coin.name)}
                        disabled={isLoading}
                        className={`${actionButtonClass} bg-red-600/80 hover:bg-red-700 text-white focus:ring-red-500`}
                      >
                        {isLoading ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
       <footer className="text-center py-10 mt-auto text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} Crypto Price Predictor Admin. Only authorized users should be here.</p>
      </footer>
    </div>
  );
}
