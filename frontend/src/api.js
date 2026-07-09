/* ----------------------------------------------------
   APEXBUDGET FRONTEND API CONNECTOR SERVICE
   ---------------------------------------------------- */
const BASE_URL = `http://${window.location.hostname}:8080/api`;

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Request failed on ${endpoint}:`, error);
    throw error;
  }
}

export const Api = {
  getState: () => request('/state'),
  saveTransaction: (tx) => request('/transactions', 'POST', tx),
  deleteTransaction: (id) => request(`/transactions/${id}`, 'DELETE'),
  saveBudgets: (budgets) => request('/budgets', 'POST', budgets),
  saveSavingsGoal: (goal) => request('/goals', 'POST', goal),
  deleteSavingsGoal: (id) => request(`/goals/${id}`, 'DELETE'),
  adjustSavingsGoal: (id, type, amount) => request(`/goals/${id}/contrib`, 'POST', { type, amount }),
  importState: (state) => request('/state/import', 'POST', state),
  setCurrency: (currency) => request('/settings/currency', 'POST', { currency }),
  resetState: () => request('/state/reset', 'POST')
};
