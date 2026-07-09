import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Wallet, TrendingUp, TrendingDown, Percent, Info, Target, Trash2, ShieldAlert, Sparkles, Award, Share2 } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

// Map of category configurations
const categoryIcons = {
  Food: { color: '#ff7a59' },
  Housing: { color: '#3b82f6' },
  Utilities: { color: '#38bdf8' },
  Transportation: { color: '#4b5563' },
  Entertainment: { color: '#a855f7' },
  Healthcare: { color: '#f43f5e' },
  Shopping: { color: '#ec4899' },
  Education: { color: '#6366f1' },
  Miscellaneous: { color: '#6b7280' },
  Salary: { color: '#10b981' },
  Freelance: { color: '#06b6d4' },
  Investments: { color: '#84cc16' },
  Gifts: { color: '#f59e0b' },
  Other: { color: '#14b8a6' }
};

export default function Dashboard({ 
  transactions, 
  budgets, 
  savingsGoals, 
  currency, 
  theme, 
  onAddTransactionClick,
  onNavigateToTab,
  onDeleteTransaction,
  categoryIconsMap,
  showToast,
  localIp
}) {
  
  // 1. Calculations for Metric Cards
  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach(tx => {
    if (tx.type === 'income') totalIncome += tx.amount;
    else totalExpense += tx.amount;
  });
  
  const totalBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  
  const formatVal = (val) => {
    const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${currency}${absVal}` : `${currency}${absVal}`;
  };

  // 2. Prepare Data for Bar Chart: Monthly Overview (Last 6 Months)
  const getMonthlyBarData = () => {
    const now = new Date();
    const months = [];
    const incomes = [];
    const expenses = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
        year: d.getFullYear(),
        month: d.getMonth()
      });
      incomes.push(0);
      expenses.push(0);
    }

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      months.forEach((m, idx) => {
        if (m.year === txYear && m.month === txMonth) {
          if (tx.type === 'income') incomes[idx] += tx.amount;
          else expenses[idx] += tx.amount;
        }
      });
    });

    return {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Income',
          data: incomes,
          backgroundColor: '#10b981',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.8,
          categoryPercentage: 0.6
        },
        {
          label: 'Expense',
          data: expenses,
          backgroundColor: '#f43f5e',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.8,
          categoryPercentage: 0.6
        }
      ]
    };
  };

  // 3. Prepare Data for Doughnut Chart: Expenses by Category (Current Month)
  const getCategoryDoughnutData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totals = {};

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && tx.type === 'expense') {
        totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
      }
    });

    const labels = [];
    const data = [];
    const backgroundColor = [];

    Object.keys(totals).forEach(cat => {
      if (totals[cat] > 0) {
        labels.push(cat);
        data.push(totals[cat]);
        backgroundColor.push(categoryIcons[cat]?.color || '#6366f1');
      }
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  };

  const doughnutData = getCategoryDoughnutData();
  const barData = getMonthlyBarData();

  // Chart configuration styles depending on theme
  const isLight = theme === 'light';
  const textClr = isLight ? '#64748b' : '#9ca3af';
  const gridClr = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
  const tooltipBg = isLight ? '#ffffff' : '#111827';
  const tooltipBorder = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.08)';
  const tooltipText = isLight ? '#1e293b' : '#f3f4f6';

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: textClr, usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatVal(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textClr } },
      y: {
        grid: { color: gridClr },
        ticks: {
          color: textClr,
          callback: (val) => formatVal(val).split('.')[0]
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: textClr, padding: 14, boxWidth: 10, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.label}: ${formatVal(context.parsed)}`
        }
      }
    }
  };

  // Recent 5 Transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Top 3 Savings Goals
  const topGoals = savingsGoals.slice(0, 3);

  // ----------------------------------------------------
  // PERSONALIZED FINANCIAL INSIGHTS WIDGET ENGINE
  // ----------------------------------------------------
  const generateInsights = () => {
    const insights = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Calculate current month category spending
    const monthlySpending = {};
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && tx.type === 'expense') {
        monthlySpending[tx.category] = (monthlySpending[tx.category] || 0) + tx.amount;
      }
    });

    // 1. Budget warnings
    Object.keys(budgets).forEach(cat => {
      const limit = budgets[cat];
      const spent = monthlySpending[cat] || 0;
      if (limit > 0) {
        const util = (spent / limit) * 100;
        if (util >= 100) {
          insights.push({
            id: `budget-exceeded-${cat}`,
            type: 'danger',
            icon: ShieldAlert,
            text: `Exceeded your ${cat} budget limit! Spent ${formatVal(spent)} of ${formatVal(limit)}.`
          });
        } else if (util >= 80) {
          insights.push({
            id: `budget-approaching-${cat}`,
            type: 'warning',
            icon: Info,
            text: `Approaching your ${cat} budget limit. Spent ${Math.round(util)}% (${formatVal(spent)} of ${formatVal(limit)}).`
          });
        }
      }
    });

    // 2. Savings rate feedback
    if (savingsRate > 25) {
      insights.push({
        id: 'savings-excellent',
        type: 'success',
        icon: Award,
        text: `Superb! Your current savings rate is ${savingsRate}%. You are building wealth rapidly this period.`
      });
    } else if (savingsRate < 0) {
      insights.push({
        id: 'savings-negative',
        type: 'danger',
        icon: ShieldAlert,
        text: `Negative cash flow warning! Your expenses exceed your income this month by ${formatVal(Math.abs(totalIncome - totalExpense))}.`
      });
    }

    // 3. Goal completed feedback
    savingsGoals.forEach(g => {
      if (g.current >= g.target) {
        insights.push({
          id: `goal-complete-${g.id}`,
          type: 'success',
          icon: Sparkles,
          text: `Congratulations! You've achieved your savings milestone: "${g.title}" by gathering ${formatVal(g.current)}!`
        });
      }
    });

    // 4. Missing budget limit advice
    const unbudgetedSpending = [];
    Object.keys(monthlySpending).forEach(cat => {
      if (!budgets[cat] && monthlySpending[cat] > 100) {
        unbudgetedSpending.push(cat);
      }
    });
    if (unbudgetedSpending.length > 0) {
      insights.push({
        id: 'missing-budgets',
        type: 'info',
        icon: Info,
        text: `Tip: You've spent money on ${unbudgetedSpending.slice(0, 2).join(' & ')} without a budget. Setting a limit helps restrict outflows.`
      });
    }

    // Default tip if list empty
    if (insights.length === 0) {
      insights.push({
        id: 'default-tip',
        type: 'info',
        icon: Sparkles,
        text: `Tip: Regularly export backups (via Transactions ledger tab) to archive your finance history safe.`
      });
    }

    return insights.slice(0, 3); // Return top 3 insights
  };

  const activeInsights = generateInsights();

  const handleShare = async () => {
    let shareUrl = window.location.href;
    
    // Fallback to local IP if resolved by Spring Boot and currently on localhost
    if (localIp && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      shareUrl = `http://${localIp}:5173/`;
    }

    const summaryText = `📊 ApexBudget Financial Summary\n-----------------------------------\n💰 Total Balance: ${formatVal(totalBalance)}\n📈 Total Income: ${formatVal(totalIncome)}\n📉 Total Expenses: ${formatVal(totalExpense)}\n🎯 Savings Rate: ${savingsRate >= 0 ? savingsRate : 0}%\n-----------------------------------\n🔗 Link: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ApexBudget Financial Summary',
          text: summaryText
          // Omit url field to prevent OS cloud scrapers from throwing Invalid Response errors on LAN IPs
        });
        showToast('Dashboard details shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(summaryText);
        }
      }
    } else {
      copyToClipboard(summaryText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('Financial summary copied to clipboard!');
      })
      .catch(() => {
        showToast('Could not copy summary to clipboard.', 'error');
      });
  };

  return (
    <div className="tab-view active">
      {/* Share Dashboard Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', marginTop: '-12px' }}>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={handleShare}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Share2 size={14} />
          <span>Share Dashboard Summary</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card balance-card">
          <div className="metric-info">
            <span className="metric-label">Total Balance</span>
            <h3 className={`metric-value ${totalBalance >= 0 ? '' : 'text-rose'}`}>
              {formatVal(totalBalance)}
            </h3>
          </div>
          <div className="metric-icon bg-blue-glow">
            <Wallet size={22} />
          </div>
        </div>

        <div className="metric-card income-card">
          <div className="metric-info">
            <span className="metric-label">Total Income</span>
            <h3 className="metric-value text-emerald">{formatVal(totalIncome)}</h3>
          </div>
          <div className="metric-icon bg-emerald-glow">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-info">
            <span className="metric-label">Total Expenses</span>
            <h3 className="metric-value text-rose">{formatVal(totalExpense)}</h3>
          </div>
          <div className="metric-icon bg-rose-glow">
            <TrendingDown size={22} />
          </div>
        </div>

        <div className="metric-card savings-card">
          <div className="metric-info">
            <span className="metric-label">Savings Rate</span>
            <h3 className={`metric-value ${savingsRate >= 0 ? 'text-amber' : 'text-rose'}`}>
              {savingsRate >= 0 ? savingsRate : 0}%
            </h3>
          </div>
          <div className="metric-icon bg-amber-glow">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* NEW: Personalized Financial Insights Widget */}
      <div className="glass-card" style={{ marginBottom: '32px', padding: '20px 28px' }}>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
            <Sparkles size={16} className="text-amber" />
            Apex AI Financial Insights
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {activeInsights.map(insight => {
            const InsightIcon = insight.icon;
            let themeClass = '';
            if (insight.type === 'danger') themeClass = 'rgba(244, 63, 94, 0.1)';
            else if (insight.type === 'warning') themeClass = 'rgba(245, 158, 11, 0.1)';
            else if (insight.type === 'success') themeClass = 'rgba(16, 185, 129, 0.1)';
            else themeClass = 'rgba(99, 102, 241, 0.1)';

            let textThemeColor = '';
            if (insight.type === 'danger') textThemeColor = 'var(--color-rose)';
            else if (insight.type === 'warning') textThemeColor = 'var(--color-amber)';
            else if (insight.type === 'success') textThemeColor = 'var(--color-emerald)';
            else textThemeColor = 'var(--color-indigo)';

            return (
              <div 
                key={insight.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: themeClass, 
                  border: `1px solid ${textThemeColor}20` 
                }}
              >
                <InsightIcon size={16} style={{ color: textThemeColor, marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-main)' }}>{insight.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid-2">
        <div className="glass-card chart-container">
          <div className="card-header">
            <h3>Monthly Overview</h3>
            <span className="card-subtitle">Income vs Expenses</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="glass-card chart-container">
          <div className="card-header">
            <h3>Expenses by Category</h3>
            <span className="card-subtitle">Current Month Distribution</span>
          </div>
          <div className="chart-wrapper">
            {doughnutData.datasets[0].data.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="empty-state" style={{ height: '100%', minHeight: '200px' }}>
                <Info className="empty-icon" />
                <p>No expenses recorded this month.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-grid-bottom">
        <div className="glass-card recent-transactions">
          <div className="card-header flex-header">
            <div>
              <h3>Recent Transactions</h3>
              <span className="card-subtitle">Your latest cash flows</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateToTab('transactions')}>
              View All
            </button>
          </div>
          <div className="transactions-list-compact">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(tx => {
                const iconConf = categoryIconsMap(tx.category);
                const IconComponent = iconConf.icon;
                const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
                return (
                  <div className="tx-compact-item" key={tx.id}>
                    <div className="tx-compact-left">
                      <div className="tx-category-icon" style={{ backgroundColor: `${iconConf.color}20`, color: iconConf.color }}>
                        <IconComponent size={18} />
                      </div>
                      <div className="tx-compact-details">
                        <span className="tx-title">{tx.title}</span>
                        <span className="tx-meta">{tx.category} • {formattedDate}</span>
                      </div>
                    </div>
                    <div className="tx-compact-right">
                      <span className={`tx-amount ${tx.type === 'income' ? 'text-emerald' : 'text-rose'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatVal(tx.amount)}
                      </span>
                      <button className="tx-action-btn" onClick={() => onDeleteTransaction(tx.id)} aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <Info className="empty-icon" />
                <p>No transactions added yet. Click "Add Transaction" to start!</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card savings-goals-widget">
          <div className="card-header flex-header">
            <div>
              <h3>Savings Goals</h3>
              <span className="card-subtitle">Tracking target targets</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateToTab('budgets')}>
              Manage
            </button>
          </div>
          <div className="goals-list-compact">
            {topGoals.length > 0 ? (
              topGoals.map(goal => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div className="budget-item" key={goal.id} style={{ padding: '14px', marginBottom: '8px' }}>
                    <div className="budget-item-header" style={{ marginBottom: '8px' }}>
                      <div className="budget-item-title">
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: goal.color, marginRight: '6px' }}></span>
                        <span className="font-semibold" style={{ fontSize: '14px' }}>{goal.title}</span>
                      </div>
                      <div className="budget-amounts" style={{ fontSize: '12px' }}>
                        <span>{formatVal(goal.current)}</span> / {formatVal(goal.target)}
                      </div>
                    </div>
                    <div className="progress-bar-container" style={{ height: '6px', marginBottom: 0 }}>
                      <div className="progress-bar-fill" style={{ width: `${percent}%`, background: goal.color }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <Target className="empty-icon" />
                <p>No savings goals set. Define one in the Budgets & Goals tab!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
