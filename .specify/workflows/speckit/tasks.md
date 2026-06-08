# Tasks: Fund Scoping

**Spec**: `.specify/workflows/speckit/spec.md`
**Plan**: `.specify/workflows/speckit/plan.md`
**Updated**: 2026-06-03

---

## Legend

- **[P]** = Can run in parallel (no shared-file dependency)
- **[US1–US4]** = User story this task belongs to
- `UI:` = Angular 20 frontend task
- `BE:` = .NET Core backend task

> **UI constraint**: Do NOT install any new npm packages. Use only what is already in
> `package.json` (Angular 20, ReactiveFormsModule, NgRx, Bootstrap 5, RxJS, Luxon).
> Reuse `MultiSelectDropdownComponent` and `DatepickerWrapperComponent` from shared/.
> No Syncfusion. No AddFundComponent. No separate /scoping/fund/add route.
> No DeleteFundModalComponent. All fund operations are inline inside FundScopingGridComponent.

---

## Phase 1 — Foundation (both teams; blocks all user stories)

### UI Foundation

- [ ] T001 [P] Create `src/app/features/fund/fund-state/fund.model.ts`
  Interfaces: `Fund`, `FundRow`, `FundSaveRequest`, `FundResponse`, `DeleteFundsResponse`,
  `LookupItem`, `FundLookups`, `FundState`

- [ ] T002 [P] Create `src/app/shared/services/fund/fund.service.ts`
  All methods using `HttpClient` + `EnvService.apiURL` (return empty stubs while BE is pending):
  - `getFunds(engagementId)` → `GET /api/Fund?engagementId={id}`
  - `addFund(row)` → `POST /api/Fund`
  - `updateFund(id, row)` → `PUT /api/Fund/{id}`
  - `deleteFunds(ids)` → `DELETE /api/Fund`
  - `getTypeOfFunds()` → `GET /api/lookup/fund-types`
  - `getTypeOfInvestments()` → `GET /api/lookup/investment-types`
  - `getFundAdministrators()` → `GET /api/lookup/fund-administrators`
  - `getBrokerCustodians()` → `GET /api/lookup/broker-custodians`
  - `getReportingCurrencies()` → `GET /api/lookup/currencies`

- [ ] T003 Create NgRx fund state files under `src/app/features/fund/fund-state/` (after T001):
  - `fund.actions.ts` — `loadFunds/Success/Failure`, `loadLookups/Success`,
    `addFund/Success/Failure`, `updateFund/Success/Failure`,
    `deleteFunds/Success/Failure`, `setNewlyAddedFundIds`, `clearNewlyAddedFundIds`
  - `fund.reducer.ts` — `FundState { funds[], loading, saving, error,
    newlyAddedFundIds: number[], lookups: FundLookups }`
  - `fund.effects.ts` — side effects calling `FundService` for all actions above
  - `fund.selectors.ts` — `selectFunds`, `selectFundLoading`, `selectFundError`,
    `selectNewlyAddedFundIds`, `selectLookups`, `selectFundSaving`

- [ ] T004 Register `fundReducer` in `src/app/store/reducers/index.ts`; register `FundEffects`
  via `provideEffects(FundEffects)` in `app.config.ts` (after T003)

- [ ] T005 Create `src/app/features/fund/fund.module.ts`
  Imports: `CommonModule`, `ReactiveFormsModule`, `FormsModule`, `SharedModule`, `RouterModule`
  Declares: `FundScopingPageComponent`, `FundScopingGridComponent`
  *(No GridModule, ToolbarService, or any Syncfusion import)*

- [ ] T006 Import `FundModule` in `ScopingModule` — no new child route needed (after T005)

**Checkpoint**: `npm run build` succeeds with no errors.

---

### BE Foundation

- [ ] T007 [P] Create `Domain/Entities/Fund.cs` — all fields from spec Key Entities including
  navigation properties for all control-table relationships

- [ ] T008 [P] Create control-table entities:
  `TypeOfFund.cs`, `TypeOfInvestment.cs`, `FundAdministrator.cs`,
  `BrokerCustodian.cs`, `ReportingCurrency.cs`

- [ ] T009 [P] Create join-table entities: `FundInvestmentType.cs`, `FundBrokerCustodian.cs`

- [ ] T010 Register all new entities in existing `DbContext` — configure relationships,
  add index on `Fund(EngagementId)`, unique index on `Fund(EngagementId, FundName)` (after T007–T009)

- [ ] T011 Create and run EF Core migration `AddFundTables` (after T010)

- [ ] T012 [P] Add seed data for all 5 control tables with values from spec Key Entities (after T011)

- [ ] T013 [P] Create `Domain/Interfaces/IFundRepository.cs` and `ILookupRepository.cs`

- [ ] T014 Create `Application/DTOs/`:
  `FundDto`, `CreateFundDto`, `UpdateFundDto`, `DeleteFundsDto`,
  `FundResponseDto`, `LookupItemDto`, `DeleteFundsResponseDto`

**Checkpoint**: `dotnet ef database update` succeeds; seed data rows present in all control tables.

---

## Phase 2 — User Story 1: View Fund Scoping Grid (P1)

**Goal**: Fund Scoping tab visible; Bootstrap table grid loads funds from API; lookups cached.

### UI — US1

- [ ] T015 [US1] Add third "Fund Scoping" tab to `ScopingComponent`
  - Extend `activeTab` union: `'add' | 'details' | 'fund'`
  - Add tab `<button>` and `<div class="tab-pane">` for `<app-fund-scoping-page>`
  - Do NOT touch the existing "Engagement Details" or "Add Engagement" tabs

- [ ] T016 [US1] Create `FundScopingPageComponent` (`fund-scoping-page`)
  - On `ngOnInit`: dispatch `loadFunds(engagementId)` + `loadLookups`; `engagementId` read
    from NgRx store (`state.engDetails.entities[0].engagementId`)
  - Passes `funds$`, `lookups$`, `loading$`, `error$`, `saving$` into `<app-fund-scoping-grid>`
    via `@Input`
  - Hosts the action toolbar (buttons wired in later phases; disabled placeholders now):
    Add Fund | Delete Fund | Duplicate Fund | Save | Back

- [ ] T017 [US1] Create `FundScopingGridComponent` (`fund-scoping-grid`)

  **Inputs / outputs**:
  - `@Input() funds: Fund[]`
  - `@Input() lookups: FundLookups`
  - `@Input() loading: boolean`
  - `@Input() error: string | null`
  - `@Output() dirty = new EventEmitter<boolean>()`
  - `@Output() selectedIds = new EventEmitter<number[]>()`
  - `@Output() rowCount = new EventEmitter<number>()`

  **Internal state**:
  - `fundArray: FormArray` — one `FormGroup` per fund row
  - `editingCell: { rowIndex: number; field: string } | null = null`
  - `newRowIndices: Set<number> = new Set()` — tracks unsaved rows for green highlight
  - `selectedSet: Set<number | string> = new Set()` — tracks checked rows

  **Template** (`Bootstrap <table class="table table-bordered table-hover align-middle">`):
  - `<thead>` — column headers in spec column order (Checkbox, Fund Name, Type of Fund,
    Type of Investment, Fund Administrator, Broker/Custodians, Reporting Currency,
    Period Begin Date, Period End Date, Exp. Audit Sign-Off Date, Status)
  - `<tbody *ngFor="let ctrl of fundArray.controls; let i = index">` — one `<tr>` per row;
    `[class.table-success]="newRowIndices.has(i)"` for green highlight
  - Empty-state `<tr>` when `fundArray.length === 0` and `!loading`:
    "No funds found for this engagement"
  - Loading spinner overlay while `loading` is true
  - Error banner "Failed to load funds. Please try again." when `error` is non-null

- [ ] T018 [US1] Wire NgRx effects for US1 (after T003, T002):
  - `loadFundsEffect`: calls `FundService.getFunds()` → dispatch `loadFundsSuccess/Failure`
  - `loadLookupsEffect`: calls all 5 `FundService.get*()` lookup methods in parallel
    (`forkJoin`) → dispatch `loadLookupsSuccess`
  - On `loadFundsSuccess`: `FundScopingGridComponent` rebuilds `fundArray` from
    `funds` input change (via `ngOnChanges`)

**Checkpoint**: Navigate `/scoping` → click Fund Scoping tab → grid renders with correct
columns; loading spinner shows then either rows or empty-state; error banner on API failure.

---

### BE — US1

- [ ] T019 [P] [US1] Create `Infrastructure/Repositories/FundRepository.cs` implementing
  `IFundRepository`; implement `GetByEngagementAsync` with `.Include()` for all control-table
  navigation props; project to `FundDto` using `.Select()`

- [ ] T020 [P] [US1] Create `Infrastructure/Repositories/LookupRepository.cs` implementing
  `ILookupRepository`; read all 5 control tables and return `List<LookupItemDto>`

- [ ] T021 [US1] Register `FundRepository` and `LookupRepository` in DI (after T019–T020)

- [ ] T022 [US1] Create `Application/Services/FundService.cs` — implement
  `GetFundsByEngagementAsync(engagementId)` using repo + DTO projection

- [ ] T023 [US1] Create `API/Controllers/FundController.cs`
  - `GET api/Fund?engagementId` → `200 List<FundDto>`; apply `[Authorize]`

- [ ] T024 [US1] Create `API/Controllers/LookupController.cs`
  - All five `GET api/lookup/*` endpoints → `200 List<LookupItemDto>`; apply `[Authorize]`

**Checkpoint**: `GET /api/Fund?engagementId=1` returns `[]`; all five lookup endpoints
return seeded data via Swagger / Postman.

---

## Phase 3 — User Story 2: Add Fund Inline (P2)

**Goal**: "Add Fund" button inserts a blank editable row at the top of the grid; "Save"
commits it to the API; green highlight persists until next user action.

### UI — US2

- [ ] T025 [US2] Implement `FundScopingGridComponent.buildRowGroup(fund?: Fund): FormGroup`
  Creates a `FormGroup` with controls for all 9 editable fields and all validators (T028).
  When `fund` is provided, pre-fills values (used for Duplicate in Phase 5).

- [ ] T026 [US2] Implement `FundScopingGridComponent.addRow()`
  - Calls `buildRowGroup()` with no argument (blank row)
  - `fundArray.insert(0, newGroup)` (prepend)
  - `newRowIndices.add(0)`; shift existing indices up by 1
  - All cells on the new row immediately show their edit control (skip `editingCell` guard
    for rows whose index is in `newRowIndices`)
  - Emits `rowCount` output; emits `dirty = true`

- [ ] T027 [US2] Toolbar "Add Fund" button in `FundScopingPageComponent`
  - Calls `fundScopingGrid.addRow()`
  - Disabled when `rowCount >= 15` (subscribed from `rowCount` output)
  - Show row count label: `"{{ rowCount }} / 15 funds"` in toolbar

- [ ] T028 [US2] Custom Angular validators (create in `fund-state/fund.validators.ts`):
  - `containsLetterValidator`: `FormControl` must contain ≥1 alphabetic character
  - `uniqueFundNameValidator(fundArray: FormArray)`: cross-row duplicate check within grid
  - `minArrayLengthValidator(min)`: for multi-select `FormControl` (array value must have ≥ `min` items)
  - `maxDateTodayValidator`: date value must be ≤ today
  - `afterBeginDateValidator`: cross-field validator on `FormGroup` — `periodEndDate > periodBeginDate`
  - `auditSignOffDateValidator`: cross-field — `expectedAuditSignOffDate ≥ today AND ≥ periodBeginDate AND ≥ periodEndDate`

  Apply to each `FormGroup` in `buildRowGroup()`:
  - `fundName`: `[Validators.required, Validators.minLength(3), Validators.maxLength(200), containsLetterValidator, uniqueFundNameValidator(fundArray)]`
  - `typeOfFundId`: `[Validators.required]`
  - `typesOfInvestmentIds`: `[Validators.required, minArrayLengthValidator(1)]`
  - `fundAdministratorId`: `[Validators.required]`
  - `brokerCustodianIds`: `[Validators.required, minArrayLengthValidator(1)]`
  - `reportingCurrencyId`: `[Validators.required]`
  - `periodBeginDate`: `[Validators.required, maxDateTodayValidator]`
  - `periodEndDate`: `[Validators.required]` + `afterBeginDateValidator` on `FormGroup`
  - `expectedAuditSignOffDate`: `[Validators.required]` + `auditSignOffDateValidator` on `FormGroup`

- [ ] T029 [US2] Toolbar "Save" button in `FundScopingPageComponent` — `onSave()`:
  - Calls `fundArray.markAllAsTouched()`
  - If `fundArray.invalid`: show top-of-page error banner
    "Please fix validation errors before saving." — do not call API
  - For each row index in `newRowIndices` (new rows only):
    dispatch `addFund` NgRx action → `FundService.addFund(row.value)`
  - On `addFundSuccess` per row: update `FormGroup` with server-returned `fundId`;
    remove index from `newRowIndices`; dispatch `setNewlyAddedFundIds([fundId])`
  - Green `[class.table-success]` on saved rows clears when `clearNewlyAddedFundIds`
    is dispatched (triggered on: any toolbar click, tab change, next edit action)
  - On `addFundFailure`: show error banner "Fund could not be saved. Please try again."

- [ ] T030 [US2] Field-level error display in `FundScopingGridComponent` template
  - Each editable `<td>` shows a red outline (`is-invalid` Bootstrap class) when
    `ctrl.touched && ctrl.invalid`
  - Tooltip/small error text beneath the input for each error type:
    required → "This field is required"
    minlength → "Minimum 3 characters required"
    containsLetter → "Must contain at least 1 letter"
    uniqueFundName → "This fund name already exists"
    maxDateToday → "Date cannot be in the future"
    afterBeginDate → "Must be after Period Begin Date"
    auditSignOff → "Must be ≥ today, Period Begin Date, and Period End Date"

- [ ] T031 [US2] Toolbar "Back" button in `FundScopingPageComponent`
  - If `fundArray.dirty`: open Bootstrap modal
    (use `new bootstrap.Modal(...)` native JS API — no new component)
    "Are you sure you want to leave this page without saving?" — Yes / No
  - Yes → `router.navigate` back; No → close modal and stay

**Checkpoint**: Click "Add Fund" → blank row appears at top of grid, immediately editable →
fill all fields → click "Save" → row becomes read-only with green highlight + success banner.
"1 / 15 funds" shows in toolbar.

---

### BE — US2

- [ ] T032 [US2] Create `Application/Validators/CreateFundValidator.cs`
  All rules from spec: required fields, Fund Name (3–200, ≥1 letter), duplicate check,
  date ordering, materiality numeric bounds

- [ ] T033 [US2] Implement `FundRepository.AddAsync(dto, engagementId)` and
  `ExistsByNameAsync(engagementId, fundName, excludeId? = null)`

- [ ] T034 [US2] Implement `FundService.AddFundAsync(dto, engagementId)`:
  - Run `CreateFundValidator`
  - Call `ExistsByNameAsync` → return 409 shape if duplicate
  - Map DTO → entity → persist via `FundRepository.AddAsync`
  - Return `FundResponseDto { success, message, fundId }`

- [ ] T035 [US2] Implement `POST api/Fund` in `FundController`:
  - `201 Created` with `FundResponseDto` on success
  - `400 Bad Request` with field-error array on validation failure
  - `409 Conflict` on duplicate fund name

**Checkpoint**: `POST /api/Fund` with valid body → 201; with duplicate name → 409;
with blank mandatory field → 400 with per-field error array.

---

## Phase 4 — User Story 3: Edit Fund Inline (P3)

**Goal**: Double-click any non-locked editable cell on an existing row → inline editor
appears → blur/Enter saves to API → success banner shown.

### UI — US3

- [ ] T036 [US3] Add `editingCell: { rowIndex: number; field: string } | null = null`
  and `prevCellValue: any = null` to `FundScopingGridComponent`
  - Helper: `isEditing(i: number, field: string): boolean`
  - Helper: `isNewRow(i: number): boolean` — `newRowIndices.has(i)`

- [ ] T037 [US3] `(dblclick)` handler on each editable `<td>`:
  - If `isNewRow(i)`: no-op (new rows are always editing)
  - If cell is locked (`ctrl.disabled`): no-op
  - Otherwise: store `prevCellValue = ctrl.value`; set `editingCell = { rowIndex: i, field }`

- [ ] T038 [US3] Cell template pattern for each editable column
  (using `*ngIf="isEditing(i, 'fieldName') || isNewRow(i); else displayTpl"`):

  | Field | Edit control |
  |---|---|
  | Fund Name | `<input type="text" class="form-control" [formControl]="ctrl">` |
  | Type of Fund | `<select class="form-select" [formControl]="ctrl"><option *ngFor>` |
  | Type of Investment | `<app-multi-select-dropdown [options]="lookups.typeOfInvestments" [formControl]="ctrl">` |
  | Fund Administrator | `<select class="form-select" [formControl]="ctrl"><option *ngFor>` |
  | Broker/Custodians | `<app-multi-select-dropdown [options]="lookups.brokerCustodians" [formControl]="ctrl">` |
  | Reporting Currency | `<select class="form-select" [formControl]="ctrl"><option *ngFor>` |
  | Period Begin Date | `<app-datepicker-wrapper [formControl]="ctrl">` |
  | Period End Date | `<app-datepicker-wrapper [formControl]="ctrl">` |
  | Exp. Audit Sign-Off | `<app-datepicker-wrapper [formControl]="ctrl">` |
  | Status | plain text (no edit control ever) |

  Display template (`#displayTpl`): show human-readable text (lookup name for FK fields,
  formatted date for date fields, plain text for Fund Name)

- [ ] T039 [US3] `(blur)` / `(keydown.enter)` handler on each edit control
  (for existing rows with a `fundId`):
  - Validate the `FormGroup`; if this field is invalid: mark touched, show error, do NOT save,
    keep `editingCell` set (user must fix before moving away)
  - If valid: clear `editingCell`; if value changed from `prevCellValue`:
    dispatch `updateFund({ fundId, row: formGroup.value })` NgRx action
  - `(keydown.escape)`: restore `prevCellValue` into the control; clear `editingCell`

- [ ] T040 [US3] Wire `updateFundEffect` in `fund.effects.ts`:
  `updateFund` action → `FundService.updateFund(fundId, row)` →
  `updateFundSuccess` (show success banner "Fund has been updated successfully: <Fund Name>") /
  `updateFundFailure` (show error banner "We could not save your changes. Please try again.")

- [ ] T041 [US3] Status locking in `FundScopingGridComponent.ngOnChanges` when rebuilding
  `fundArray` from `funds` input:
  For funds whose `status` indicates post-Data-Import stage:
  `group.get('periodBeginDate').disable()`
  `group.get('periodEndDate').disable()`
  `group.get('typeOfFundId').disable()`
  Disabled cells never trigger `(dblclick)` edit logic; always render their display template

**Checkpoint**: Double-click Fund Name cell on an existing row → text input appears →
change value → press Enter or click elsewhere → success banner; DB value updated.
Locked cells on a post-Data-Import fund cannot be double-clicked into edit mode.

---

### BE — US3

- [ ] T042 [US3] Create `Application/Validators/UpdateFundValidator.cs`
  Same rules as `CreateFundValidator` except duplicate-name check excludes the current `fundId`

- [ ] T043 [US3] Implement `FundRepository.UpdateAsync(fundId, dto)`

- [ ] T044 [US3] Implement `FundService.UpdateFundAsync(fundId, dto)`:
  - Run `UpdateFundValidator`
  - Enforce field-lock rules server-side (reject writes to locked fields based on `status`)
  - Persist via `FundRepository.UpdateAsync`
  - Return `FundResponseDto`

- [ ] T045 [US3] Implement `PUT api/Fund/{fundId}` in `FundController`:
  - `200 OK` with `FundResponseDto` on success
  - `400 Bad Request` on validation failure or locked-field edit attempt
  - `404 Not Found` if `fundId` does not exist

**Checkpoint**: `PUT /api/Fund/{id}` with valid body → 200; attempt to edit a locked
field on a post-Data-Import fund → 400.

---

## Phase 5 — User Story 4: Delete Fund + Duplicate Fund (P4)

**Goal**: Checkbox column enables Delete (immediate, no modal) and Duplicate (copy row) actions.

### UI — US4

- [ ] T046 [US4] Checkbox column in `FundScopingGridComponent`
  - First `<td>` of each `<tr>`: `<input type="checkbox" [(ngModel)]="isChecked(i)"
    (change)="onCheckboxChange(i, $event)">`
  - `selectedSet: Set<number | string>` tracks checked rows (use `fundId` for saved rows,
    temp string key `"new-{i}"` for unsaved new rows)
  - On change: emit `selectedIds` output with current set as array

- [ ] T047 [US4] "Delete Fund" toolbar button in `FundScopingPageComponent`
  - Disabled when `selectedIds.length === 0`
  - On click: dispatch `deleteFunds({ fundIds: [...selectedIds] })` NgRx action immediately
    (no confirmation modal)
  - On `deleteFundsSuccess`: remove all `FormGroup`s at deleted indices from `fundArray`;
    clear `selectedSet`; emit updated `rowCount`
  - If `response.skipped.length > 0`: show info banner:
    `"The following fund(s) could not be deleted (past Data Import stage): <name1>, <name2>."`
  - On `deleteFundsFailure`: show error banner "Delete failed. Please try again."

- [ ] T048 [US4] Wire `deleteFundsEffect` in `fund.effects.ts`:
  `deleteFunds` action → `FundService.deleteFunds(ids)` →
  `deleteFundsSuccess({ response })` / `deleteFundsFailure({ error })`

- [ ] T049 [US4] "Duplicate Fund" toolbar button in `FundScopingPageComponent`
  - Enabled only when exactly 1 checkbox is selected AND `rowCount < 15`
  - On click: get the selected row's `FormGroup.getRawValue()`; call
    `fundScopingGrid.addRow(sourceValues)` passing values (no `fundId`)
  - `addRow` with values: calls `buildRowGroup(sourceValues)`, prepends to `fundArray`,
    adds to `newRowIndices` — new row is immediately editable with pre-filled values

**Checkpoint**: Select 1 fund checkbox → "Delete Fund" → fund instantly removed from grid.
Select 1 fund → "Duplicate Fund" → new editable row appears pre-filled; "1 / 15 funds"
label updates correctly.

---

### BE — US4

- [ ] T050 [US4] Implement `FundRepository.DeleteManyAsync(fundIds)`:
  - For each `fundId`: check if `status` is before "Data Import" stage
  - Delete deletable funds in a single DB transaction
  - Collect skipped `{ id, name }` for non-deletable funds
  - Return `DeleteFundsResponseDto { deleted: int[], skipped: [{id, name}] }`

- [ ] T051 [US4] Implement `FundService.DeleteFundsAsync(dto)` delegating to repository

- [ ] T052 [US4] Implement `DELETE api/Fund` in `FundController`:
  - Accept `{ fundIds: int[] }` in request body
  - `204 No Content` with `DeleteFundsResponseDto` body on success
  - `400 Bad Request` if `fundIds` is null or empty

**Checkpoint**: `DELETE /api/Fund` with mixed deletable/non-deletable IDs returns `skipped`
list; only deletable funds are removed from DB.

---

## Phase 6 — Polish & Cross-Cutting

### UI Polish

- [ ] T053 [P] Toolbar row count: show `"{{ rowCount }} / 15 funds"` label; update on every
  `addRow`, `deleteFunds`, and grid load

- [ ] T054 [P] Keyboard UX in `FundScopingGridComponent`:
  - `Enter` on edit control: confirm edit (same as blur)
  - `Escape` on edit control: cancel edit, restore `prevCellValue`

- [ ] T055 [P] `clearNewlyAddedFundIds` dispatch: hook into toolbar button clicks,
  tab switch away from Fund Scoping, and route navigation to clear green highlights

- [ ] T056 [P] Add ARIA labels to checkbox column header (`aria-label="Select fund"`),
  table (`role="grid"`), and action buttons

- [ ] T057 Run `npm run lint` — fix all lint warnings; then
  run `npm run build --configuration=production` — must pass clean

### BE Polish

- [ ] T058 [P] Review all EF Core queries for N+1 issues — ensure `.Select(x => new FundDto{...})`
  projection is used instead of materialising full entities

- [ ] T059 [P] Add short-TTL response caching (5 min) to all five `GET api/lookup/*` endpoints
  in `LookupController` using `[ResponseCache]` or memory cache middleware

- [ ] T060 Performance test: seed 200 funds for one engagement; verify
  `GET /api/Fund?engagementId=1` responds in < 500ms; verify grid renders without scroll jank

- [ ] T061 [P] Add OpenAPI/Swagger `[ProducesResponseType]` annotations to all actions in
  `FundController` and `LookupController`

- [ ] T062 Update `nasc-ui/nasc-ui/START_DEV_SERVER.md` to document the Fund Scoping tab URL
  and the four toolbar actions (Add / Delete / Duplicate / Save)

---

## Dependencies & Execution Order

```
T001–T014  Foundation — UI (T001–T006) and BE (T007–T014) run in parallel
    ↓
T015–T024  US1 — View Grid (start after Foundation complete)
    ↓
T025–T045  US2 + US3 — UI teams can work Add-row (T025–T031) and Edit-inline (T036–T041)
           in sequence; BE teams work Add (T032–T035) and Edit (T042–T045) in sequence
    ↓
T046–T052  US4 — Delete + Duplicate (depends on checkbox from T046 and grid from US1)
    ↓
T053–T062  Polish (mostly parallel)
```

### Parallel opportunities within phases

- T001, T002 (UI foundation) — different files, no dependency
- T007, T008, T009, T013 (BE entities) — different files, no dependency
- T019, T020 (BE repositories) — different files, no dependency
- T028 validators and T029 Save handler — different methods, can be split between developers
- T046 checkbox and T049 Duplicate — independent additions to the same component
- T050, T051 (BE delete repo + service) — can be stubbed in parallel
- T053–T056, T058–T059, T061–T062 (all Polish tasks) — all independent

---

## Separate Prompts

---

### PROMPT — Angular 20 UI Tasks (paste into Claude Code or Cursor)

```
You are implementing the Angular 20 frontend Fund Scoping feature for the nasc-ui project.
Working directory: nasc-ui/ (the Angular project root containing package.json + angular.json).
Spec:  .specify/workflows/speckit/spec.md
Plan:  .specify/workflows/speckit/plan.md
Tasks: .specify/workflows/speckit/tasks.md

HARD CONSTRAINTS — read before writing a single line:
  1. Do NOT install any new npm packages. Use only what is in package.json already.
  2. Do NOT create AddFundComponent or a /scoping/fund/add route.
  3. Do NOT use Syncfusion, EJ2 Grid, GridModule, ToolbarService, or any @syncfusion/* import.
  4. Do NOT create DeleteFundModalComponent. Delete is immediate (no confirmation modal).
  5. All fund CRUD lives inside FundScopingGridComponent using Angular FormArray + Bootstrap table.
  6. Reuse existing components:
       src/app/shared/components/multi-select-dropdown/  (for Type of Investment, Broker/Custodians)
       src/app/shared/components/datepicker-wrapper/     (for all three date columns)
  7. standalone: false for every new component.
  8. takeUntilDestroyed(this.destroyRef) for every subscription.
  9. EnvService.apiURL as base for all HTTP calls.
  10. Bootstrap 5 classes only; no additional CSS frameworks.

Complete tasks in order; run `npm run build` at each phase checkpoint before continuing.

─────────────────────────────
PHASE 1 — Foundation
─────────────────────────────
T001: Create src/app/features/fund/fund-state/fund.model.ts
      Interfaces: Fund, FundRow, FundSaveRequest, FundResponse,
                  DeleteFundsResponse, LookupItem, FundLookups, FundState

T002: Create src/app/shared/services/fund/fund.service.ts
      9 methods (getFunds, addFund, updateFund, deleteFunds + 5 lookup getters)
      All use HttpClient + EnvService.apiURL

T003: Create fund NgRx files in src/app/features/fund/fund-state/:
      fund.actions.ts, fund.reducer.ts, fund.effects.ts, fund.selectors.ts
      (FundState includes: funds[], loading, saving, error, newlyAddedFundIds[], lookups)

T004: Register fundReducer in src/app/store/reducers/index.ts
      Register FundEffects via provideEffects in app.config.ts

T005: Create src/app/features/fund/fund.module.ts
      Imports: CommonModule, ReactiveFormsModule, FormsModule, SharedModule
      Declares: FundScopingPageComponent, FundScopingGridComponent

T006: Import FundModule in ScopingModule (no new route)

CHECKPOINT 1: npm run build passes.

─────────────────────────────
PHASE 2 — Fund Scoping Grid Shell (US1)
─────────────────────────────
T015: Add "Fund Scoping" tab to ScopingComponent
      (activeTab union: 'add' | 'details' | 'fund'; add tab button + tab-pane)

T016: Create FundScopingPageComponent
      Dispatches loadFunds + loadLookups on ngOnInit (engagementId from NgRx store)
      Renders <app-fund-scoping-grid> and disabled toolbar placeholders

T017: Create FundScopingGridComponent
      - FormArray of FormGroups (built in ngOnChanges on funds @Input)
      - Bootstrap <table class="table table-bordered"> with 11 columns per spec
      - editingCell, newRowIndices, selectedSet state
      - isEditing(i, field) and isNewRow(i) helpers
      - *ngIf cell toggle: edit control vs display template per column
      - Loading spinner, empty-state row, error banner

T018: Wire loadFundsEffect + loadLookupsEffect in fund.effects.ts

CHECKPOINT 2: /scoping → Fund Scoping tab → grid renders (empty or populated).

─────────────────────────────
PHASE 3 — Add Fund + Save (US2)
─────────────────────────────
T025: FundScopingGridComponent.buildRowGroup(fund?: Fund): FormGroup
      (all controls with validators from T028)

T026: FundScopingGridComponent.addRow(values?: Partial<Fund>)
      (prepend FormGroup to fundArray; add to newRowIndices; all cells immediately editable)

T027: Toolbar "Add Fund" button in FundScopingPageComponent → calls addRow()
      Disabled when rowCount >= 15; show "X / 15 funds" label

T028: Create src/app/features/fund/fund-state/fund.validators.ts
      containsLetterValidator, uniqueFundNameValidator, minArrayLengthValidator,
      maxDateTodayValidator, afterBeginDateValidator, auditSignOffDateValidator

T029: Toolbar "Save" button → onSave():
      markAllAsTouched → if invalid show error banner
      For each new row: dispatch addFund → on success update FormGroup with fundId
      Dispatch setNewlyAddedFundIds; dispatch clearNewlyAddedFundIds on next user action

T030: Field-level error display: red outline + tooltip per validation error type

T031: "Back" button: if fundArray.dirty → Bootstrap modal (native JS API) → Yes/No

CHECKPOINT 3: Add Fund → blank row → fill fields → Save → green row + success banner.

─────────────────────────────
PHASE 4 — Inline Edit (US3)
─────────────────────────────
T036: Add editingCell + prevCellValue state; isEditing/isNewRow helpers

T037: (dblclick) handler sets editingCell for non-new, non-locked cells

T038: Cell template *ngIf="isEditing(i,'field') || isNewRow(i); else displayTpl"
      Edit controls per column (text/select/multi-select/datepicker per spec column table)

T039: (blur)/(keydown.enter) handler for existing rows:
      Validate → if valid and changed → dispatch updateFund → clear editingCell
      (keydown.escape) → restore prevCellValue → clear editingCell

T040: Wire updateFundEffect → FundService.updateFund() → success/error banner

T041: Status locking in ngOnChanges: disable locked FormControls for post-Data-Import funds

CHECKPOINT 4: Double-click existing cell → edit → Enter → success banner.

─────────────────────────────
PHASE 5 — Delete + Duplicate (US4)
─────────────────────────────
T046: Checkbox column: <input type="checkbox"> per row; selectedSet tracking; emit selectedIds

T047: "Delete Fund" button → immediate dispatch deleteFunds → remove FormGroups on success
      Info banner for skipped (non-deletable) funds

T048: Wire deleteFundsEffect → FundService.deleteFunds() → success/failure

T049: "Duplicate Fund" button (enabled for exactly 1 selection, rowCount < 15)
      → call addRow(selectedRow.getRawValue()) → prepend editable pre-filled row

CHECKPOINT 5: Select fund → Delete → removed instantly.
              Select fund → Duplicate → pre-filled editable row at top.

─────────────────────────────
PHASE 6 — Polish
─────────────────────────────
T053: Row count label "X / 15 funds" in toolbar
T054: Enter = confirm edit; Escape = cancel edit (restore prevCellValue)
T055: clearNewlyAddedFundIds on toolbar clicks, tab change, navigation
T056: ARIA labels on checkbox column and table
T057: npm run lint (fix all); npm run build --configuration=production (must pass)
```

---

### PROMPT — .NET Core Backend Tasks (paste into Claude Code or Cursor on backend repo)

```
You are implementing the .NET Core backend for the Fund Scoping feature of the NASC application.
Spec:  .specify/workflows/speckit/spec.md
Plan:  .specify/workflows/speckit/plan.md
Tasks: .specify/workflows/speckit/tasks.md

Complete tasks in order. Run `dotnet build` after each checkpoint.

─────────────────────────────
PHASE 1 — Entities & Migration
─────────────────────────────
T007: Create Domain/Entities/Fund.cs (all fields from spec Key Entities)
T008: Create TypeOfFund.cs, TypeOfInvestment.cs, FundAdministrator.cs,
       BrokerCustodian.cs, ReportingCurrency.cs
T009: Create join tables: FundInvestmentType.cs, FundBrokerCustodian.cs
T010: Register all entities in existing DbContext with relationships + indexes
       (Index on Fund.EngagementId; Unique on Fund(EngagementId, FundName))
T011: dotnet ef migrations add AddFundTables && dotnet ef database update
T012: Seed all 5 control tables with values from spec Key Entities
T013: Create IFundRepository.cs and ILookupRepository.cs
T014: Create Application/DTOs/: FundDto, CreateFundDto, UpdateFundDto, DeleteFundsDto,
       FundResponseDto, LookupItemDto, DeleteFundsResponseDto

CHECKPOINT 1: dotnet ef database update succeeds; seed rows present.

─────────────────────────────
PHASE 2 — Repositories, Service & Lookup Endpoints (US1)
─────────────────────────────
T019: FundRepository.cs — GetByEngagementAsync with .Include() + .Select() projection
T020: LookupRepository.cs — reads all 5 control tables → List<LookupItemDto>
T021: Register both repos in DI
T022: FundService.GetFundsByEngagementAsync
T023: GET api/Fund?engagementId in FundController [Authorize]
T024: All GET api/lookup/* in LookupController [Authorize]

CHECKPOINT 2: GET /api/Fund?engagementId=1 returns []; all lookups return seed data.

─────────────────────────────
PHASE 3 — Add Fund (US2)
─────────────────────────────
T032: CreateFundValidator — all rules (required fields, name 3-200 + ≥1 letter,
       duplicate check, date ordering, materiality ≤ 10,000,000,000)
T033: FundRepository.AddAsync + ExistsByNameAsync(engagementId, name, excludeId?)
T034: FundService.AddFundAsync (validate → duplicate check → persist → return FundResponseDto)
T035: POST api/Fund → 201 / 400 (field errors) / 409 (duplicate name)

CHECKPOINT 3: POST valid → 201; duplicate name → 409; blank field → 400 with field array.

─────────────────────────────
PHASE 4 — Edit Fund (US3)
─────────────────────────────
T042: UpdateFundValidator (same as Create, duplicate check excludes self)
T043: FundRepository.UpdateAsync(fundId, dto)
T044: FundService.UpdateFundAsync (validate → field-lock check → persist → return dto)
T045: PUT api/Fund/{fundId} → 200 / 400 / 404

CHECKPOINT 4: PUT valid → 200; locked field edit → 400; unknown id → 404.

─────────────────────────────
PHASE 5 — Delete Fund (US4)
─────────────────────────────
T050: FundRepository.DeleteManyAsync — deletability check per row; return DeleteFundsResponseDto
T051: FundService.DeleteFundsAsync(dto) delegating to repo
T052: DELETE api/Fund (body: { fundIds }) → 204 + DeleteFundsResponseDto; 400 if ids empty

CHECKPOINT 5: DELETE with mixed ids → skipped list returned; only deletable funds removed.

─────────────────────────────
PHASE 6 — Polish
─────────────────────────────
T058: Review EF queries — use .Select() projection throughout; no N+1
T059: [ResponseCache] or memory cache on all LookupController GET endpoints (5 min TTL)
T060: Performance test: 200 seeded funds → GET /api/Fund?engagementId=1 < 500ms
T061: Add [ProducesResponseType] Swagger annotations to FundController + LookupController
T062: Update START_DEV_SERVER.md with Fund Scoping tab and API endpoint summary

Coding rules:
  - Use existing DbContext — do not create a new one
  - Apply [Authorize] matching existing controllers
  - async/await throughout; no synchronous DB calls
  - Return existing ApiResponse wrapper if present in the project
  - PascalCase naming throughout
```
