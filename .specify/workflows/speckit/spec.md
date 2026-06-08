# Feature Specification: Fund Scoping

**Feature Branch**: `feature/fund-scoping`

**Created**: 2026-06-03

**Status**: Draft

---

## Overview

Add a **Fund Scoping** tab to the existing Scoping component (`/scoping` route). The tab exposes a Syncfusion EJ2 data grid listing all funds for the active engagement, with the ability to Add, Edit (inline), and Delete funds. Adding a fund navigates to a dedicated full-page form; editing occurs directly inside the grid cells.

---

## User Scenarios & Testing

### User Story 1 — View Fund Scoping Grid (Priority: P1)

A user opens the Scoping page and clicks the **Fund Scoping** tab. The grid displays all funds already linked to the active engagement (fund name, type, administrator, currency, dates, status). If no funds exist, an empty-state message is shown.

**Why this priority**: Delivers the visible shell and data contract everything else builds on. Proves grid integration and API connectivity.

**Independent Test**: Navigate to `/scoping`, click "Fund Scoping" tab, verify the grid renders (with or without rows) and columns map to the fund model.

**Acceptance Scenarios**:

1. **Given** a user is on `/scoping`, **When** they click the "Fund Scoping" tab, **Then** the tab becomes active and the fund grid loads.
2. **Given** funds exist for the engagement, **When** the grid loads, **Then** each fund row shows Fund Name, Type of Fund, Fund Administrator, Reporting Currency, Period Begin Date, Period End Date, Expected Audit Sign-Off Date, and Status.
3. **Given** no funds exist, **When** the grid loads, **Then** an empty-state message "No funds found for this engagement" is displayed.
4. **Given** the API is unreachable, **When** the grid loads, **Then** an error banner "Failed to load funds. Please try again." is shown.

---

### User Story 2 — Add New Fund (Priority: P2)

A user clicks **Add Fund** on the Fund Scoping screen (or the Add New Funds button on Engagement Setup). The application navigates to the full-page Add Fund form. The user fills in all mandatory fields, clicks **Add**, and is returned to the Fund Scoping screen where the new fund appears at the top of the grid highlighted in green.

**Why this priority**: Core data-creation flow; blocks all downstream workflows.

**Independent Test**: Click "Add Fund", complete the form with valid data, click "Add", confirm the fund appears first in the grid with a success banner.

**Acceptance Scenarios**:

1. **Given** the user is on the Fund Scoping screen, **When** they click "Add Fund", **Then** the application navigates to the Add Fund page.
2. **Given** all mandatory fields are filled with valid data, **When** the user clicks "Add", **Then** the fund is saved and the user is redirected to Fund Scoping with the message "Fund has been added successfully: `<Fund Name>`".
3. **Given** a mandatory field is blank, **When** the user clicks "Add", **Then** the blank field is outlined in red and the banner "Mandatory fields. Please enter valid details and proceed." is displayed.
4. **Given** a duplicate fund name is entered for the same engagement, **When** the user clicks "Add", **Then** the banner "This fund name already exists. Please enter a different fund name to proceed" is displayed.
5. **Given** Fund Name has fewer than 3 characters, **When** the user clicks "Add", **Then** "Minimum 3 characters are required" is displayed.
6. **Given** Fund Name contains only special characters, **When** the user clicks "Add", **Then** "Fund name should contain at least 1 letter. Please enter a different fund name to proceed" is displayed.
7. **Given** the user has entered data in at least 1 field and clicks **Back** (without clicking Add), **Then** a modal "Are you sure you want to leave this page without saving?" is shown.
8. **Given** Period End Date equals Period Begin Date, **When** the user clicks "Add", **Then** "The Period End Date cannot be the same as the Period Begin Date. Please enter a valid date." is shown.
9. **Given** Expected Audit Sign-Off Date is before Period End Date, **When** the user clicks "Add", **Then** "The Expected Audit Sign-Off Date cannot be before the Period Begin Date, Period End Date or today's date. Please enter a valid date." is shown.
10. **Given** Materiality / Performance Materiality / Audit Misstatement Posting Threshold exceeds 10,000,000,000, **Then** "Maximum value is 10,000,000,000" is shown.

---

### User Story 3 — Edit Fund Inline (Priority: P3)

A user double-clicks any editable cell in the Fund Scoping grid and modifies the value. On clicking outside the cell, the change is saved immediately and a success banner "Fund has been updated successfully: `<Fund Name>`" is shown.

**Why this priority**: Keeps users in context; avoids a separate edit page for minor corrections.

**Independent Test**: Double-click a Fund Name cell, change the value, click elsewhere, confirm the success banner appears and the row reflects the new value.

**Acceptance Scenarios**:

1. **Given** a fund row exists, **When** the user double-clicks an editable cell, **Then** the cell becomes an inline editor matching the field type (text, dropdown, multi-select, date picker).
2. **Given** a valid value is entered and the user clicks outside the cell, **Then** the change is persisted and the banner "Fund has been updated successfully: `<Fund Name>`" appears.
3. **Given** the user empties a mandatory field and clicks outside, **Then** the field is outlined in red and "Mandatory fields. Please enter valid details and proceed." is shown.
4. **Given** the backend fails to save, **Then** the banner "We could not save your changes. Please try again." is shown.
5. **Given** a fund has passed the Data Import stage, **Then** Period Begin Date, Period End Date, and Type of Fund cells are locked (read-only) for that fund.
6. **Given** Status column, **Then** it is always read-only regardless of stage.

---

### User Story 4 — Delete Fund (Priority: P4)

A user selects one or more fund checkboxes and clicks **Delete Fund**. A confirmation modal appears. On confirmation, the selected funds are deleted and removed from the grid.

**Why this priority**: Data hygiene; prevents accidental fund creation from blocking workflows.

**Independent Test**: Select a fund checkbox, click "Delete Fund", confirm in the modal, verify the fund is removed from the grid.

**Acceptance Scenarios**:

1. **Given** one or more funds are checked (all deletable), **When** the user clicks "Delete Fund", **Then** the modal "Are you sure you want to delete the selected fund(s)?" appears with Yes / No buttons.
2. **Given** the user clicks "Yes", **Then** the funds are deleted, the modal closes, and the grid refreshes.
3. **Given** the user clicks "No", **Then** the modal closes and no deletion occurs.
4. **Given** a mix of deletable and non-deletable funds are selected, **Then** the modal shows "The following selections can't be deleted due to being passed the Data Import stage: `<Fund Name(s)>`. Are you sure you want to delete the remaining selected Funds." with Yes / No.
5. **Given** all selected funds are non-deletable, **Then** the modal shows the informational message and only an OK button.

---

### Edge Cases

- What happens when the engagement has exactly 200 funds (performance boundary)?
- How does the grid handle network timeout during inline save?
- What if the session token expires mid-form on Add Fund?
- What happens when the user opens Add Fund in two browser tabs simultaneously for the same engagement?

---

## Requirements

### Functional Requirements

- **FR-001**: The Scoping component MUST include a third tab labelled "Fund Scoping".
- **FR-002**: The Fund Scoping tab MUST display a Syncfusion EJ2 data grid with funds for the active engagement.
- **FR-003**: The grid MUST support server-side data loading from `GET /api/Fund?engagementId={id}`.
- **FR-004**: The "Add Fund" button MUST navigate to the `/scoping/fund/add` route (full-page, not modal).
- **FR-005**: The Add Fund form MUST include all fields listed in the Key Entities section below with their validation rules.
- **FR-006**: Dropdown fields (Type of Fund, Fund Administrator, Reporting Currency) MUST be populated from backend control-table APIs.
- **FR-007**: Multi-select fields (Type of Investment, Broker/Custodians) MUST allow multiple selections with a truncation indicator when overflow occurs.
- **FR-008**: Date pickers MUST use the `MM/DD/YYYY` format and enforce the date ordering rules (Period Begin ≤ Period End ≤ Expected Audit Sign-Off ≥ today).
- **FR-009**: Inline editing MUST be triggered by double-click and auto-save on blur; validation errors MUST prevent save.
- **FR-010**: Delete MUST require a confirmation modal before any DB operation.
- **FR-011**: Newly added funds MUST appear at the top of the grid with a green highlight that clears on the next user action.
- **FR-012**: A page-level stepper MUST highlight the "Fund Scoping" step when the user is on the Fund Scoping or Add Fund pages.
- **FR-013**: The Add Fund page MUST show a "Back" button and trigger an unsaved-changes modal if the form is dirty.
- **FR-014**: Materiality fields (Materiality, Performance Materiality, Audit Misstatement Posting Threshold) are optional and MUST accept only non-negative numbers ≤ 10,000,000,000.
- **FR-015**: The system MUST return a fund in the add/update API response within 1–2 seconds.

### Key Entities

- **Fund**: `fundId`, `engagementId`, `fundName` (string, 3–200), `typeOfFundId` (FK), `typesOfInvestment` (multi, FK array), `fundAdministratorId` (FK), `brokerCustodianIds` (FK array), `reportingCurrencyId` (FK), `periodBeginDate` (date), `periodEndDate` (date), `expectedAuditSignOffDate` (date), `materiality` (decimal, optional), `performanceMateriality` (decimal, optional), `auditMisstatementPostingThreshold` (decimal, optional), `status` (string, system-generated), `createdDate`, `modifiedDate`.
- **TypeOfFund**: `typeOfFundId`, `name` — Hedge Fund, Mutual Fund, CIT, Private Equity Fund, Venture Capital Fund, Real Estate Fund.
- **TypeOfInvestment**: `typeOfInvestmentId`, `name` — Equity-Listed, Equity-Unlisted, Fixed Income, Options, Warrants, CFDs, Swaps, Swaptions, Futures, FX Forwards, Other Forwards, Repos and Reverse Repos, Foreign Investments, Private Debt, Other Debt, Real Estate, Other.
- **FundAdministrator**: `fundAdministratorId`, `name` — Apex, BNY Mellon-Eagle, BNY Mellon-InvestOne, BBH-Eagle, Citco, Citi-InvestOne, Goldman Sachs, HC Global, HedgeServ, JP Morgan-InvestOne, Kaufman Rossin.
- **BrokerCustodian**: `brokerCustodianId`, `name` — Morgan Stanley, Goldman Sachs, J.P. Morgan, Credit Suisse, Other, N/A.
- **ReportingCurrency**: `currencyId`, `currencyCode` (e.g., USD, EUR, JPY, GBP).

---

## Success Criteria

- **SC-001**: A fund can be added end-to-end (UI → API → DB) in under 2 seconds.
- **SC-002**: All mandatory-field validations are enforced before any API call is made.
- **SC-003**: The Fund Scoping grid renders correctly with up to 200 funds without visible performance degradation.
- **SC-004**: Inline edit saves to the DB on cell blur with a visible success banner within 1 second.
- **SC-005**: Delete confirmation modal prevents accidental deletion (no fund is deleted without explicit modal confirmation).
- **SC-006**: The "Fund Scoping" stepper step is highlighted correctly when on the fund pages.

---

## Assumptions

- The active engagement is resolved from the NgRx store (`state.engDetails.entities[0]`) — no engagement-selector UI is in scope.
- The Syncfusion EJ2 Angular Grid package (`@syncfusion/ej2-angular-grids`) will be added to the project.
- The existing `DatepickerWrapperComponent` in `src/app/shared/components/datepicker-wrapper` will be reused for date fields.
- The existing `MultiSelectDropdownComponent` in `src/app/shared/components/multi-select-dropdown` will be reused for multi-select fields.
- The .NET Core API follows the existing pattern: `EnvService.apiURL + '/api/<Resource>'`.
- Backend authentication (MSAL/Azure AD) is already handled by the existing HTTP interceptor.
- Mobile support is out of scope for this phase.
- Status field values and workflow stage transitions are managed by the backend; the frontend only reads them.

---

## Separate Prompts

---

### PROMPT — Angular 20 UI (use in Claude Code / Cursor on the frontend repo)

```
You are working on an Angular 20 application (nasc-ui). The project uses NgRx for state management,
Bootstrap 5 for layout, and the Syncfusion EJ2 Angular Grid for data grids.

Task: Implement the Fund Scoping feature as described in .specify/workflows/speckit/spec.md.

DESIGN DECISION: There is NO separate Add Fund page. All fund operations (Add, Edit, Delete,
Duplicate) happen directly inside the inline EJ2 grid on the Fund Scoping tab. Do not create
an AddFundComponent or a /scoping/fund/add route.

Scope (UI only):

1. Add a third "Fund Scoping" tab to ScopingComponent
   (src/app/features/scoping/components/scoping/scoping.component.*).
   Keep existing "Engagement Details" and "Add Engagement" tabs intact.

2. Create FundScopingPageComponent under src/app/features/fund/pages/fund-scoping-page/
   Page layout (top to bottom):
     a. Action toolbar with four buttons:
        - "Add Fund"      → inserts a new blank editable row at the top of the grid
        - "Delete Fund"   → deletes all rows whose checkbox is checked (no confirmation modal);
                            disabled when no checkbox is selected
        - "Duplicate Fund"→ creates a new editable row pre-filled with the selected fund's data
                            (one fund only; disabled when 0 or >1 checkboxes are selected)
        - "Save"          → commits all pending inline changes to the API via FundService.saveAll()
     b. "Back" button (separate, left-aligned) → if grid has unsaved changes, show
        Bootstrap modal "Are you sure you want to leave this page without saving?" Yes/No
     c. FundScopingGridComponent (the full inline EJ2 grid — fills the rest of the page)

   Rules:
   - Maximum 15 funds per engagement. "Add Fund" and "Duplicate Fund" buttons are disabled
     when the grid already has 15 rows.
   - Newly added/duplicated rows are highlighted green; highlight clears on Save or navigation.
   - Empty-state message "No funds found for this engagement" when grid has zero rows.
   - Error banner "Failed to load funds. Please try again." on API load failure.
   - No separate modal for delete — deletion is immediate on "Delete Fund" click for checked rows.

3. Create FundScopingGridComponent under src/app/features/fund/components/fund-scoping-grid/
   This component owns the EJ2 Grid configuration and all inline editing logic.

   Grid columns (in order):
   ┌──────────────┬──────────────────────────────────────────────────────────────┐
   │ Column       │ Details                                                      │
   ├──────────────┼──────────────────────────────────────────────────────────────┤
   │ Checkbox     │ EJ2 checkbox selection; selecting a row enables Delete/Dup   │
   │ Fund Name    │ Text, editable, required, min 3, max 200, must contain ≥1    │
   │              │ alpha char, no duplicate within same engagement              │
   │ Type of Fund │ Single-select dropdown, populated from lookup API            │
   │ Type of Inv. │ Multi-select checkbox dropdown (custom template)             │
   │ Fund Admin   │ Single-select dropdown, populated from lookup API            │
   │ Broker/Cust. │ Multi-select dropdown (custom template)                      │
   │ Rep. Currency│ Single-select dropdown, populated from lookup API            │
   │ Period Begin │ Date picker, MM/DD/YYYY, must be ≤ today                     │
   │ Period End   │ Date picker, MM/DD/YYYY, must be > Period Begin Date         │
   │ Exp. Audit   │ Date picker, MM/DD/YYYY, must be ≥ today, Begin Date, End   │
   │ Sign-Off Date│ Date                                                         │
   │ Status       │ Read-only text (system-generated, never editable)            │
   └──────────────┴──────────────────────────────────────────────────────────────┘

   Grid columns (visible in table, in order):
   ┌────────────────────────┬───────────────────────────────────────────────────────────────┐
   │ Column                 │ Details                                                       │
   ├────────────────────────┼───────────────────────────────────────────────────────────────┤
   │ Checkbox               │ EJ2 checkbox selection; max 15 funds enforced across grid     │
   │ Fund Name              │ Text input, inline editable                                   │
   │ Type of Fund           │ Single-select dropdown                                        │
   │ Type of Investment     │ Multi-select checkbox dropdown (custom edit template)         │
   │ Fund Administrator     │ Single-select dropdown                                        │
   │ Broker/Custodians      │ Multi-select dropdown (custom edit template)                  │
   │ Reporting Currency     │ Single-select dropdown                                        │
   │ Period Begin Date      │ Date picker, MM/DD/YYYY                                       │
   │ Period End Date        │ Date picker, MM/DD/YYYY                                       │
   │ Exp. Audit Sign-Off    │ Date picker, MM/DD/YYYY                                       │
   │ Status                 │ Read-only text (system-generated, never editable)             │
   └────────────────────────┴───────────────────────────────────────────────────────────────┘

   Inline edit behaviour:
   - Mode: 'Normal', trigger: double-click on any editable cell.
   - New rows added via "Add Fund" or "Duplicate Fund" are immediately editable (no double-click needed).
   - Individual cell changes auto-save via FundService.updateFund(fundId, rowData) on cell blur
     (for existing rows with a fundId).
   - New rows (no fundId yet) are saved via FundService.addFund(rowData) when "Save" is clicked.
   - "Save" button commits all pending new rows; also acts as a manual flush for any unsaved edits.
   - Field-level validation errors display as a red outline + tooltip on the cell.
   - A top-of-page banner "Please fix validation errors before saving." appears when Save is blocked.

   Inline validation rules (enforced on cell blur and before Save):
   - Fund Name:             required, minLength(3), maxLength(200), must contain ≥1 alphabetic
                            character, no duplicate within the same engagement
   - Type of Fund:          required, single select
   - Type of Investment:    required, multi-select (≥1 option selected)
   - Fund Administrator:    required, single select
   - Broker/Custodians:     required, multi-select (≥1 option selected)
   - Reporting Currency:    required, single select
   - Period Begin Date:     required, must be ≤ today
   - Period End Date:       required, must be > Period Begin Date (not equal)
   - Expected Audit Sign-Off Date: required, must be ≥ today AND ≥ Period Begin Date
                                   AND ≥ Period End Date

   Status locking (post Data Import stage):
   - Period Begin Date, Period End Date, and Type of Fund cells become read-only for that row.
   - Status column is always read-only for all rows.

4. Create EditInlineGridComponent under src/app/features/fund/components/edit-inline-grid/
   Provides custom EJ2 edit-cell templates for:
   - Single-select dropdown cells: Type of Fund, Fund Administrator, Reporting Currency
   - Multi-select checkbox dropdown cells: Type of Investment, Broker/Custodians
   - Date picker cells: Period Begin Date, Period End Date, Expected Audit Sign-Off Date

5. Create FundService at src/app/shared/services/fund/fund.service.ts

   Data-fetch methods (called on page load):
   - getFunds(engagementId: number): Observable<Fund[]>
       GET /api/Fund?engagementId={id}

   CRUD methods (called by inline grid actions):
   - addFund(row: FundSaveRequest): Observable<FundResponse>
       POST /api/Fund                   (new row — no fundId in body)
   - updateFund(fundId: number, row: FundSaveRequest): Observable<FundResponse>
       PUT /api/Fund/{fundId}           (existing row — triggered on cell blur)
   - deleteFunds(fundIds: number[]): Observable<DeleteFundsResponse>
       DELETE /api/Fund                 (body: { fundIds })

   Lookup methods (called once on component init, results cached in store):
   - getTypeOfFunds(): Observable<LookupItem[]>
       GET /api/lookup/fund-types
   - getTypeOfInvestments(): Observable<LookupItem[]>
       GET /api/lookup/investment-types
   - getFundAdministrators(): Observable<LookupItem[]>
       GET /api/lookup/fund-administrators
   - getBrokerCustodians(): Observable<LookupItem[]>
       GET /api/lookup/broker-custodians
   - getReportingCurrencies(): Observable<LookupItem[]>
       GET /api/lookup/currencies

   Shared interfaces:
   FundSaveRequest  { fundId?: number, engagementId: number, fundName: string,
                      typeOfFundId: number, typesOfInvestmentIds: number[],
                      fundAdministratorId: number, brokerCustodianIds: number[],
                      reportingCurrencyId: number, periodBeginDate: string,
                      periodEndDate: string, expectedAuditSignOffDate: string }

   FundResponse     { success: boolean, message: string, fundId: number }

   DeleteFundsResponse { deleted: number[], skipped: Array<{ id: number, name: string }> }

6. Add NgRx fund state under src/app/features/fund/fund-state/ with:
   - fund.model.ts   — Fund, FundSaveRequest, FundResponse, DeleteFundsResponse,
                       LookupItem, FundState interfaces
   - fund.actions.ts — loadFunds, loadFundsSuccess, loadFundsFailure,
                       addFund, addFundSuccess, addFundFailure,
                       updateFund, updateFundSuccess, updateFundFailure,
                       deleteFunds, deleteFundsSuccess, deleteFundsFailure,
                       setNewlyAddedFundIds, clearNewlyAddedFundIds,
                       loadLookups, loadLookupsSuccess
   - fund.reducer.ts — FundState { funds: Fund[], loading: boolean, saving: boolean,
                       error: string | null, newlyAddedFundIds: number[],
                       lookups: { typeOfFunds, typeOfInvestments, fundAdministrators,
                                  brokerCustodians, reportingCurrencies } }
   - fund.effects.ts — side effects wiring all FundService calls
   - fund.selectors.ts

7. Register FundModule and its components in ScopingModule.
   No child route needed (no separate Add Fund page — everything is on the Fund Scoping tab).

8. Add @syncfusion/ej2-angular-grids to package.json and register in FundModule:
   GridModule, EditService, ToolbarService, SelectionService, CheckboxSelectionService.

Follow the existing coding patterns:
- standalone: false for all components (match the rest of the app)
- takeUntilDestroyed(this.destroyRef) for all subscriptions
- EnvService.apiURL as base for all HTTP calls
- Bootstrap 5 utility classes for layout; no extra CSS frameworks
- Component files: .component.ts / .component.html / .component.scss
- Do not modify any existing engagement components
```

---

### PROMPT — .NET Core Backend (use in Claude Code / Cursor on the backend repo)

```
You are implementing the backend API for the Fund Scoping feature of the NASC application.
The frontend (Angular 20) will call these endpoints; refer to .specify/workflows/speckit/spec.md
for the full data model and validation rules.

Task: Implement all backend artifacts needed to support the Fund Scoping feature.

1. Entity Models (Domain layer)
   - Fund entity with all fields from spec.md Key Entities section
   - Control table entities: TypeOfFund, TypeOfInvestment, FundAdministrator,
     BrokerCustodian, ReportingCurrency
   - FundInvestmentType (join table: fund ↔ TypeOfInvestment)
   - FundBrokerCustodian (join table: fund ↔ BrokerCustodian)

2. DTOs (Application layer)
   - FundDto (response, full projection)
   - CreateFundDto (request — all mandatory fields + optional materiality fields)
   - UpdateFundDto (same shape as CreateFundDto; fundId in route)
   - DeleteFundsDto { fundIds: List<int> }
   - LookupItemDto { id: int, name: string }
   - FundResponseDto { success: bool, message: string, fundId: int }

3. Validation (FluentValidation or DataAnnotations)
   - Fund Name: required, 3–200 chars, must contain ≥1 alphabetic character,
     no duplicate within same engagementId
   - All mandatory fields must not be null
   - Period End Date ≥ Period Begin Date (and not equal)
   - Expected Audit Sign-Off Date ≥ max(Period End Date, today)
   - Materiality fields: non-negative, ≤ 10,000,000,000

4. Repository / Service
   - IFundRepository with: GetByEngagementAsync, AddAsync, UpdateAsync, DeleteManyAsync,
     ExistsByNameAsync(engagementId, fundName, excludeId?)
   - FundService implementing business rules and calling repository
   - ILookupRepository for reading control tables

5. API Controllers (ASP.NET Core Web API)

   FundController (api/Fund):
     GET    api/Fund?engagementId={id}   → List<FundDto>
     POST   api/Fund                    → FundResponseDto  (201 Created)
     PUT    api/Fund/{fundId}            → FundResponseDto
     DELETE api/Fund                    → 204 NoContent  (body: DeleteFundsDto)

   LookupController (api/lookup):
     GET api/lookup/fund-types           → List<LookupItemDto>
     GET api/lookup/investment-types     → List<LookupItemDto>
     GET api/lookup/fund-administrators  → List<LookupItemDto>
     GET api/lookup/broker-custodians    → List<LookupItemDto>
     GET api/lookup/currencies           → List<LookupItemDto>

6. Database
   - EF Core migrations for all new tables
   - Seed data for all control tables (TypeOfFund, TypeOfInvestment, FundAdministrator,
     BrokerCustodian, ReportingCurrency) with values listed in spec.md Key Entities
   - Index on Fund(engagementId), unique index on Fund(engagementId, fundName)

7. Deletability Rule
   - A fund is deletable only if its status is before the "Data Import" stage.
   - DELETE endpoint must check each fundId:
       - Deletable → delete
       - Not deletable → skip and include in response message
   - Response body: { deleted: [ids], skipped: [{ id, name }] }

8. Error Handling
   - Return 400 with { field, message } array for validation failures
   - Return 404 when fundId not found
   - Return 409 when duplicate fund name within engagement

9. Performance
   - Queries must handle 200 funds per engagement without N+1 issues.
   - Use .Include() for navigation properties; project to DTOs before materializing.

Follow existing project conventions:
- Use the existing DbContext
- Apply [Authorize] attribute (Azure AD bearer token) matching existing controllers
- Use async/await throughout
- Return standard ApiResponse wrapper if one exists in the project
```
