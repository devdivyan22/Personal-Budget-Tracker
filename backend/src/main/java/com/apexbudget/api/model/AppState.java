package com.apexbudget.api.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AppState {
    private List<Transaction> transactions = new ArrayList<>();
    private Map<String, Double> budgets = new HashMap<>();
    private List<SavingsGoal> savingsGoals = new ArrayList<>();
    private Map<String, String> settings = new HashMap<>();

    public AppState() {
        // Initialize settings with defaults
        settings.put("currency", "$");
        settings.put("theme", "dark");
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    public Map<String, Double> getBudgets() {
        return budgets;
    }

    public void setBudgets(Map<String, Double> budgets) {
        this.budgets = budgets;
    }

    public List<SavingsGoal> getSavingsGoals() {
        return savingsGoals;
    }

    public void setSavingsGoals(List<SavingsGoal> savingsGoals) {
        this.savingsGoals = savingsGoals;
    }

    public Map<String, String> getSettings() {
        return settings;
    }

    public void setSettings(Map<String, String> settings) {
        this.settings = settings;
    }
}
