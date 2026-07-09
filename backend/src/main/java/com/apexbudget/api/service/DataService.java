package com.apexbudget.api.service;

import com.apexbudget.api.model.AppState;
import com.apexbudget.api.model.SavingsGoal;
import com.apexbudget.api.model.Transaction;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DataService {
    private static final String FILE_PATH = "./data.json";
    private final ObjectMapper objectMapper;
    private AppState state;

    public DataService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        loadData();
    }

    public synchronized AppState getState() {
        return this.state;
    }

    public synchronized void saveState() {
        try {
            objectMapper.writeValue(new File(FILE_PATH), this.state);
        } catch (IOException e) {
            System.err.println("Error writing data to file: " + e.getMessage());
        }
    }

    private void loadData() {
        File file = new File(FILE_PATH);
        if (file.exists()) {
            try {
                this.state = objectMapper.readValue(file, AppState.class);
                return;
            } catch (IOException e) {
                System.err.println("Error reading data file, re-initializing: " + e.getMessage());
            }
        }
        // Initialize and seed data if file not found
        initializeDefaultData();
    }

    public synchronized void resetState() {
        this.state = new AppState();
        saveState();
    }

    private void initializeDefaultData() {
        this.state = new AppState();
        LocalDate now = LocalDate.now();

        // 1. Transactions seed
        List<Transaction> txs = new ArrayList<>();
        txs.add(new Transaction("1", "Monthly Salary", 4500.0, "Salary", now.minusDays(25).toString(), "income", "Main employer salary"));
        txs.add(new Transaction("2", "Apartment Rent", 1200.0, "Housing", now.minusDays(24).toString(), "expense", "Monthly rent auto-pay"));
        txs.add(new Transaction("3", "Weekly Groceries", 165.40, "Food", now.minusDays(22).toString(), "expense", "Whole Foods trip"));
        txs.add(new Transaction("4", "Freelance Design Project", 850.0, "Freelance", now.minusDays(18).toString(), "income", "Logo design project client payment"));
        txs.add(new Transaction("5", "Electricity & Gas Bill", 145.20, "Utilities", now.minusDays(15).toString(), "expense", "Grid Utility co"));
        txs.add(new Transaction("6", "Dinner with friends", 82.50, "Entertainment", now.minusDays(12).toString(), "expense", "Thai Restaurant"));
        txs.add(new Transaction("7", "Gas Station Refuel", 45.00, "Transportation", now.minusDays(10).toString(), "expense", ""));
        txs.add(new Transaction("8", "Online Course Subscription", 29.99, "Education", now.minusDays(8).toString(), "expense", "Self development course"));
        txs.add(new Transaction("9", "Dividends Payout", 125.00, "Investments", now.minusDays(5).toString(), "income", "Stock dividends"));
        txs.add(new Transaction("10", "Sneakers Purchase", 110.00, "Shopping", now.minusDays(3).toString(), "expense", "Nike Store sale"));
        txs.add(new Transaction("11", "Pharmacy prescriptions", 35.00, "Healthcare", now.minusDays(2).toString(), "expense", "Prescription refill"));
        txs.add(new Transaction("12", "Gym Membership", 50.00, "Entertainment", now.minusDays(1).toString(), "expense", ""));
        this.state.setTransactions(txs);

        // 2. Budgets seed
        Map<String, Double> budgets = new HashMap<>();
        budgets.put("Food", 400.0);
        budgets.put("Housing", 1300.0);
        budgets.put("Utilities", 200.0);
        budgets.put("Transportation", 150.0);
        budgets.put("Entertainment", 250.0);
        budgets.put("Shopping", 200.0);
        budgets.put("Healthcare", 100.0);
        this.state.setBudgets(budgets);

        // 3. Savings Goals seed
        List<SavingsGoal> goals = new ArrayList<>();
        goals.add(new SavingsGoal("g1", "Emergency Fund", 5000.0, 2800.0, "2026-12-31", "#10b981"));
        goals.add(new SavingsGoal("g2", "Europe Vacation", 3500.0, 1200.0, "2027-06-30", "#3b82f6"));
        goals.add(new SavingsGoal("g3", "Gaming Laptop", 1500.0, 1500.0, "2026-08-15", "#8b5cf6"));
        this.state.setSavingsGoals(goals);

        // 4. Default Settings
        Map<String, String> settings = new HashMap<>();
        settings.put("currency", "$");
        settings.put("theme", "dark");
        this.state.setSettings(settings);

        saveState();
    }
}
