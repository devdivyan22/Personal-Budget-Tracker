package com.apexbudget.api.model;

public class SavingsGoal {
    private String id;
    private String title;
    private double target;
    private double current;
    private String targetDate;
    private String color;

    public SavingsGoal() {
    }

    public SavingsGoal(String id, String title, double target, double current, String targetDate, String color) {
        this.id = id;
        this.title = title;
        this.target = target;
        this.current = current;
        this.targetDate = targetDate;
        this.color = color;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public double getTarget() {
        return target;
    }

    public void setTarget(double target) {
        this.target = target;
    }

    public double getCurrent() {
        return current;
    }

    public void setCurrent(double current) {
        this.current = current;
    }

    public String getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(String targetDate) {
        this.targetDate = targetDate;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
