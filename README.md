# Offer Compass — Salary and Job Offer Planner

## What it does

Offer Compass turns a monthly salary offer into a transparent take-home estimate. It shows each calculation step, helps plan savings after bills, and compares a second offer side by side.

## Who it is for

Anyone deciding between job offers or checking how a monthly salary, allowances, deductions, bills, and savings goal fit together.

## Needs

A modern web browser. No internet connection, account, installation, or server is needed. All app files and sample data are included in this folder.

## How to run it

1. Download or open this project folder.
2. Double-click `index.html`.
3. Enter your own monthly figures. Your inputs are saved only in this browser using local storage; they are never sent to GitHub or another service.

Money inputs are numbers, not text, so `9000 + 500` is correctly calculated as `9,500.00`.

### How take-home pay is calculated

- Gross monthly pay = basic salary + housing allowance + transport allowance.
- Deduction basis = basic salary + housing allowance.
- Deduction = deduction basis × deduction rate.
- Estimated take-home = gross monthly pay − deduction.

Each amount is rounded to two decimal places. The planner rounds the deduction first, then subtracts it from gross pay so every displayed step matches the final total.

## Try it with the sample data

Click **Load example** at any time to restore fictional built-in numbers. The required first-offer example is:

- Basic salary: `7,000`
- Housing allowance: `1,750`
- Transport allowance: `700`
- Deduction rate: `9.75%`
- Estimated take-home: `8,596.87`

For a quick demo, load the example, change the basic salary, then choose **Compare a second offer** to jump to Level 3. For savings, the planner assumes you save all positive money left after monthly bills; it does not model interest, debt, investment returns, or future pay changes.

Built with Claude Code during the KKU Claude Code hackathon
Started on 2026-09-25
