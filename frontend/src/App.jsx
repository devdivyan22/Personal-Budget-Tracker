import React, { useState, useEffect } from 'react';
import { Api } from './api';
import Dashboard from './components/Dashboard';
import TransactionsLedger from './components/TransactionsLedger';
import BudgetsGoals from './components/BudgetsGoals';
import Analytics from './components/Analytics';
import { 
  TransactionModal, 
  BudgetModal, 
  SavingsGoalModal, 
  ContributeModal, 
  ImportModal 
} from './components/Modals';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  TrendingUp, 
  Sun, 
  Moon, 
  Wallet, 
  Menu, 
  Plus, 
  X,
  Utensils, 
  Home, 
  Droplet, 
  Car, 
  Tv, 
  HeartPulse, 
  ShoppingBag, 
  GraduationCap, 
  HelpCircle, 
  Briefcase, 
  Laptop, 
  Gift, 
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const CATEGORIES = {
  expense: ['Food', 'Housing', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Miscellaneous'],
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
};

export default function App() {
  // Central application state
  const [state, setState] = useState({
    transactions: [],
    budgets: {},
    savingsGoals: [],
    settings: { currency: '$', theme: 'dark' }
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Track whether we are falling back to browser localStorage mode
  const [isLocalStorageMode, setIsLocalStorageMode] = useState(false);

  // Link state between Budgets and Transactions ledger
  const [initialCategoryFilter, setInitialCategoryFilter] = useState('all');

  // Modal control states
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [activeTx, setActiveTx] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);
  const [contribModalOpen, setContribModalOpen] = useState(false);
  const [activeContribGoal, setActiveContribGoal] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load state from local storage fallback
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('apexbudget_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setState(data);
        const loadedTheme = data.settings?.theme || 'dark';
        document.documentElement.setAttribute('data-theme', loadedTheme);
        return;
      } catch (e) {
        console.error("Error loading localStorage:", e);
      }
    }
    seedDummyData();
  };

  const seedDummyData = () => {
    const now = new Date();
    const formatOffsetDate = (daysAgo) => {
      const d = new Date();
      d.setDate(now.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    const dummyState = {
      transactions: [
        { id: '1', title: 'Monthly Salary', amount: 4500, category: 'Salary', date: formatOffsetDate(25), type: 'income', notes: 'Main employer salary' },
        { id: '2', title: 'Apartment Rent', amount: 1200, category: 'Housing', date: formatOffsetDate(24), type: 'expense', notes: 'Monthly rent auto-pay' },
        { id: '3', title: 'Weekly Groceries', amount: 165.40, category: 'Food', date: formatOffsetDate(22), type: 'expense', notes: 'Whole Foods trip' },
        { id: '4', title: 'Freelance Design Project', amount: 850, category: 'Freelance', date: formatOffsetDate(18), type: 'income', notes: 'Logo design project client payment' },
        { id: '5', title: 'Electricity & Gas Bill', amount: 145.20, category: 'Utilities', date: formatOffsetDate(15), type: 'expense', notes: 'Grid Utility co' },
        { id: '6', title: 'Dinner with friends', amount: 82.50, category: 'Entertainment', date: formatOffsetDate(12), type: 'expense', notes: 'Thai Restaurant' },
        { id: '7', title: 'Gas Station Refuel', amount: 45.00, category: 'Transportation', date: formatOffsetDate(10), type: 'expense', notes: '' },
        { id: '8', title: 'Online Course Subscription', amount: 29.99, category: 'Education', date: formatOffsetDate(8), type: 'expense', notes: 'Self development course' },
        { id: '9', title: 'Dividends Payout', amount: 125.00, category: 'Investments', date: formatOffsetDate(5), type: 'income', notes: 'Stock dividends' },
        { id: '10', title: 'Sneakers Purchase', amount: 110.00, category: 'Shopping', date: formatOffsetDate(3), type: 'expense', notes: 'Nike Store sale' },
        { id: '11', title: 'Pharmacy prescriptions', amount: 35.00, category: 'Healthcare', date: formatOffsetDate(2), type: 'expense', notes: 'Prescription refill' },
        { id: '12', title: 'Gym Membership', amount: 50.00, category: 'Entertainment', date: formatOffsetDate(1), type: 'expense', notes: '' }
      ],
      budgets: {
        'Food': 400,
        'Housing': 1300,
        'Utilities': 200,
        'Transportation': 150,
        'Entertainment': 250,
        'Shopping': 200,
        'Healthcare': 100
      },
      savingsGoals: [
        { id: 'g1', title: 'Emergency Fund', target: 5000, current: 2800, targetDate: '2026-12-31', color: '#10b981' },
        { id: 'g2', title: 'Europe Vacation', target: 3500, current: 1200, targetDate: '2027-06-30', color: '#3b82f6' },
        { id: 'g3', title: 'Gaming Laptop', target: 1500, current: 1500, targetDate: '2026-08-15', color: '#8b5cf6' }
      ],
      settings: {
        currency: '$',
        theme: 'dark'
      }
    };
    setState(dummyState);
    localStorage.setItem('apexbudget_state', JSON.stringify(dummyState));
  };

  const saveToLocalStorage = (updatedState) => {
    localStorage.setItem('apexbudget_state', JSON.stringify(updatedState));
  };

  // Fetch state from REST API or fallback to localStorage
  const fetchState = async () => {
    try {
      const data = await Api.getState();
      setState(data);
      setIsLocalStorageMode(false);
      const loadedTheme = data.settings?.theme || 'dark';
      document.documentElement.setAttribute('data-theme', loadedTheme);
    } catch (e) {
      console.warn("Spring Boot offline. Switching to local storage fallback.");
      setIsLocalStorageMode(true);
      loadFromLocalStorage();
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // ----------------------------------------------------
  // TOAST NOTIFICATIONS SERVICE
  // ----------------------------------------------------
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper to show backend connection toast
  useEffect(() => {
    if (isLocalStorageMode) {
      showToast('Backend offline. Switched to offline Browser Storage Mode for preview!', 'warning');
    } else if (state.transactions.length > 0) {
      showToast('Connected to Java Spring Boot REST Backend!', 'success');
    }
  }, [isLocalStorageMode]);

  // ----------------------------------------------------
  // CORE OPERATIONS (API SYNC WITH LOCAL STORAGE FALLBACK)
  // ----------------------------------------------------
  const handleSaveTransaction = async (tx) => {
    if (isLocalStorageMode) {
      let newTxs = [...state.transactions];
      if (tx.id) {
        const idx = newTxs.findIndex(t => t.id === tx.id);
        if (idx > -1) newTxs[idx] = tx;
      } else {
        tx.id = Date.now().toString();
        newTxs.push(tx);
      }
      const newState = { ...state, transactions: newTxs };
      setState(newState);
      saveToLocalStorage(newState);
      setTxModalOpen(false);
      showToast(tx.id ? 'Transaction updated locally.' : 'Transaction recorded locally.');
      return;
    }

    try {
      await Api.saveTransaction(tx);
      await fetchState();
      setTxModalOpen(false);
      showToast('Transaction saved to server successfully.');
    } catch (e) {
      showToast('Error syncing with backend.', 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      if (isLocalStorageMode) {
        const newTxs = state.transactions.filter(t => t.id !== id);
        const newState = { ...state, transactions: newTxs };
        setState(newState);
        saveToLocalStorage(newState);
        showToast('Transaction deleted locally.', 'info');
        return;
      }

      try {
        await Api.deleteTransaction(id);
        await fetchState();
        showToast('Transaction removed from server.', 'info');
      } catch (e) {
        showToast('Error deleting record from server.', 'error');
      }
    }
  };

  const handleSaveBudgets = async (limits) => {
    if (isLocalStorageMode) {
      const newState = { ...state, budgets: limits };
      setState(newState);
      saveToLocalStorage(newState);
      setBudgetModalOpen(false);
      showToast('Budgets saved locally.');
      return;
    }

    try {
      await Api.saveBudgets(limits);
      await fetchState();
      setBudgetModalOpen(false);
      showToast('Budgets synced to server.');
    } catch (e) {
      showToast('Error syncing budgets with server.', 'error');
    }
  };

  const handleSaveSavingsGoal = async (goal) => {
    if (isLocalStorageMode) {
      let newGoals = [...state.savingsGoals];
      if (goal.id) {
        const idx = newGoals.findIndex(g => g.id === goal.id);
        if (idx > -1) newGoals[idx] = goal;
      } else {
        goal.id = 'g_' + Date.now().toString();
        newGoals.push(goal);
      }
      const newState = { ...state, savingsGoals: newGoals };
      setState(newState);
      saveToLocalStorage(newState);
      setGoalModalOpen(false);
      showToast(goal.id ? 'Goal updated locally.' : 'Goal created locally.');
      return;
    }

    try {
      await Api.saveSavingsGoal(goal);
      await fetchState();
      setGoalModalOpen(false);
      showToast('Savings goal synced to server.');
    } catch (e) {
      showToast('Error saving goal to server.', 'error');
    }
  };

  const handleDeleteSavingsGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal? Funding progress will be discarded.')) {
      if (isLocalStorageMode) {
        const newGoals = state.savingsGoals.filter(g => g.id !== id);
        const newState = { ...state, savingsGoals: newGoals };
        setState(newState);
        saveToLocalStorage(newState);
        showToast('Goal removed locally.', 'info');
        return;
      }

      try {
        await Api.deleteSavingsGoal(id);
        await fetchState();
        showToast('Goal removed from server.', 'info');
      } catch (e) {
        showToast('Error deleting goal from server.', 'error');
      }
    }
  };

  const handleAdjustSavingsGoal = async (id, type, amount) => {
    if (isLocalStorageMode) {
      const newGoals = [...state.savingsGoals];
      const idx = newGoals.findIndex(g => g.id === id);
      if (idx > -1) {
        const g = newGoals[idx];
        if (type === 'add') {
          g.current = Number((g.current + amount).toFixed(2));
        } else {
          g.current = Number((g.current - amount).toFixed(2));
        }
        const newState = { ...state, savingsGoals: newGoals };
        setState(newState);
        saveToLocalStorage(newState);
        setContribModalOpen(false);
        showToast(type === 'add' ? `Added ${currency}${amount} locally.` : `Withdrew ${currency}${amount} locally.`);
      }
      return;
    }

    try {
      await Api.adjustSavingsGoal(id, type, amount);
      await fetchState();
      setContribModalOpen(false);
      showToast(type === 'add' ? 'Added funds successfully.' : 'Withdrew funds successfully.');
    } catch (e) {
      showToast('Error adjusting goal fund.', 'error');
    }
  };

  const handleImportBackup = async (importData) => {
    if (isLocalStorageMode) {
      setState(importData);
      saveToLocalStorage(importData);
      setImportModalOpen(false);
      showToast('Backup restored locally!');
      return;
    }

    try {
      await Api.importState(importData);
      await fetchState();
      setImportModalOpen(false);
      showToast('Backup data imported and restored successfully!');
    } catch (e) {
      showToast('Error importing backup data.', 'error');
    }
  };

  const handleCurrencyChange = async (curr) => {
    if (isLocalStorageMode) {
      const newState = {
        ...state,
        settings: { ...state.settings, currency: curr }
      };
      setState(newState);
      saveToLocalStorage(newState);
      showToast(`Currency updated to ${curr} locally.`, 'info');
      return;
    }

    try {
      await Api.setCurrency(curr);
      await fetchState();
      showToast(`Currency updated to ${curr}.`, 'info');
    } catch (e) {
      showToast('Error updating currency selection.', 'error');
    }
  };

  const handleResetApplication = async () => {
    if (window.confirm('CAUTION: This will clear all recorded transactions, budget limits, and savings goals, resetting the workspace completely. Do you wish to proceed?')) {
      if (isLocalStorageMode) {
        localStorage.removeItem('apexbudget_state');
        seedDummyData();
        showToast('Workspace reset to defaults.', 'warning');
        return;
      }

      try {
        await Api.resetState();
        await fetchState();
        showToast('Workspace reset completed on server.', 'warning');
      } catch (e) {
        showToast('Error resetting application.', 'error');
      }
    }
  };

  const handleThemeToggle = async () => {
    const currentTheme = state.settings?.theme || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const updatedState = {
      ...state,
      settings: { ...state.settings, theme: newTheme }
    };

    if (isLocalStorageMode) {
      setState(updatedState);
      saveToLocalStorage(updatedState);
      return;
    }
    
    try {
      await Api.importState(updatedState);
      await fetchState();
    } catch (e) {
      showToast('Error saving theme settings.', 'error');
    }
  };

  // Switch tab and pre-filter category
  const handleNavigateWithFilter = (tab, categoryFilter = 'all') => {
    setInitialCategoryFilter(categoryFilter);
    setActiveTab(tab);
  };

  const getCategoryIconsMap = (category) => {
    const icons = {
      Food: { icon: Utensils, color: '#ff7a59' },
      Housing: { icon: Home, color: '#3b82f6' },
      Utilities: { icon: Droplet, color: '#38bdf8' },
      Transportation: { icon: Car, color: '#4b5563' },
      Entertainment: { icon: Tv, color: '#a855f7' },
      Healthcare: { icon: HeartPulse, color: '#f43f5e' },
      Shopping: { icon: ShoppingBag, color: '#ec4899' },
      Education: { icon: GraduationCap, color: '#6366f1' },
      Miscellaneous: { icon: HelpCircle, color: '#6b7280' },
      Salary: { icon: Briefcase, color: '#10b981' },
      Freelance: { icon: Laptop, color: '#06b6d4' },
      Investments: { icon: TrendingUp, color: '#84cc16' },
      Gifts: { icon: Gift, color: '#f59e0b' },
      Other: { icon: PlusCircle, color: '#14b8a6' }
    };
    return icons[category] || { icon: HelpCircle, color: '#6b7280' };
  };

  const currency = state.settings?.currency || '$';
  const theme = state.settings?.theme || 'dark';

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Wallet className="logo-icon" size={24} />
            <span className="logo-text">Apex<span>Budget</span></span>
          </div>
        </div>
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setMobileSidebarOpen(false); }}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </button>
          <button 
            className={`menu-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => { handleNavigateWithFilter('transactions', 'all'); setMobileSidebarOpen(false); }}
          >
            <ArrowLeftRight />
            <span>Transactions</span>
          </button>
          <button 
            className={`menu-item ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => { setActiveTab('budgets'); setMobileSidebarOpen(false); }}
          >
            <PieChart />
            <span>Budgets & Goals</span>
          </button>
          <button 
            className={`menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
          >
            <TrendingUp />
            <span>Analytics</span>
          </button>
        </nav>
        <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="theme-toggle" onClick={handleThemeToggle}>
            {theme === 'light' ? (
              <>
                <Moon className="moon-icon" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="sun-icon" />
                <span>Light Mode</span>
              </>
            )}
          </button>
          <div className="sidebar-copyright" style={{ fontSize: '10.5px', textAlign: 'center', color: 'var(--text-muted)', opacity: 0.55, lineHeight: '1.4', fontFamily: 'var(--font-secondary)' }}>
            © 2026 Divyanshu Verma.<br />All rights reserved.
          </div>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="app-main">
        <header className="app-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileSidebarOpen(prev => !prev)}
              aria-label="Toggle Navigation"
            >
              <Menu />
            </button>
            <h1>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'transactions' && 'Transactions Ledger'}
              {activeTab === 'budgets' && 'Budgets & Savings Goals'}
              {activeTab === 'analytics' && 'Financial Analytics'}
            </h1>
          </div>
          <div className="header-right">
            {isLocalStorageMode && (
              <span className="badge-offline" style={{ fontSize: '11px', fontWeight: 'bold', padding: '6px 10px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Offline Mode
              </span>
            )}
            <div className="currency-selector-wrapper">
              <label htmlFor="curr-select" className="sr-only">Currency</label>
              <select 
                id="curr-select"
                className="select-input currency-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="₹">INR (₹)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => { setActiveTx(null); setTxModalOpen(true); }}>
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          {activeTab === 'dashboard' && (
            <Dashboard 
              transactions={state.transactions}
              budgets={state.budgets}
              savingsGoals={state.savingsGoals}
              currency={currency}
              theme={theme}
              onAddTransactionClick={() => { setActiveTx(null); setTxModalOpen(true); }}
              onNavigateToTab={setActiveTab}
              onDeleteTransaction={handleDeleteTransaction}
              categoryIconsMap={getCategoryIconsMap}
              showToast={showToast}
              localIp={state.settings?.localIp}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsLedger 
              transactions={state.transactions}
              categories={CATEGORIES}
              currency={currency}
              categoryIconsMap={getCategoryIconsMap}
              initialCategoryFilter={initialCategoryFilter}
              onClearInitialFilter={() => setInitialCategoryFilter('all')}
              onAddTransactionClick={() => { setActiveTx(null); setTxModalOpen(true); }}
              onEditTransactionClick={(tx) => { setActiveTx(tx); setTxModalOpen(true); }}
              onDeleteTransaction={handleDeleteTransaction}
              onExportData={() => {
                const dataStr = JSON.stringify(state, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const link = document.createElement('a');
                link.setAttribute('href', dataUri);
                link.setAttribute('download', `apexbudget_backup_${new Date().toISOString().split('T')[0]}.json`);
                link.click();
                showToast('JSON backup file downloaded successfully.');
              }}
              onImportClick={() => setImportModalOpen(true)}
              onClearData={handleResetApplication}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsGoals 
              transactions={state.transactions}
              budgets={state.budgets}
              savingsGoals={state.savingsGoals}
              categories={CATEGORIES}
              currency={currency}
              categoryIconsMap={getCategoryIconsMap}
              onConfigureBudgetsClick={() => setBudgetModalOpen(true)}
              onAddSavingsGoalClick={() => { setActiveGoal(null); setGoalModalOpen(true); }}
              onEditSavingsGoalClick={(goal) => { setActiveGoal(goal); setGoalModalOpen(true); }}
              onDeleteSavingsGoal={handleDeleteSavingsGoal}
              onAdjustSavingsGoalClick={(goal) => { setActiveContribGoal(goal); setContribModalOpen(true); }}
              onNavigateToTransactions={handleNavigateWithFilter}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics 
              transactions={state.transactions}
              budgets={state.budgets}
              categories={CATEGORIES}
              currency={currency}
              theme={theme}
            />
          )}
        </div>
      </main>

      {/* Floating Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map(toast => {
          let ToastIcon = CheckCircle;
          if (toast.type === 'error') ToastIcon = AlertTriangle;
          if (toast.type === 'warning') ToastIcon = Info;
          return (
            <div className={`toast toast-${toast.type}`} key={toast.id}>
              <ToastIcon size={18} />
              <span>{toast.message}</span>
              <button 
                onClick={() => removeToast(toast.id)} 
                style={{ cursor: 'pointer', opacity: 0.7, paddingLeft: '8px' }}
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modals Container */}
      <TransactionModal 
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={activeTx}
        categories={CATEGORIES}
        currency={currency}
      />

      <BudgetModal 
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudgets}
        budgets={state.budgets}
        categories={CATEGORIES}
        currency={currency}
      />

      <SavingsGoalModal 
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleSaveSavingsGoal}
        goal={activeGoal}
        currency={currency}
      />

      <ContributeModal 
        isOpen={contribModalOpen}
        onClose={() => setContribModalOpen(false)}
        onSave={handleAdjustSavingsGoal}
        goal={activeContribGoal}
        currency={currency}
      />

      <ImportModal 
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSave={handleImportBackup}
      />
    </div>
  );
}
