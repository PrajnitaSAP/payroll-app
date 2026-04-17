# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Business Problem

Businesses with fewer than 10 workers spend hours each month manually calculating employee salaries. Payroll software targets larger organizations and lacks one-click processing for tiny teams. Variable elements — paid leave, unpaid absences, overtime hours, and festival bonuses — make manual calculation tedious and error-prone.

## Solution

A lean mobile app for micro-businesses to process payroll in one tap. Max 2–3 screens. UI simplicity target: as intuitive as the native Contacts app.

## Core Payroll Calculation Logic

Each employee's monthly payout:

```
Base Salary
- Deductions for unpaid absences (daily rate × unpaid days)
+ Overtime pay (hourly rate × overtime hours)
+ Festival bonus (fixed or % of base, per applicable festival)
= Net Salary
```

Paid leave does not affect the payout — it is counted as worked days.

## App Structure (Target)

- **Screen 1 — Employee List**: Show all employees with a one-tap "Run Payroll" action for the current month.
- **Screen 2 — Monthly Inputs**: Per employee, enter that month's variable data (absences, overtime, bonus). Pre-filled with 0.
- **Screen 3 (optional) — Payslip Summary**: Breakdown of the calculated pay; shareable via WhatsApp/SMS.

## Design Constraints

- No login or cloud sync required for v1 — local storage only.
- No payroll scheduling, tax computation, or multi-currency in v1.
- Festival bonus is manually triggered, not calendar-driven, in v1.
- Target users are non-technical small business owners — avoid financial jargon in UI copy.

## UI Design

### Style
- Modeled after the native Contacts app — white background, black text, one accent color (blue) for buttons.
- Large tap targets, no unnecessary icons, no decorative elements.

### Screen 1 — Employee List
- Header: "My Team" with a [+ Add] button top-right.
- Each employee row shows name and monthly salary.
- Bottom: full-width [Run Payroll] button.

### Screen 2 — Add/Edit Employee
- Back arrow + "New Employee" / "Edit Employee" title.
- Three fields only: Full Name, Phone Number, Monthly Salary (₹).
- [Save Employee] button at the bottom.

### Screen 3 — Run Payroll (Monthly Inputs)
- One employee at a time, header shows month name.
- Shows base salary, then three input fields pre-filled with 0: Unpaid Absent Days, Overtime Hours, Festival Bonus (₹).
- Live net pay calculation shown below inputs — updates as employer types.
- All days counted as worked by default; only unpaid absent days reduce pay.
- Paid leave = no entry needed (counts as worked).
- [✓ Done] button to confirm and move to next employee.

## Implementation Details

### Tech Stack
- **Framework**: Expo (React Native) — runs on Android and iOS from a single codebase.
- **Navigation**: `@react-navigation/native` with `native-stack`.
- **Storage**: `@react-native-async-storage/async-storage` — local only, no cloud sync.

### Project Structure
```
payroll-app/
├── App.js                          ← navigation setup only
└── screens/
    ├── EmployeeListScreen.js       ← Screen 1
    ├── AddEmployeeScreen.js        ← Screen 2
    └── RunPayrollScreen.js         ← Screen 3
```

### Payroll Calculation Formula
```
Daily rate  = Monthly salary ÷ 26 (standard working days)
Hourly rate = Daily rate ÷ 8
Deduction   = Daily rate × unpaid absent days
Overtime    = Hourly rate × overtime hours
Net Pay     = Base salary − Deduction + Overtime + Festival bonus
```

### Phone Number Rules (Screen 2)
- Country code fixed at `+91` (India) — shown as a non-editable prefix.
- Number field accepts digits only, exactly 10 digits, no more no less.
- Validated on save — alerts if not exactly 10 digits.

### Key Behaviours
- Employee list reloads on every screen focus (picks up adds/edits immediately).
- Seeded with 3 sample employees on first launch so the app is not empty.
- Run Payroll walks through employees one at a time; inputs reset to 0 for each.
- Net Pay on Screen 3 recalculates live on every keystroke.

### Coding Style
- **Imports**: React hooks first, then React Native named imports (alphabetical), then external packages.
- **Components**: `export default function ComponentName()` — no arrow functions at top level.
- **Internal helpers**: Plain function declarations (e.g. `calcNetPay`, `handleDone`).
- **Callbacks**: Arrow functions inline (`onPress={() => ...}`).
- **State**: `useState` + `useEffect` only — no Redux or Context.
- **Async**: `async/await` with `try/catch` throughout — no `.then()`.
- **Storage**: AsyncStorage with `JSON.stringify` / `JSON.parse` on every read/write.
- **Validation**: Validate inputs before saving; use `Alert.alert(title, message, buttons)` for feedback.
- **IDs**: `Date.now().toString()` for new employee IDs.
- **Color palette** (iOS system colors):
  - Blue `#007AFF` — primary buttons and accents
  - Green `#34C759` — success / Run Payroll button
  - Red `#FF3B30` — destructive actions
  - Gray text `#8E8E93`, subtle text `#C7C7CC`, dividers `#E5E5EA`
  - Backgrounds: `#fff` (cards), `#F2F2F7` (screen background)
- **Spacing**: 16–20px padding, 12–14px border radius for cards, 20px for pill buttons.
- **Typography**: Font sizes 12–26px; weights 500–700 only.
- **Touch feedback**: `activeOpacity={0.7}` for buttons, `0.6` for list rows.
- **Indentation**: 2 spaces.
