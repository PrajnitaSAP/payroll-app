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
- Advance recovery (previously paid advance, recovered this month)
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
- Header: "My Team" (tappable — navigates to History) with a payslip icon on the left and [+ Add] button on the right.
- Payslip icon: drawn entirely with React Native `View`/`Text` — document outline with folded corner, 3 text lines, `$` sign, and a `$↓` badge circle. No external icon library. Tap navigates to Payroll History.
- Search bar directly below the header — filters the list live on every keystroke (case-insensitive name match).
- Tagline "60-second payroll for your team" shown below search bar when employees exist and payroll has not been run for the current month.
- **Payroll Summary Card**: Replaces the tagline once payroll is complete for the current month. Green left border, shows "✓ Payroll Done" with month name, three stats (Total Paid, Total Leaves, Employees), and a "View Full Breakdown →" link to History. Disappears next calendar month. Re-running payroll updates the card.
- Each employee row shows name, monthly salary, and (if log data exists for the current month) a blue summary line like "3d absent · 5h OT · ₹500 advance".
- Bottom: full-width [Run Payroll] button (hidden when list is empty or all results are filtered out). After payroll completes, transforms to a green-outlined "✓ Payroll Done" button showing a playful speed message (e.g. "Lightning fast! Finished in 23s") and a "Tap to re-run" link. Tapping still navigates to RunPayroll for re-runs.

### Screen 2 — Add/Edit Employee
- Back arrow + "New Employee" / "Edit Employee" title.
- Three fields only: Full Name, Phone Number, Monthly Salary (₹).
- **"This Month" section** (edit mode only): Appears below the employee fields. Shows current month name and three stepper fields — Absent Days (step 0.5), Overtime Hours (step 1), Advance ₹ (step 500). Each field has − / + buttons and a direct-edit text input between them.
- Log data saved to AsyncStorage under `monthly_log` key; auto-saves on back navigation.
- [Save Employee] button at the bottom.

### Screen 3 — Run Payroll (Monthly Inputs)
- One employee at a time, header shows month name.
- Shows base salary, then four input fields pre-filled from the monthly log (or 0 if no log): Unpaid Absent Days, Overtime Hours, Festival Bonus (₹), Advance Recovery (₹).
- Live net pay calculation shown below inputs — updates as employer types.
- All days counted as worked by default; only unpaid absent days reduce pay.
- Paid leave = no entry needed (counts as worked).
- [✓ Done] button to confirm and move to next employee.
- [Skip Employee] button (red outline) below Done — moves to the next employee without recording the current one; skipped employees are excluded from history.

## Implementation Details

### Tech Stack
- **Framework**: Expo (React Native) — runs on Android and iOS from a single codebase.
- **Navigation**: `@react-navigation/native` with `native-stack`.
- **Storage**: `@react-native-async-storage/async-storage` — local only, no cloud sync.

### Project Structure
```
payroll-app/
├── App.js                          ← navigation setup + HistoryIcon component
├── components/
│   ├── ConfirmRemoveModal.js       ← delete-employee confirmation modal
│   └── SearchBar.js                ← reusable search input component
└── screens/
    ├── EmployeeListScreen.js       ← Screen 1 (exports EMPLOYEES_KEY)
    ├── AddEmployeeScreen.js        ← Screen 2 (exports MONTHLY_LOG_KEY)
    ├── RunPayrollScreen.js         ← Screen 3 (saves history + clears log on finish)
    └── HistoryScreen.js            ← Screen 4 (exports HISTORY_KEY)
```

### Payroll Calculation Formula
```
Daily rate  = Monthly salary ÷ 26 (standard working days)
Hourly rate = Daily rate ÷ 8
Deduction   = Daily rate × unpaid absent days
Overtime    = Hourly rate × overtime hours
Net Pay     = Base salary − Deduction + Overtime + Festival bonus − Advance recovery
```

### Phone Number Rules (Screen 2)
- Country code fixed at `+91` (India) — shown as a non-editable prefix.
- Number field accepts digits only, exactly 10 digits, no more no less.
- Validated on save — alerts if not exactly 10 digits.

### Key Behaviours
- Employee list reloads on every screen focus (picks up adds/edits immediately).
- Seeded with 3 sample employees on first launch so the app is not empty.
- Search bar on Screen 1 filters employees by name in real time; Run Payroll passes the full unfiltered list.
- Run Payroll walks through employees one at a time; inputs pre-filled from the monthly log (absent days, overtime, advance); bonus defaults to 0.
- Net Pay on Screen 3 recalculates live on every keystroke.
- Employer can skip an employee — they are excluded from the saved history for that month.
- On "Finish Payroll", the full run is saved to AsyncStorage under key `payroll_history` (array of `{ monthKey, records }`). Re-running the same month overwrites that month's entry.
- On "Finish Payroll", the current month's `monthly_log` is cleared so logs start fresh next month.
- Completion alert shows elapsed time (e.g. "Done in 38 seconds for 5 employees!").

### History Screen (`screens/HistoryScreen.js`)
- AsyncStorage key: `HISTORY_KEY = 'payroll_history'` (exported for use in RunPayrollScreen).
- Data shape: `[{ monthKey: 'April 2025', elapsedSeconds: 38, records: [{ employeeId, name, baseSalary, deduction, overtime, bonus, advance, netPay }] }]` — newest month first.
- Each month card shows total payout and employee count; tap to expand per-employee breakdown.
- Breakdown colours: deduction in red `#FF3B30`, overtime in blue `#007AFF`, bonus in green `#34C759`, advance in red `#FF3B30`.

### Monthly Log (`screens/AddEmployeeScreen.js`)
- AsyncStorage key: `MONTHLY_LOG_KEY = 'monthly_log'` (exported for use in RunPayrollScreen and EmployeeListScreen).
- Data shape: `{ "April 2026": { "<employeeId>": { absentDays: number, overtimeHours: number, advance: number } } }`.
- Written from AddEmployeeScreen (edit mode); read by RunPayrollScreen (pre-fill) and EmployeeListScreen (summary display).
- Cleared for the current month after payroll completes.
- Employee's log entry deleted when the employee is removed.

### SearchBar Component (`components/SearchBar.js`)
- Accepts a single prop: `onChangeText(text)` — called on every keystroke.
- Styled as a white pill with a thick black border and a magnifying-glass icon on the right.
- Stateful internally (holds `query`); parent drives filtering via the callback.
- No external icon library — magnifying glass drawn with plain `View` elements.

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

## Maintenance

After completing any task, update the relevant section of this file if any of the following changed:
- App screens added, removed, or renamed
- Navigation structure or screen flow
- Payroll calculation formula or field definitions
- AsyncStorage keys or data shapes
- Project file/folder structure
- UI design rules or color palette
- Key behaviours or validation rules

Keep updates concise — match the existing style and level of detail.
