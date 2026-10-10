# Pulse — Dynamic Repayment Planning (Reconstruction)

A responsive frontend reconstruction of the publicly visible Pulse repayment dashboard. It is built with plain HTML, CSS and JavaScript so it can run locally without installing packages.

## Run locally

1. Extract `pulse-repayment-dashboard.zip`.
2. Open the extracted folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code **Live Server** extension and select **Open with Live Server**.

No `npm install` is required.

## Files

- `index.html` — dashboard sections and markup
- `styles.css` — responsive layout, cards, charts, tables and modal styling
- `app.js` — navigation, cash-flow calculation, plan selection, sample message parsing, filters, notifications and CSV exports

## Implemented demo interactions

- Sidebar navigation and mobile menu
- Cash-flow analysis from entered income, expenses and obligations
- Choose repayment plan and save a custom monthly recommendation
- Parse an explicitly submitted bank/UPI message after a consent checkbox is selected
- User table search
- Simulated invitation and review actions
- CSV exports for summary, portfolio and report
- Sample purchase anomaly action, connector placeholders and display settings

## Important limitations

This is a **frontend reconstruction**, not the original source repository. Figures and account records are sample data. No actual bank, UPI, lender, email, ML inference, authentication, database, webhook, or secret rotation is connected. The transaction parser is a simple demo heuristic and must not be used for real financial decisions.

For a production system, add a secure backend, authentication/authorization, validated APIs, database persistence, encrypted data handling, consent/audit records, and authorized bank/Account Aggregator integrations. Never put webhook secrets or banking credentials in frontend code.
