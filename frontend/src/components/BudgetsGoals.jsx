import React from 'react';
import { Sliders, Plus, Calendar, PlusCircle, Edit2, Trash2, Target, Eye } from 'lucide-react';

export default function BudgetsGoals({
  transactions,
  budgets,
  savingsGoals,
  categories,
  currency,
  categoryIconsMap,
  onConfigureBudgetsClick,
  onAddSavingsGoalClick,
  onEditSavingsGoalClick,
  onDeleteSavingsGoal,
  onAdjustSavingsGoalClick,
  onNavigateToTransactions
}) {

  // Calculate current month category spending
  const getCurrentMonthSpending = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const totals = {};

    categories.expense.forEach(cat => {
      totals[cat] = 0;
    });

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && tx.type === 'expense') {
        if (totals[tx.category] !== undefined) {
          totals[tx.category] += tx.amount;
        }
      }
    });

    return totals;
  };

  const spending = getCurrentMonthSpending();
  const formatVal = (val) => {
    const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${currency}${absVal}` : `${currency}${absVal}`;
  };

  // Sort: configured budgets first (ordered by utilization), then alphabetical for the rest
  const sortedCategories = [...categories.expense].sort((a, b) => {
    const budgetA = budgets[a] || 0;
    const budgetB = budgets[b] || 0;

    if (budgetA > 0 && budgetB === 0) return -1;
    if (budgetB > 0 && budgetA === 0) return 1;
    if (budgetA > 0 && budgetB > 0) {
      const utilA = spending[a] / budgetA;
      const utilB = spending[b] / budgetB;
      return utilB - utilA; 
    }
    return a.localeCompare(b);
  });

  return (
    <div className="tab-view">
      <div className="budgets-layout">
        
        {/* Left Column: Category Budgets */}
        <div className="glass-card category-budgets-card">
          <div className="card-header flex-header">
            <div>
              <h3>Monthly Budgets</h3>
              <span className="card-subtitle">Define spending limits per category (Click card to view transactions)</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={onConfigureBudgetsClick}>
              <Sliders size={14} /> Configure Limits
            </button>
          </div>

          <div className="budgets-grid">
            {sortedCategories.map(cat => {
              const iconConf = categoryIconsMap(cat);
              const IconComponent = iconConf.icon;
              const spent = spending[cat] || 0;
              const limit = budgets[cat] || 0;

              let progressFillWidth = 0;
              let progressClass = '';
              let footerText = 'No monthly limit configured';

              if (limit > 0) {
                const percentage = Math.round((spent / limit) * 100);
                progressFillWidth = Math.min(100, percentage);
                
                if (percentage >= 100) {
                  progressClass = 'danger';
                  footerText = (
                    <span className="text-rose font-semibold">
                      Exceeded by {formatVal(spent - limit)} ({percentage}%)
                    </span>
                  );
                } else if (percentage >= 80) {
                  progressClass = 'warning';
                  footerText = (
                    <span className="text-amber font-semibold">
                      Approaching limit ({percentage}%)
                    </span>
                  );
                } else {
                  footerText = `${formatVal(limit - spent)} remaining (${percentage}%)`;
                }
              }

              return (
                <div 
                  className="budget-item" 
                  key={cat}
                  onClick={() => onNavigateToTransactions('transactions', cat)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                  title="Click to view category transactions"
                >
                  <div className="budget-item-header">
                    <div className="budget-item-title">
                      <div 
                        className="tx-category-icon" 
                        style={{ backgroundColor: `${iconConf.color}15`, color: iconConf.color }}
                      >
                        <IconComponent size={18} />
                      </div>
                      <h4>{cat}</h4>
                    </div>
                    <div className="budget-amounts">
                      Spent: <span>{formatVal(spent)}</span>
                      {limit > 0 && <> / <span>{formatVal(limit)}</span></>}
                    </div>
                  </div>

                  {limit > 0 && (
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar-fill ${progressClass}`} 
                        style={{ width: `${progressFillWidth}%` }}
                      ></div>
                    </div>
                  )}

                  <div className="budget-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{footerText}</span>
                    <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-indigo)' }}>
                      <Eye size={12} /> View Ledger
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Savings Goals */}
        <div className="glass-card savings-goals-card">
          <div className="card-header flex-header">
            <div>
              <h3>Savings Goals</h3>
              <span className="card-subtitle">Stash cash away for specific targets</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onAddSavingsGoalClick}>
              <Plus size={14} /> Create Goal
            </button>
          </div>

          <div className="goals-grid">
            {savingsGoals.length > 0 ? (
              savingsGoals.map(goal => {
                const target = goal.target;
                const current = goal.current;
                const percent = Math.min(100, Math.round((current / target) * 100));

                // Circle calculations
                const radius = 36;
                const circumference = 2 * Math.PI * radius; 
                const strokeOffset = circumference - (percent / 100) * circumference;

                const dateFormatted = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'No deadline';

                return (
                  <div className="goal-card-detailed" key={goal.id}>
                    <div className="goal-card-left">
                      <div className="goal-title-wrapper">
                        <span 
                          style={{ 
                            display: 'inline-block', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            backgroundColor: goal.color 
                          }}
                        ></span>
                        <h4>{goal.title}</h4>
                      </div>
                      <div className="goal-stats">
                        <span className="amount-saved">{formatVal(current)}</span> saved of {formatVal(target)}
                      </div>
                      <div className="goal-target-date">
                        <Calendar size={14} />
                        <span>Target: {dateFormatted}</span>
                      </div>
                      <div className="goal-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => onAdjustSavingsGoalClick(goal)}>
                          <PlusCircle size={14} /> Adjust
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => onEditSavingsGoalClick(goal)}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className="tx-action-btn text-rose" onClick={() => onDeleteSavingsGoal(goal.id)} aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="goal-progress-circle">
                      <svg>
                        <circle className="circle-bg" cx="40" cy="40" r={radius}></circle>
                        <circle 
                          className="circle-fill" 
                          cx="40" 
                          cy="40" 
                          r={radius}
                          style={{ 
                            stroke: goal.color, 
                            strokeDashoffset: strokeOffset, 
                            strokeDasharray: circumference 
                          }}
                        ></circle>
                      </svg>
                      <span className="circle-pct" style={{ color: goal.color }}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <Target className="empty-icon" size={48} />
                <p>No savings goals set. Create one above!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
