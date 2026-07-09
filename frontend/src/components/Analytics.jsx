import React, { useState } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  RadialLinearScale, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  RadialLinearScale, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

export default function Analytics({ transactions, budgets, categories, currency, theme }) {
  const [timeframe, setTimeframe] = useState('year');

  const monthsCount = timeframe === 'three-months' ? 3 : timeframe === 'six-months' ? 6 : 12;

  // 1. Calculations: Monthly Data ( chronologically back N months )
  const getMonthlyFlows = () => {
    const now = new Date();
    const months = [];
    const incomes = [];
    const expenses = [];
    const savingsTrend = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear(),
        year: d.getFullYear(),
        month: d.getMonth()
      });
      incomes.push(0);
      expenses.push(0);
      savingsTrend.push(0);
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

    // Calculate accumulative savings including prior balance
    let accumulative = 0;
    const rangeStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate < rangeStartDate) {
        if (tx.type === 'income') accumulative += tx.amount;
        else accumulative -= tx.amount;
      }
    });

    months.forEach((m, idx) => {
      const monthlyNet = incomes[idx] - expenses[idx];
      accumulative += monthlyNet;
      savingsTrend[idx] = accumulative;
    });

    return {
      labels: months.map(m => m.label),
      incomes,
      expenses,
      savingsTrend
    };
  };

  // 2. Calculations: Category Totals for chosen timeframe
  const getCategoryRadarData = () => {
    const totals = {};
    categories.expense.forEach(cat => {
      totals[cat] = 0;
    });

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate >= startDate && tx.type === 'expense') {
        if (totals[tx.category] !== undefined) {
          totals[tx.category] += tx.amount;
        }
      }
    });

    const labels = [];
    const data = [];
    categories.expense.forEach(cat => {
      labels.push(cat);
      data.push(totals[cat] || 0);
    });

    return { labels, data };
  };

  const flows = getMonthlyFlows();
  const radarData = getCategoryRadarData();

  const rangeIncome = flows.incomes.reduce((a, b) => a + b, 0);
  const rangeExpense = flows.expenses.reduce((a, b) => a + b, 0);
  const rangeNet = rangeIncome - rangeExpense;

  const formatVal = (val) => {
    const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${currency}${absVal}` : `${currency}${absVal}`;
  };

  // Styles configuration depending on theme
  const isLight = theme === 'light';
  const textClr = isLight ? '#64748b' : '#9ca3af';
  const gridClr = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
  const tooltipBg = isLight ? '#ffffff' : '#111827';
  const tooltipBorder = isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.08)';
  const tooltipText = isLight ? '#1e293b' : '#f3f4f6';

  const lineChartData = {
    labels: flows.labels,
    datasets: [
      {
        label: 'Net Balance Trend',
        data: flows.savingsTrend,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointHoverRadius: 7
      },
      {
        label: 'Income',
        data: flows.incomes,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        tension: 0.3,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      },
      {
        label: 'Expenses',
        data: flows.expenses,
        borderColor: '#f43f5e',
        backgroundColor: 'transparent',
        tension: 0.3,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
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
      x: { grid: { color: gridClr }, ticks: { color: textClr } },
      y: {
        grid: { color: gridClr },
        ticks: {
          color: textClr,
          callback: (val) => formatVal(val).split('.')[0]
        }
      }
    }
  };

  const radarChartData = {
    labels: radarData.labels,
    datasets: [{
      label: 'Outflows',
      data: radarData.data,
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#6366f1',
      pointHoverRadius: 6
    }]
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.label}: ${formatVal(context.raw)}`
        }
      }
    },
    scales: {
      r: {
        angleLines: { color: gridClr },
        grid: { color: gridClr },
        pointLabels: { color: textClr, font: { size: 10 } },
        ticks: {
          display: false,
          color: textClr,
          backdropColor: 'transparent'
        }
      }
    }
  };

  const hasOutflowData = radarData.data.some(val => val > 0);

  return (
    <div className="tab-view">
      <div className="analytics-layout">
        
        {/* Period Selector Filter Bar */}
        <div className="glass-card analytics-filters-card">
          <div className="filters-row">
            <div className="filter-item">
              <label htmlFor="a-period">Analysis Period</label>
              <select 
                id="a-period" 
                className="select-input"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="year">Current Year</option>
                <option value="six-months">Last 6 Months</option>
                <option value="three-months">Last 3 Months</option>
              </select>
            </div>
            <div className="filter-item-right">
              Period Totals:&nbsp;
              Income: <span className="text-emerald">{formatVal(rangeIncome)}</span> |&nbsp;
              Expense: <span className="text-rose">{formatVal(rangeExpense)}</span> |&nbsp;
              Net: <span className={rangeNet >= 0 ? 'text-emerald' : 'text-rose'}>{formatVal(rangeNet)}</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="charts-grid-2 mt-6" style={{ marginTop: '24px' }}>
          <div className="glass-card chart-container-large">
            <div className="card-header">
              <h3>Financial Trends</h3>
              <span className="card-subtitle">Monthly flow of income, expense, and accumulative savings</span>
            </div>
            <div className="chart-wrapper-large">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="glass-card chart-container-large">
            <div className="card-header">
              <h3>Cumulative Categories Breakdown</h3>
              <span className="card-subtitle">Total money spent across selected period</span>
            </div>
            <div className="chart-wrapper-large">
              {hasOutflowData ? (
                <Radar data={radarChartData} options={radarChartOptions} />
              ) : (
                <div className="empty-state" style={{ height: '100%', minHeight: '300px' }}>
                  <p>No expenses recorded in the selected period.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid Statistics Table */}
        <div className="glass-card mt-6" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3>Category Statistics Breakdown</h3>
            <span className="card-subtitle">Aggregated totals, averages, and budget utilization rates</span>
          </div>
          <div className="table-responsive" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Total Outflow</th>
                  <th className="text-right">Monthly Average</th>
                  <th className="text-right">Configured Budget</th>
                  <th className="text-right">Utilization Rate</th>
                </tr>
              </thead>
              <tbody>
                {hasOutflowData || Object.keys(budgets).length > 0 ? (
                  categories.expense
                    .filter(cat => radarData.data[categories.expense.indexOf(cat)] > 0 || budgets[cat] > 0)
                    .map(cat => {
                      const idx = categories.expense.indexOf(cat);
                      const totalOutflow = radarData.data[idx] || 0;
                      const monthlyAverage = totalOutflow / monthsCount;
                      const limit = budgets[cat] || 0;

                      let budgetText = '-';
                      let utilizationText = '-';
                      let utilizationClass = 'text-muted';

                      if (limit > 0) {
                        budgetText = formatVal(limit);
                        const rate = Math.round((monthlyAverage / limit) * 100);
                        utilizationText = `${rate}%`;

                        if (rate > 100) {
                          utilizationClass = 'text-rose font-bold';
                        } else if (rate > 85) {
                          utilizationClass = 'text-amber font-semibold';
                        } else {
                          utilizationClass = 'text-emerald';
                        }
                      }

                      return (
                        <tr key={cat}>
                          <td>{cat}</td>
                          <td className="text-right font-semibold">{formatVal(totalOutflow)}</td>
                          <td className="text-right">{formatVal(monthlyAverage)}</td>
                          <td className="text-right text-muted">{budgetText}</td>
                          <td className={`text-right ${utilizationClass}`}>{utilizationText}</td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No expenses recorded and no budgets set for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
