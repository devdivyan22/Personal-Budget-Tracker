import React, { useState, useEffect, useRef } from 'react';
import { X, FileUp, FileCheck, AlertTriangle } from 'lucide-react';

export function TransactionModal({ isOpen, onClose, onSave, transaction, categories, currency }) {
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setType(transaction.type);
        setDate(transaction.date);
        setTitle(transaction.title);
        setAmount(transaction.amount);
        setCategory(transaction.category);
        setNotes(transaction.notes || '');
      } else {
        setType('expense');
        setDate(new Date().toISOString().split('T')[0]);
        setTitle('');
        setAmount('');
        setCategory(categories.expense[0] || '');
        setNotes('');
      }
    }
  }, [isOpen, transaction, categories]);

  // Adjust category when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(categories[newType][0] || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !category || !date) return;

    onSave({
      id: transaction?.id || '',
      type,
      date,
      title: title.trim(),
      amount: Number(amount),
      category,
      notes: notes.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group w-half">
              <label>Type</label>
              <div className="type-toggle-group">
                <input
                  type="radio"
                  name="modal-tx-type"
                  id="m-type-expense"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={() => handleTypeChange('expense')}
                />
                <label htmlFor="m-type-expense" className="toggle-btn toggle-expense">Expense</label>

                <input
                  type="radio"
                  name="modal-tx-type"
                  id="m-type-income"
                  value="income"
                  checked={type === 'income'}
                  onChange={() => handleTypeChange('income')}
                />
                <label htmlFor="m-type-income" className="toggle-btn toggle-income">Income</label>
              </div>
            </div>
            <div className="form-group w-half">
              <label htmlFor="m-tx-date">Date <span className="required">*</span></label>
              <input
                type="date"
                id="m-tx-date"
                required
                className="text-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="m-tx-title">Description <span className="required">*</span></label>
            <input
              type="text"
              id="m-tx-title"
              required
              className="text-input"
              placeholder="e.g. Weekly Groceries, Monthly Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group w-half">
              <label htmlFor="m-tx-amount">Amount <span className="required">*</span></label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">{currency}</span>
                <input
                  type="number"
                  id="m-tx-amount"
                  min="0.01"
                  step="0.01"
                  required
                  className="text-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group w-half">
              <label htmlFor="m-tx-category">Category <span className="required">*</span></label>
              <select
                id="m-tx-category"
                required
                className="select-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories[type].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="m-tx-notes">Notes (Optional)</label>
            <textarea
              id="m-tx-notes"
              className="textarea-input"
              placeholder="Any additional context..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BudgetModal({ isOpen, onClose, onSave, budgets, categories, currency }) {
  const [limits, setLimits] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialLimits = {};
      categories.expense.forEach(cat => {
        initialLimits[cat] = budgets[cat] || '';
      });
      setLimits(initialLimits);
    }
  }, [isOpen, budgets, categories]);

  const handleChange = (cat, val) => {
    setLimits(prev => ({ ...prev, [cat]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanBudgets = {};
    Object.keys(limits).forEach(cat => {
      const val = Number(limits[cat]);
      if (val > 0) {
        cleanBudgets[cat] = val;
      }
    });
    onSave(cleanBudgets);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Configure Budgets</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="form-desc-text">Set your maximum monthly spending limits per category. Set to 0 or leave blank to disable budget tracking.</p>
          <div className="budget-inputs-container">
            {categories.expense.map(cat => (
              <div className="budget-edit-row" key={cat}>
                <div className="budget-edit-label">
                  <span>{cat}</span>
                </div>
                <div className="amount-input-wrapper budget-edit-input">
                  <span className="currency-prefix" style={{ left: '10px', fontSize: '13px' }}>{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="text-input"
                    style={{ padding: '6px 8px 6px 22px', fontSize: '13px' }}
                    value={limits[cat]}
                    onChange={(e) => handleChange(cat, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Budgets</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SavingsGoalModal({ isOpen, onClose, onSave, goal, currency }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setTarget(goal.target);
        setCurrent(goal.current);
        setTargetDate(goal.targetDate || '');
        setColor(goal.color);
      } else {
        setTitle('');
        setTarget('');
        setCurrent('0');
        setTargetDate('');
        setColor('#6366f1');
      }
    }
  }, [isOpen, goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !target) return;

    onSave({
      id: goal?.id || '',
      title: title.trim(),
      target: Number(target),
      current: Number(current || 0),
      targetDate: targetDate || null,
      color
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{goal ? 'Edit Savings Goal' : 'Create Savings Goal'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="g-title">Goal Name <span className="required">*</span></label>
            <input
              type="text"
              id="g-title"
              required
              className="text-input"
              placeholder="e.g. New Macbook, Vacation Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group w-half">
              <label htmlFor="g-target">Target Amount <span className="required">*</span></label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">{currency}</span>
                <input
                  type="number"
                  id="g-target"
                  min="1"
                  required
                  className="text-input"
                  placeholder="0.00"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group w-half">
              <label htmlFor="g-current">Current Savings</label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">{currency}</span>
                <input
                  type="number"
                  id="g-current"
                  min="0"
                  className="text-input"
                  placeholder="0.00"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group w-half">
              <label htmlFor="g-date">Target Date (Optional)</label>
              <input
                type="date"
                id="g-date"
                className="text-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div className="form-group w-half">
              <label htmlFor="g-color">Theme Color</label>
              <select
                id="g-color"
                className="select-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                <option value="#6366f1">Indigo</option>
                <option value="#3b82f6">Blue</option>
                <option value="#10b981">Green</option>
                <option value="#f59e0b">Amber</option>
                <option value="#ec4899">Pink</option>
                <option value="#8b5cf6">Purple</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{goal ? 'Save Changes' : 'Create Goal'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContributeModal({ isOpen, onClose, onSave, goal, currency }) {
  const [type, setType] = useState('add');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType('add');
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return;

    if (type === 'withdraw' && val > goal.current) {
      alert('Insufficient funds in savings goal.');
      return;
    }

    onSave(goal.id, type, val);
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card modal-card-sm">
        <div className="modal-header">
          <h3>Adjust Savings Goal</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="form-desc-text">
            Transfer funds to or from <strong>{goal.title}</strong>.<br />
            Target: {currency}{goal.target.toLocaleString()} (Current: {currency}{goal.current.toLocaleString()})
          </p>

          <div className="form-group">
            <label>Adjust Type</label>
            <div className="type-toggle-group">
              <input
                type="radio"
                name="contrib-toggle"
                id="contrib-m-add"
                value="add"
                checked={type === 'add'}
                onChange={() => setType('add')}
              />
              <label htmlFor="contrib-m-add" className="toggle-btn toggle-income">Add Funds</label>

              <input
                type="radio"
                name="contrib-toggle"
                id="contrib-m-withdraw"
                value="withdraw"
                checked={type === 'withdraw'}
                onChange={() => setType('withdraw')}
              />
              <label htmlFor="contrib-m-withdraw" className="toggle-btn toggle-expense">Withdraw</label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contrib-m-amount">Amount <span className="required">*</span></label>
            <div className="amount-input-wrapper">
              <span className="currency-prefix">{currency}</span>
              <input
                type="number"
                id="contrib-m-amount"
                min="0.01"
                step="0.01"
                required
                className="text-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Apply</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ImportModal({ isOpen, onClose, onSave }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFileData(null);
      setFileName('');
      setErrorMsg(false);
      setDragActive(false);
    }
  }, [isOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.transactions || parsed.budgets || parsed.savingsGoals) {
          setFileData(parsed);
          setFileName(file.name);
          setErrorMsg(false);
        } else {
          throw new Error('Invalid JSON format');
        }
      } catch (err) {
        setFileData(null);
        setFileName('');
        setErrorMsg(true);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (fileData) {
      onSave(fileData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Import Backup Data</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body-content">
          <p className="form-desc-text">Upload a previously exported JSON backup file to overwrite current workspace records.</p>
          <div
            className={`file-drop-zone ${dragActive ? 'dragover' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {fileData ? (
              <>
                <FileCheck className="drop-icon text-emerald" size={38} />
                <p className="font-semibold text-emerald">{fileName}</p>
                <p className="font-medium text-muted">File parsed successfully. Click "Import & Restore" to finalize.</p>
              </>
            ) : (
              <>
                <FileUp className="drop-icon" size={38} />
                <p>Drag and drop your JSON backup file here, or click to browse.</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              className="hidden-file-input"
              onChange={handleFileChange}
            />
          </div>
          {errorMsg && (
            <div className="error-msg-banner">
              <AlertTriangle size={16} style={{ marginRight: '6px', display: 'inline' }} />
              Invalid backup file format. Must be a valid JSON file.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!fileData} onClick={handleImport}>Import & Restore</button>
        </div>
      </div>
    </div>
  );
}
