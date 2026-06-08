# Implementation Plan: Fund Scoping

**Branch**: `feature/fund-scoping` | **Date**: 2026-06-03 | **Spec**: `.specify/workflows/speckit/spec.md`

---

## Summary

Add a **Fund Scoping** tab to the existing Scoping page (Angular 20 frontend) and implement the corresponding CRUD API in .NET Core. The feature allows users to view, add (inline row), edit inline, duplicate, and delete funds — all within a single Bootstrap table grid driven by Angular `FormArray`. NgRx manages fund state. No new third-party UI libraries are introduced; all tools are already installed in the project.

---

## Technical Context

**Frontend Language/Version**: TypeScript 5.8 / Angular 20

**Backend Language/Version**: C# / .NET Core (version to match existing project)

**Primary Dependencies**:
- Frontend: Angular 20 (ReactiveFormsModule, FormsModule, Router, HttpClient, NgRx), Bootstrap 5,
  RxJS 7, Luxon 3 — all already in `package.json`. Reuse existing shared components:
  `MultiSelectDropdownComponent` and `DatepickerWrapperComponent`. No new packages needed.
- Backend: ASP.NET Core Web API, Entity Framework Core, FluentValidation (or DataAnnotations)

**Storage**: SQL Server (via existing EF Core DbContext)

**Testing**: Jasmine/Karma (frontend unit), xUnit or NUnit (backend unit), existing test conventions

**Target Platform**: Web (Chrome primary); server-side: Azure-hosted .NET Core API

**Performance Goals**: Add/update fund within 1–2 seconds; grid renders 200 funds without degradation

**Constraints**: Must not break existing Engagement Details / Add Engagement tabs; follow `standalone: false` component pattern

**Scale/Scope**: Single engagement up to 200 funds; ~10 control table lookups

---

## Architecture Overview

```
Scoping Page (/scoping)
  ├── Tab: Engagement Details  [existing — unchanged]
  ├── Tab: Add Engagement      [existing — unchanged]
  └── Tab: Fund Scoping        [NEW]
          └── FundScopingPageComponent
                ├── Action toolbar: Add Fund | Delete Fund | Duplicate Fund | Save | Back
                └── FundScopingGridComponent
                      ├── Bootstrap <table> driven by Angular FormArray
                      ├── One FormGroup per row (existing + new/duplicate rows)
                      ├── Checkbox column (built-in <input type="checkbox">)
                      ├── Inline cell editors:
                      │     ├── Text input  → Fund Name
                      │     ├── <select>    → Type of Fund, Fund Administrator, Reporting Currency
                      │     ├── MultiSelectDropdownComponent (reused) → Type of Investment,
                      │     │                                            Broker/Custodians
                      │     └── DatepickerWrapperComponent (reused)  → Begin, End, Sign-Off dates
                      └── Read-only Status cell (never editable)

No /scoping/fund/add route. No AddFundComponent. No separate modal for delete.
All fund CRUD lives inside FundScopingGridComponent on the Fund Scoping tab.
```

```
Backend REST API
  ├── FundController          (/api/Fund)
  │     GET    ?engagementId
  │     POST
  │     PUT    /{fundId}
  │     DELETE (body: fundIds[])
  └── LookupController        (/api/lookup)
        GET /fund-types
        GET /investment-types
        GET /fund-administrators
        GET /broker-custodians
        GET /currencies
```

---

## Project Structure

### Frontend source layout (additions only)

```text
src/app/
├── features/
│   └── fund/
│       ├── fund-state/
│       │   ├── fund.model.ts       ← Fund, FundRow (FormGroup shape), FundSaveRequest,
│       │   │                          FundResponse, DeleteFundsResponse, LookupItem, FundState
│       │   ├── fund.actions.ts
│       │   ├── fund.reducer.ts
│       │   ├── fund.effects.ts
│       │   └── fund.selectors.ts
│       ├── components/
│       │   └── fund-scoping-grid/
│       │       ├── fund-scoping-grid.component.ts   ← owns FormArray + all grid logic
│       │       ├── fund-scoping-grid.component.html ← Bootstrap <table> + inline editors
│       │       └── fund-scoping-grid.component.scss
│       ├── pages/
│       │   └── fund-scoping-page/
│       │       ├── fund-scoping-page.component.ts   ← toolbar buttons + Back guard
│       │       ├── fund-scoping-page.component.html
│       │       └── fund-scoping-page.component.scss
│       └── fund.module.ts          ← imports ReactiveFormsModule, SharedModule, CommonModule
├── shared/
│   └── services/
│       └── fund/
│           └── fund.service.ts
└── store/
    └── reducers/
        └── index.ts   [add fundState to root reducer]

Reused shared components (no changes needed):
  src/app/shared/components/multi-select-dropdown/   ← for Type of Investment, Broker/Custodians
  src/app/shared/components/datepicker-wrapper/      ← for all three date columns
```

### Backend source layout (additions only)

```text
Domain/
├── Entities/
│   ├── Fund.cs
│   ├── TypeOfFund.cs
│   ├── TypeOfInvestment.cs
│   ├── FundAdministrator.cs
│   ├── BrokerCustodian.cs
│   ├── ReportingCurrency.cs
│   ├── FundInvestmentType.cs    (join)
│   └── FundBrokerCustodian.cs   (join)
└── Interfaces/
    ├── IFundRepository.cs
    └── ILookupRepository.cs

Application/
├── DTOs/
│   ├── FundDto.cs
│   ├── CreateFundDto.cs
│   ├── UpdateFundDto.cs
│   ├── DeleteFundsDto.cs
│   ├── FundResponseDto.cs
│   └── LookupItemDto.cs
├── Validators/
│   ├── CreateFundValidator.cs
│   └── UpdateFundValidator.cs
└── Services/
    └── FundService.cs

Infrastructure/
├── Repositories/
│   ├── FundRepository.cs
│   └── LookupRepository.cs
└── Migrations/
    └── [timestamp]_AddFundTables.cs

API/
└── Controllers/
    ├── FundController.cs
    └── LookupController.cs
```

---

## Phase Breakdown

### Phase 0 — Shared Contracts (both teams, day 1)

Agree on and lock the API contract before parallel work begins:

| Endpoint | Request | Response |
|---|---|---|
| `GET /api/Fund?engagementId={id}` | query param | `FundDto[]` |
| `POST /api/Fund` | `CreateFundDto` | `FundResponseDto` |
| `PUT /api/Fund/{fundId}` | `UpdateFundDto` | `FundResponseDto` |
| `DELETE /api/Fund` | `{ fundIds: int[] }` body | `{ deleted: int[], skipped: [{id, name}] }` |
| `GET /api/lookup/*` | — | `LookupItemDto[]` |

Frontend mocks these endpoints from day 1; backend delivers real implementations.

---

### Phase 1 — Foundation

#### Frontend
- No new packages needed — all dependencies already installed
- Create `fund.model.ts` with interfaces: `Fund`, `FundRow`, `FundSaveRequest`, `FundResponse`,
  `DeleteFundsResponse`, `LookupItem`, `FundState`
- Scaffold `FundModule` (imports: `ReactiveFormsModule`, `CommonModule`, `SharedModule`,
  `RouterModule`); declare `FundScopingPageComponent`, `FundScopingGridComponent`
- Register `FundModule` in `ScopingModule` — no new child route (no separate Add Fund page)
- Create `FundService` with `HttpClient` calls (wire to mock/stub initially)
- Add `fundState` to root NgRx store (`store/reducers/index.ts`);
  register `FundEffects` in `app.config.ts`

#### Backend
- Create EF Core entities and DbContext registrations
- Write and run migration `AddFundTables`
- Seed control tables
- Scaffold `IFundRepository` and `ILookupRepository` interfaces

---

### Phase 2 — User Story 1: View Fund Scoping Grid (P1)

#### Frontend
- Add "Fund Scoping" tab to `ScopingComponent` (third tab, extend `activeTab` union to include `'fund'`)
- Create `FundScopingPageComponent`: dispatches `loadFunds` + `loadLookups` on `ngOnInit`;
  renders `<app-fund-scoping-grid>` and the action toolbar
- Create `FundScopingGridComponent`:
  - Builds a `FormArray` of `FormGroup`s from the funds loaded in the store
  - Renders a Bootstrap `<table class="table table-bordered">` with one `<tr>` per `FormGroup`
  - All editable cells show their value as display text; double-click switches that cell to its
    input control (text input / `<select>` / `MultiSelectDropdownComponent` / `DatepickerWrapperComponent`)
  - Status cell is always display-only
  - Loading spinner while `loading$` is true; empty-state row when `funds$` is empty
- Wire NgRx effects → `FundService.getFunds()` + all lookup calls → populate store
- Error banner "Failed to load funds. Please try again." on load failure

#### Backend
- Implement `FundRepository.GetByEngagementAsync(engagementId)` with EF Include
- Implement `LookupRepository` reads for all 5 control tables
- Implement `GET /api/Fund` and all `GET /api/lookup/*` endpoints
- Return `FundDto[]` projected from entity

---

### Phase 3 — User Story 2: Add Fund (P2)

#### Frontend
- "Add Fund" toolbar button → `FundScopingGridComponent.addRow()`:
  - Prepends a blank `FormGroup` to the `FormArray`
  - New row is immediately in edit mode (all cells show input controls without double-click)
  - Row highlighted green via `[class.table-success]` on the `<tr>`
  - "Add Fund" and "Duplicate Fund" buttons disabled when row count reaches 15
- "Save" toolbar button → `FundScopingPageComponent.onSave()`:
  - Runs `FormArray.valid` check; shows top-of-page error banner if invalid
  - For each new row (no `fundId`): dispatch `addFund` NgRx action → `FundService.addFund()`
  - On success: replace temp row with server-returned fund; keep green highlight;
    clear highlight on next user action
- "Back" toolbar button: if `FormArray.dirty`, open Bootstrap modal
  "Are you sure you want to leave this page without saving?" — Yes/No using existing Bootstrap JS
- All client-side validations from spec.md inline validation rules enforced in `FormGroup`
  validators; field error messages shown beneath each cell input using `*ngIf="ctrl.errors"`

#### Backend
- Implement `FundService.AddFundAsync(dto, engagementId)` with full validation
- Unique-name check: `ExistsByNameAsync(engagementId, fundName)`
- Implement `POST /api/Fund` returning 201 with `FundResponseDto`
- Return 400 with field-level error map on validation failure
- Return 409 on duplicate name

---

### Phase 4 — User Story 3: Edit Fund Inline (P3)

#### Frontend
- Each table cell tracks an `editingCell: { rowIndex, field } | null` on the component
- `(dblclick)` on any editable cell sets `editingCell`; `(blur)` or `(keydown.enter)` clears it
  and, for existing rows (have a `fundId`), dispatches `updateFund` → `FundService.updateFund()`
- Cell template uses `*ngIf="isEditing(i, 'fieldName'); else displayTpl"` to toggle
  between read view and its edit control (text/select/multi-select/date)
- Success banner "Fund has been updated successfully: <Fund Name>" on `updateFundSuccess`
- Error banner "We could not save your changes. Please try again." on `updateFundFailure`
- Status-locking: `FormGroup.get('periodBeginDate').disable()` etc. applied for rows whose
  `status` indicates post-Data-Import stage; Status cell never editable

#### Backend
- Implement `FundRepository.UpdateAsync(fundId, dto)`
- Same validation as AddFund (minus duplicate-name check against self)
- Implement `PUT /api/Fund/{fundId}` returning 200 with `FundResponseDto`
- Status-based field-lock enforcement server-side as well

---

### Phase 5 — User Story 4: Delete Fund (P4) + Duplicate Fund

#### Frontend
- Checkbox column: `<input type="checkbox">` in first `<td>` of each row, two-way bound to a
  `selectedIds: Set<number>` tracked on the component
- "Delete Fund" toolbar button:
  - Disabled when `selectedIds.size === 0`
  - On click: dispatch `deleteFunds` → `FundService.deleteFunds(selectedIds)` directly
    (no confirmation modal — immediate deletion per spec)
  - On success: remove deleted rows from `FormArray`; clear `selectedIds`
  - On partial delete (`skipped` in response): show info banner listing non-deletable fund names
- "Duplicate Fund" toolbar button:
  - Enabled only when exactly 1 checkbox is selected
  - Disabled when row count is already 15
  - On click: copy selected row's `FormGroup` values into a new blank `FormGroup` (no `fundId`),
    prepend to `FormArray`; new row immediately in edit mode; green highlight applied

#### Backend
- Implement `FundRepository.DeleteManyAsync(fundIds)` with deletability check
- Implement `DELETE /api/Fund` returning 204 + `{ deleted, skipped }` payload

---

### Phase 6 — Polish & Integration

- Cross-browser test (Chrome primary)
- Stepper styling finalization
- Handle session-expiry edge case (redirect to login via existing MSAL interceptor)
- Performance test with 200-fund dataset
- Code review and lint clean-up

---

## Complexity Tracking

| Item | Why Needed |
|---|---|
| `FormArray` for inline grid | Manages multiple editable rows with per-row validation; matches Angular's existing ReactiveFormsModule pattern used elsewhere in the app |
| Cell-level `editingCell` state | Tracks which cell is in edit mode without introducing a grid library |
| NgRx fund state | Consistent with existing engagement state pattern; needed for cross-component sync (new fund highlight, lookup caching) |
| Separate `FundModule` | Keeps the scoping bundle size manageable; isolates fund feature code |

---

## Separate Prompts

---

### PROMPT — Angular 20 UI Plan Execution (use in Claude Code / Cursor)

```
You are implementing the Angular 20 frontend for the Fund Scoping feature.
Reference: .specify/workflows/speckit/spec.md and .specify/workflows/speckit/plan.md

IMPORTANT CONSTRAINTS:
- Do NOT install any new npm packages. Use only what is already in package.json:
  Angular 20, ReactiveFormsModule, NgRx, Bootstrap 5, RxJS, Luxon.
- Reuse existing shared components:
    src/app/shared/components/multi-select-dropdown/   (for Type of Investment, Broker/Custodians)
    src/app/shared/components/datepicker-wrapper/      (for all three date columns)
- Do NOT create an AddFundComponent or a /scoping/fund/add route.
  All fund operations (Add, Edit, Duplicate, Delete) happen inline in FundScopingGridComponent.
- standalone: false for all new components.
- takeUntilDestroyed(this.destroyRef) for all subscriptions.
- EnvService.apiURL as base for all HTTP calls.
- Bootstrap 5 utility classes only; no extra CSS frameworks.
- Do not modify any existing engagement components.

Execute the following phases in order. Run `npm run build` at each checkpoint before proceeding.

─────────────────────────────────────────────────────
PHASE 1 — Foundation  (no npm installs needed)
─────────────────────────────────────────────────────
1. Create src/app/features/fund/fund-state/fund.model.ts
   Interfaces: Fund, FundRow, FundSaveRequest, FundResponse, DeleteFundsResponse,
               LookupItem, FundState, FundLookups

2. Create src/app/shared/services/fund/fund.service.ts
   Methods (all using HttpClient + EnvService.apiURL):
     getFunds(engagementId): Observable<Fund[]>          GET /api/Fund?engagementId={id}
     addFund(row): Observable<FundResponse>              POST /api/Fund
     updateFund(id, row): Observable<FundResponse>       PUT /api/Fund/{id}
     deleteFunds(ids): Observable<DeleteFundsResponse>   DELETE /api/Fund
     getTypeOfFunds(): Observable<LookupItem[]>          GET /api/lookup/fund-types
     getTypeOfInvestments(): Observable<LookupItem[]>    GET /api/lookup/investment-types
     getFundAdministrators(): Observable<LookupItem[]>   GET /api/lookup/fund-administrators
     getBrokerCustodians(): Observable<LookupItem[]>     GET /api/lookup/broker-custodians
     getReportingCurrencies(): Observable<LookupItem[]>  GET /api/lookup/currencies

3. Create NgRx fund state files under src/app/features/fund/fund-state/:
     fund.actions.ts   — loadFunds / Success / Failure,
                         loadLookups / Success,
                         addFund / Success / Failure,
                         updateFund / Success / Failure,
                         deleteFunds / Success / Failure,
                         setNewlyAddedFundIds, clearNewlyAddedFundIds
     fund.reducer.ts   — FundState { funds[], loading, saving, error,
                                      newlyAddedFundIds: number[],
                                      lookups: FundLookups }
     fund.effects.ts   — side effects calling FundService for all actions
     fund.selectors.ts — selectFunds, selectFundLoading, selectFundError,
                          selectNewlyAddedFundIds, selectLookups

4. Add fundReducer to src/app/store/reducers/index.ts
   Register FundEffects in app.config.ts (provideEffects)

5. Create src/app/features/fund/fund.module.ts
   Imports: CommonModule, ReactiveFormsModule, SharedModule, RouterModule
   Declares: FundScopingPageComponent, FundScopingGridComponent
   (No GridModule, ToolbarService, or any Syncfusion imports)

6. Import FundModule in ScopingModule — no new route needed

CHECKPOINT 1: npm run build passes with no errors.

─────────────────────────────────────────────────────
PHASE 2 — Fund Scoping Tab + Grid Shell (User Story 1)
─────────────────────────────────────────────────────
7. ScopingComponent: add third tab "Fund Scoping"
   - Extend activeTab union: 'add' | 'details' | 'fund'
   - Add tab button and tab-pane for <app-fund-scoping-page>
   - Do not touch the existing two tabs

8. Create FundScopingPageComponent (fund-scoping-page)
   - On ngOnInit: dispatch loadFunds(engagementId) and loadLookups
   - Toolbar buttons: Add Fund, Delete Fund, Duplicate Fund, Save, Back
     (wired in later phases; render them now as disabled placeholders)
   - Passes funds$, lookups$, loading$, error$ into <app-fund-scoping-grid> via @Input

9. Create FundScopingGridComponent (fund-scoping-grid)
   @Input funds: Fund[]
   @Input lookups: FundLookups
   @Input loading: boolean
   @Input error: string | null
   @Output dirty = new EventEmitter<boolean>()
   @Output selectedIds = new EventEmitter<number[]>()

   Internal state:
     fundArray: FormArray  (one FormGroup per fund row)
     editingCell: { rowIndex: number, field: string } | null = null
     newRowIndices: Set<number> = new Set()  (tracks unsaved new rows for green highlight)
     selectedSet: Set<number> = new Set()

   Template: Bootstrap <table class="table table-bordered table-hover align-middle">
     <thead> — column headers matching spec column order
     <tbody *ngFor="let row of fundArray.controls; let i = index">
       Each <td> uses *ngIf="isEditing(i, 'field'); else displayTpl" to toggle
       between read-view (plain text / display name) and edit-view (input control)
     <tr *ngIf="fundArray.length === 0"> — empty state row
   Loading spinner overlay while loading is true
   Error banner when error is non-null

   Cell editor mapping (use only these controls — no Syncfusion):
     Fund Name        → <input type="text" [formControl]="...">
     Type of Fund     → <select [formControl]="..."><option *ngFor>
     Type of Inv.     → <app-multi-select-dropdown [options]="lookups.typeOfInvestments">
     Fund Admin       → <select [formControl]="..."><option *ngFor>
     Broker/Cust.     → <app-multi-select-dropdown [options]="lookups.brokerCustodians">
     Rep. Currency    → <select [formControl]="..."><option *ngFor>
     Period Begin     → <app-datepicker-wrapper [formControl]="...">
     Period End       → <app-datepicker-wrapper [formControl]="...">
     Exp. Audit Date  → <app-datepicker-wrapper [formControl]="...">
     Status           → plain text, never editable

   (dblclick) on a <td>: sets editingCell = { rowIndex: i, field }
   (blur) / (keydown.enter) on edit control: clears editingCell

CHECKPOINT 2: /scoping → Fund Scoping tab visible → grid renders with loading/empty state.

─────────────────────────────────────────────────────
PHASE 3 — Add Fund + Save (User Story 2)
─────────────────────────────────────────────────────
10. FundScopingGridComponent.addRow():
    - Creates a blank FormGroup with all fields and validators (see spec inline validation rules)
    - Unshifts it to fundArray (prepend)
    - Adds its index to newRowIndices
    - All cells immediately in edit mode for that row (isNewRow check, not editingCell)

11. FundScopingPageComponent — "Add Fund" button:
    - Calls fundScopingGrid.addRow()
    - Disabled when fundArray.length >= 15

12. FundScopingPageComponent — "Save" button (onSave()):
    - Marks all controls as touched to surface validation errors
    - If fundArray.invalid: show error banner "Please fix validation errors before saving."
    - For each new row (index in newRowIndices):
        dispatch addFund action → FundService.addFund(row.value)
        on addFundSuccess: replace temp row with server fund; emit setNewlyAddedFundIds
    - Newly added rows keep [class.table-success] (green) on <tr>
    - clearNewlyAddedFundIds dispatched on any user interaction (click, scroll, tab change)

13. FormGroup validators (custom + built-in):
    - fundName: [Validators.required, Validators.minLength(3), Validators.maxLength(200),
                 containsLetterValidator, uniqueFundNameValidator(fundArray)]
    - typeOfFundId: [Validators.required]
    - typesOfInvestmentIds: [Validators.required, minArrayLengthValidator(1)]
    - fundAdministratorId: [Validators.required]
    - brokerCustodianIds: [Validators.required, minArrayLengthValidator(1)]
    - reportingCurrencyId: [Validators.required]
    - periodBeginDate: [Validators.required, maxDateTodayValidator]
    - periodEndDate: [Validators.required] + cross-field: afterBeginDateValidator
    - expectedAuditSignOffDate: [Validators.required] + cross-field: auditSignOffValidator

14. "Back" button:
    - If fundArray.dirty: open Bootstrap modal (use Bootstrap JS Modal API, no new component)
      "Are you sure you want to leave this page without saving?" — Yes → navigate, No → stay
    - If clean: navigate immediately

CHECKPOINT 3: Add Fund button → blank row appears → fill fields → Save → row becomes
              non-editable with green highlight + success banner.

─────────────────────────────────────────────────────
PHASE 4 — Inline Edit (User Story 3)
─────────────────────────────────────────────────────
15. Existing rows: (dblclick) on any non-locked cell → sets editingCell
16. On (blur)/(keydown.enter) for existing rows (have fundId):
    - Validate that specific field control
    - If valid: dispatch updateFund action → FundService.updateFund(fundId, row.value)
    - Show success banner "Fund has been updated successfully: <Fund Name>"
    - On failure: show error banner "We could not save your changes. Please try again."

17. Status locking per row: on fundArray init, for each fund where status indicates post-Data-Import:
    formGroup.get('periodBeginDate').disable()
    formGroup.get('periodEndDate').disable()
    formGroup.get('typeOfFundId').disable()
    → disabled cells show plain text; (dblclick) is suppressed via *ngIf on edit template

CHECKPOINT 4: Double-click a Fund Name cell → text input appears → blur → success banner.

─────────────────────────────────────────────────────
PHASE 5 — Delete + Duplicate (User Story 4)
─────────────────────────────────────────────────────
18. Checkbox column:
    First <td> of each row: <input type="checkbox" [(ngModel)]="isSelected(i)">
    Tracks selectedSet: Set<number> (using fundId for saved rows, temp index for new rows)
    Emits selectedIds output whenever selectedSet changes

19. "Delete Fund" button (FundScopingPageComponent):
    - Enabled only when selectedIds.size > 0
    - On click: dispatch deleteFunds action → FundService.deleteFunds([...selectedIds])
    - On deleteFundsSuccess: remove matching FormGroups from fundArray; clear selectedSet
    - If response.skipped.length > 0: show info banner:
      "The following funds could not be deleted: <name1>, <name2>."

20. "Duplicate Fund" button (FundScopingPageComponent):
    - Enabled only when exactly 1 checkbox is selected AND fundArray.length < 15
    - On click: get selected row's FormGroup values; create a new FormGroup with same values
      but no fundId; prepend to fundArray; add index to newRowIndices; immediately editable

CHECKPOINT 5: Check a fund → Delete Fund → fund removed from grid instantly.
              Check a fund → Duplicate Fund → new editable row appears with same values.

─────────────────────────────────────────────────────
PHASE 6 — Polish
─────────────────────────────────────────────────────
21. Validate grid row count label: show "X / 15 funds" in toolbar
22. Keyboard accessibility: Enter confirms edit, Escape cancels edit (restores previous value)
23. Run: npm run lint  — fix all warnings
24. Run: npm run build --configuration=production  — must pass clean
```

---

### PROMPT — .NET Core Backend Plan Execution (use in Claude Code / Cursor on backend repo)

```
You are implementing the .NET Core backend for the Fund Scoping feature.
Reference: .specify/workflows/speckit/spec.md and .specify/workflows/speckit/plan.md

Execute the following phases in order:

PHASE 1 — Entities & Migration
1. Create Domain/Entities/Fund.cs with all fields from spec Key Entities
2. Create control-table entities: TypeOfFund, TypeOfInvestment, FundAdministrator,
   BrokerCustodian, ReportingCurrency
3. Create join tables: FundInvestmentType, FundBrokerCustodian
4. Register all entities in existing DbContext with proper relationships and indexes:
   - Index on Fund(EngagementId)
   - Unique index on Fund(EngagementId, FundName)
5. Add EF Core migration: AddFundTables
6. Add seed data for all control tables (values listed in spec.md Key Entities)
CHECKPOINT 1: dotnet ef database update succeeds; seed data is present.

PHASE 2 — Repository & Service
7. Create IFundRepository with methods:
   GetByEngagementAsync, AddAsync, UpdateAsync, DeleteManyAsync, ExistsByNameAsync
8. Create FundRepository implementing IFundRepository using existing DbContext
9. Create ILookupRepository with methods for all 5 control tables
10. Create LookupRepository implementing ILookupRepository
11. Register both repositories in DI (Program.cs or Startup.cs)
12. Create Application/DTOs: FundDto, CreateFundDto, UpdateFundDto, DeleteFundsDto,
    FundResponseDto, LookupItemDto, DeleteFundsResponseDto
13. Create Application/Validators/CreateFundValidator and UpdateFundValidator
    (full rules from spec FR-005 and US2 acceptance scenarios)
14. Create Application/Services/FundService implementing business logic + calling repo
CHECKPOINT 2: Unit tests pass for FundService validation rules.

PHASE 3 — Controllers
15. Create API/Controllers/FundController with:
    GET  api/Fund?engagementId → 200 List<FundDto>
    POST api/Fund              → 201 FundResponseDto
    PUT  api/Fund/{fundId}     → 200 FundResponseDto
    DELETE api/Fund            → 204 + DeleteFundsResponseDto
16. Create API/Controllers/LookupController with GET endpoints for all 5 lookup lists
17. Apply [Authorize] to both controllers (matching existing auth pattern)
18. Add CORS headers if needed to allow Angular dev server (localhost:4200)
CHECKPOINT 3: Postman/Swagger can hit all endpoints; GET returns seed data.

PHASE 4 — Deletability & Error Handling
19. Implement deletability check in FundService.DeleteManyAsync:
    - Fund is deletable if status is before "Data Import" stage
    - Return { deleted: [], skipped: [{id, name}] }
20. Add global exception handler / ProblemDetails for 400, 404, 409 responses
21. Return field-level error array from POST/PUT on validation failure
CHECKPOINT 4: POST with duplicate name returns 409; POST with blank mandatory field returns 400
             with field-level errors; DELETE with non-deletable fund returns skipped list.

PHASE 5 — Performance & Polish
22. Review all EF queries — ensure .Include() and .Select(dto) projection are used
    (no N+1 on 200-fund dataset)
23. Add response caching (short TTL) for lookup endpoints
24. Confirm swagger/OpenAPI annotations are present
CHECKPOINT 5: GET /api/Fund?engagementId=1 with 200 seeded funds returns in < 500ms.

Constraints:
- Use existing DbContext — do not create a new one
- Match existing controller base class / ApiResponse wrapper if present
- Use async/await throughout; no sync DB calls
- Follow existing naming conventions (PascalCase, etc.)
```
