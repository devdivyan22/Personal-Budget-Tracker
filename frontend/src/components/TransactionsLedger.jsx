import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Download, Upload, Trash2, Edit2, Calendar, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TransactionsLedger({
  transactions,
  categories,
  currency,
  categoryIconsMap,
  initialCategoryFilter,
  onClearInitialFilter,
  onAddTransactionClick,
  onEditTransactionClick,
  onDeleteTransaction,
  onExportData,
  onImportClick,
  onClearData
}) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // State to track expanded row ID for inline detailed drawers
  const [expandedTxId, setExpandedTxId] = useState(null);

  // Sync category filter from other tabs (like clicking on a budget card)
  useEffect(() => {
    if (initialCategoryFilter && initialCategoryFilter !== 'all') {
      setCategory(initialCategoryFilter);
      onClearInitialFilter(); // Clear so it doesn't lock
    }
  }, [initialCategoryFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedTxId(null); // Close drawers
  }, [search, type, category, dateRange, startDate, endDate, sortBy]);

  const getCategoryOptions = () => {
    if (type === 'all') {
      return [...categories.income, ...categories.expense];
    } else if (type === 'income') {
      return categories.income;
    } else {
      return categories.expense;
    }
  };

  const handleTypeChange = (val) => {
    setType(val);
    setCategory('all');
  };

  const handleRowClick = (id) => {
    setExpandedTxId(prev => prev === id ? null : id);
  };

  // Filter and Sort Calculations
  const getFilteredTransactions = () => {
    return transactions
      .filter(tx => {
        if (search) {
          const query = search.toLowerCase();
          const titleMatch = tx.title.toLowerCase().includes(query);
          const notesMatch = tx.notes && tx.notes.toLowerCase().includes(query);
          const categoryMatch = tx.category.toLowerCase().includes(query);
          if (!titleMatch && !notesMatch && !categoryMatch) return false;
        }

        if (type !== 'all' && tx.type !== type) return false;

        if (category !== 'all' && tx.category !== category) return false;

        if (dateRange !== 'all') {
          const txDate = new Date(tx.date);
          const now = new Date();

          if (dateRange === 'this-month') {
            if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
          } else if (dateRange === 'last-month') {
            const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            if (txDate.getMonth() !== lastMonth || txDate.getFullYear() !== lastMonthYear) return false;
          } else if (dateRange === 'this-year') {
            if (txDate.getFullYear() !== now.getFullYear()) return false;
          } else if (dateRange === 'custom') {
            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              if (txDate < start) return false;
            }
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (txDate > end) return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'date-asc') {
          return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'amount-desc') {
          return Number(b.amount) - Number(a.amount);
        } else if (sortBy === 'amount-asc') {
          return Number(a.amount) - Number(b.amount);
        } else if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  };

  const filtered = getFilteredTransactions();
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  
  const startIdx = (currentPage - 1) * pageSize;
  const pageSlice = filtered.slice(startIdx, startIdx + pageSize);

  const formatVal = (val) => {
    const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val < 0 ? `-${currency}${absVal}` : `${currency}${absVal}`;
  };

  return (
    <div className="tab-view">
      <div className="transactions-layout">
        {/* Left Side: Filter Sidebar */}
        <div className="glass-card filter-card">
          <h3>Filters & Tools</h3>
          
          <div className="filter-group">
            <label htmlFor="f-search">Search Description</label>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                id="f-search" 
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="f-type">Transaction Type</label>
            <select 
              id="f-type" 
              className="select-input"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="f-category">Category</label>
            <select 
              id="f-category" 
              className="select-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {getCategoryOptions().map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="f-range">Date Range</label>
            <select 
              id="f-range" 
              className="select-input"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="filter-group date-inputs-group">
              <div className="date-input-half">
                <label htmlFor="f-start">From</label>
                <input 
                  type="date" 
                  id="f-start" 
                  className="date-input" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-half">
                <label htmlFor="f-end">To</label>
                <input 
                  type="date" 
                  id="f-end" 
                  className="date-input" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="filter-group">
            <label htmlFor="f-sort">Sort By</label>
            <select 
              id="f-sort" 
              className="select-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="amount-desc">Amount (Highest First)</option>
              <option value="amount-asc">Amount (Lowest First)</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>

          <div className="actions-group">
            <button className="btn btn-outline w-full" onClick={onExportData}>
              <Download size={15} /> Export Data (JSON)
            </button>
            <button className="btn btn-outline w-full" onClick={onImportClick}>
              <Upload size={15} /> Import Data
            </button>
            <button className="btn btn-danger-outline w-full" onClick={onClearData}>
              <Trash2 size={15} /> Reset Application
            </button>
          </div>
        </div>

        {/* Right Side: Ledger Table */}
        <div className="glass-card transactions-table-card">
          <div className="card-header flex-header">
            <div>
              <h3>Transaction History</h3>
              <span className="card-subtitle">Showing {totalRecords} record{totalRecords === 1 ? '' : 's'} (Click rows to expand details)</span>
            </div>
            <button className="btn btn-primary" onClick={() => onAddTransactionClick()}>
              <Plus size={16} /> Add Transaction
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length > 0 ? (
                  pageSlice.map(tx => {
                    const iconConf = categoryIconsMap(tx.category);
                    const IconComponent = iconConf.icon;
                    const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    const isExpanded = expandedTxId === tx.id;

                    return (
                      <React.Fragment key={tx.id}>
                        <tr 
                          onClick={() => handleRowClick(tx.id)}
                          style={{ cursor: 'pointer' }}
                          className={isExpanded ? 'row-expanded-highlight' : ''}
                        >
                          <td style={{ whiteSpace: 'nowrap' }}>{formattedDate}</td>
                          <td>
                            <div className="tx-compact-left">
                              <div 
                                className="tx-category-icon" 
                                style={{ backgroundColor: `${iconConf.color}20`, color: iconConf.color }}
                              >
                                <IconComponent size={18} />
                              </div>
                              <div>
                                <div className="tx-title">{tx.title}</div>
                                {tx.notes && <div className="tx-meta" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.notes}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {tx.category}
                            </span>
                          </td>
                          <td className={`text-right font-semibold ${tx.type === 'income' ? 'text-emerald' : 'text-rose'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatVal(tx.amount)}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="table-actions">
                              <button 
                                className="tx-action-btn" 
                                onClick={() => onEditTransactionClick(tx)} 
                                aria-label="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                className="tx-action-btn text-rose" 
                                onClick={() => onDeleteTransaction(tx.id)} 
                                aria-label="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr onClick={() => handleRowClick(tx.id)} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                            <td colSpan="5" style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: `3px solid ${tx.type === 'income' ? 'var(--color-emerald)' : 'var(--color-rose)'}`, paddingLeft: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    <Calendar size={14} />
                                    <span>Recorded Date: {formattedDate}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {tx.type === 'income' ? <ArrowUpRight size={14} className="text-emerald" /> : <ArrowDownRight size={14} className="text-rose" />}
                                    <span>Type: <strong style={{ textTransform: 'capitalize', color: tx.type === 'income' ? 'var(--color-emerald)' : 'var(--color-rose)' }}>{tx.type}</strong></span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    ID: <code>{tx.id}</code>
                                  </div>
                                </div>
                                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                                  <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                    Notes & Description
                                  </strong>
                                  <p style={{ color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                                    {tx.notes ? tx.notes : 'No extra notes recorded for this transaction. Edit this transaction to add context.'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div className="empty-state">
                        <Search className="empty-icon" size={48} />
                        <p>No transactions match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="btn btn-icon" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="btn btn-icon" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
