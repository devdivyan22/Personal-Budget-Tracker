package com.apexbudget.api.controller;

import com.apexbudget.api.model.AppState;
import com.apexbudget.api.model.SavingsGoal;
import com.apexbudget.api.model.Transaction;
import com.apexbudget.api.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ApiController {
    private final DataService dataService;

    public ApiController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping("/state")
    public ResponseEntity<AppState> getState() {
        AppState state = dataService.getState();
        try {
            String ip = java.net.InetAddress.getLocalHost().getHostAddress();
            state.getSettings().put("localIp", ip);
        } catch (Exception e) {
            state.getSettings().put("localIp", "localhost");
        }
        return ResponseEntity.ok(state);
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> saveTransaction(@RequestBody Transaction tx) {
        AppState state = dataService.getState();
        if (tx.getId() == null || tx.getId().trim().isEmpty()) {
            tx.setId(UUID.randomUUID().toString());
            state.getTransactions().add(tx);
        } else {
            // Edit mode
            int foundIdx = -1;
            for (int i = 0; i < state.getTransactions().size(); i++) {
                if (state.getTransactions().get(i).getId().equals(tx.getId())) {
                    foundIdx = i;
                    break;
                }
            }
            if (foundIdx > -1) {
                state.getTransactions().set(foundIdx, tx);
            } else {
                state.getTransactions().add(tx);
            }
        }
        dataService.saveState();
        return ResponseEntity.ok(tx);
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Map<String, String>> deleteTransaction(@PathVariable String id) {
        AppState state = dataService.getState();
        boolean removed = state.getTransactions().removeIf(tx -> tx.getId().equals(id));
        if (removed) {
            dataService.saveState();
            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/budgets")
    public ResponseEntity<Map<String, Double>> saveBudgets(@RequestBody Map<String, Double> budgets) {
        AppState state = dataService.getState();
        // Clear all entries first and re-populate
        state.getBudgets().clear();
        budgets.forEach((category, limit) -> {
            if (limit != null && limit > 0) {
                state.getBudgets().put(category, limit);
            }
        });
        dataService.saveState();
        return ResponseEntity.ok(state.getBudgets());
    }

    @PostMapping("/goals")
    public ResponseEntity<SavingsGoal> saveSavingsGoal(@RequestBody SavingsGoal goal) {
        AppState state = dataService.getState();
        if (goal.getId() == null || goal.getId().trim().isEmpty()) {
            goal.setId("g_" + UUID.randomUUID().toString().substring(0, 8));
            state.getSavingsGoals().add(goal);
        } else {
            // Edit mode
            int foundIdx = -1;
            for (int i = 0; i < state.getSavingsGoals().size(); i++) {
                if (state.getSavingsGoals().get(i).getId().equals(goal.getId())) {
                    foundIdx = i;
                    break;
                }
            }
            if (foundIdx > -1) {
                state.getSavingsGoals().set(foundIdx, goal);
            } else {
                state.getSavingsGoals().add(goal);
            }
        }
        dataService.saveState();
        return ResponseEntity.ok(goal);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Map<String, String>> deleteSavingsGoal(@PathVariable String id) {
        AppState state = dataService.getState();
        boolean removed = state.getSavingsGoals().removeIf(g -> g.getId().equals(id));
        if (removed) {
            dataService.saveState();
            return ResponseEntity.ok(Map.of("message", "Savings goal deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/goals/{id}/contrib")
    public ResponseEntity<SavingsGoal> adjustSavingsGoal(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        AppState state = dataService.getState();
        SavingsGoal foundGoal = null;
        for (SavingsGoal g : state.getSavingsGoals()) {
            if (g.getId().equals(id)) {
                foundGoal = g;
                break;
            }
        }

        if (foundGoal == null) {
            return ResponseEntity.notFound().build();
        }

        String type = (String) payload.get("type"); // "add" or "withdraw"
        Number amountNum = (Number) payload.get("amount");
        if (amountNum == null) {
            return ResponseEntity.badRequest().build();
        }
        double amount = amountNum.doubleValue();

        if (type != null && type.equals("add")) {
            foundGoal.setCurrent(Math.round((foundGoal.getCurrent() + amount) * 100.0) / 100.0);
        } else if (type != null && type.equals("withdraw")) {
            if (amount > foundGoal.getCurrent()) {
                return ResponseEntity.badRequest().build(); // insufficient savings
            }
            foundGoal.setCurrent(Math.round((foundGoal.getCurrent() - amount) * 100.0) / 100.0);
        }

        dataService.saveState();
        return ResponseEntity.ok(foundGoal);
    }

    @PostMapping("/state/import")
    public ResponseEntity<AppState> importState(@RequestBody AppState newState) {
        AppState state = dataService.getState();
        if (newState.getTransactions() != null) state.setTransactions(newState.getTransactions());
        if (newState.getBudgets() != null) state.setBudgets(newState.getBudgets());
        if (newState.getSavingsGoals() != null) state.setSavingsGoals(newState.getSavingsGoals());
        if (newState.getSettings() != null) state.setSettings(newState.getSettings());
        
        dataService.saveState();
        return ResponseEntity.ok(state);
    }

    @PostMapping("/settings/currency")
    public ResponseEntity<Map<String, String>> setCurrency(@RequestBody Map<String, String> payload) {
        String currency = payload.get("currency");
        if (currency == null) {
            return ResponseEntity.badRequest().build();
        }
        AppState state = dataService.getState();
        state.getSettings().put("currency", currency);
        dataService.saveState();
        return ResponseEntity.ok(Map.of("currency", currency));
    }

    @PostMapping("/state/reset")
    public ResponseEntity<Map<String, String>> resetState() {
        dataService.resetState();
        return ResponseEntity.ok(Map.of("message", "Application state has been reset"));
    }
}
