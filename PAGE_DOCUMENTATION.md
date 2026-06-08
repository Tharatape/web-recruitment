# RecruitAI — Page & Component Documentation

## Table of Contents
1. [Layout & Global Structure](#1-layout--global-structure)
2. [Sidebar Navigation](#2-sidebar-navigation)
3. [Dashboard Page](#3-dashboard-page)
4. [Applications Page](#4-applications-page)
5. [Matching Page](#5-matching-page)
6. [JD Library Page](#6-jd-library-page)
7. [KPI Data Page](#7-kpi-data-page)
8. [Admin Activity Page](#8-admin-activity-page)
9. [Settings Page](#9-settings-page)
10. [Shared UI Components](#10-shared-ui-components)
11. [Data Layer](#11-data-layer)
12. [API Routes](#12-api-routes)

---

## 1. Layout & Global Structure

### `app/layout.tsx` — Root Layout
The wrapper around every page. Handles:
- **Fonts**: Loads Geist Sans and Geist_Mono from Google Fonts, exposed as CSS variables
- **Database seeding**: On server startup, checks if the SQLite database is empty and auto-seeds with mock candidates, JDs, and reference data (uses a file-based lock to prevent race conditions during concurrent builds)
- **Sidebar**: Renders the `<Sidebar />` component on every page
- **Structure**: `<html>` → `<body>` → `<Sidebar />` → `{children}` (page content)

### `app/globals.css` — Global Styles
- **CSS Variables**: Defines all theme colors (`--background`, `--primary`, `--border`, etc.) in `:root`
- **Tailwind Theme**: Maps CSS variables to Tailwind color tokens via `@theme inline`
- **Base styles**: `box-sizing: border-box`, full-height `html/body`, body background/font
- **Status badges**: 11 colored badge classes (`.status-applied`, `.status-hired`, etc.) for candidate status pills
- **Recharts overrides**: Forces white background on chart tooltips, ensures SVG overflow is visible
- **Responsive**: Custom `xs` breakpoint at 480px with `.xs-grid-cols-2` utility

### `app/page.tsx` — Landing Page
Simply redirects to `/dashboard` using Next.js `redirect()`.

---

## 2. Sidebar Navigation

### `components/Sidebar.tsx`
A fixed left sidebar (240px wide) with:

**Navigation Links** (7 items):
| Label | Route |
|-------|-------|
| Dashboard | `/dashboard` |
| KPI Data | `/kpi-data` |
| Applications | `/applications` |
| Matching | `/matching` |
| JD Library | `/jd-library` |
| Admin Activity | `/admin-activity` |
| Settings | `/settings` |

**Behavior**:
- **Desktop (lg+)**: Always visible, fixed position
- **Mobile**: Hidden by default, toggled via hamburger button (top-left corner)
- **Active state**: Blue background highlight on the current page's link (uses `usePathname()`)
- **Logo**: "RecruitAI" with blue "AI" accent at the top
- **Version**: "v1.0" at the bottom

---

## 3. Dashboard Page

### `app/dashboard/page.tsx`
The main analytics overview. Fetches data from `/api/dashboard/stats`.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `startDate` / `endDate` | string | Date range filter |
| `owner` | string | Recruiter filter |
| `stats` | `DashboardStats \| null` | All dashboard data from API |
| `recruiters` | `string[]` | List of recruiter names for dropdown |
| `loading` | boolean | Shows skeleton while fetching |

**Data Fetching** (`useEffect`):
- Fetches stats and recruiters in parallel via `Promise.all`
- Re-fetches when `startDate`, `endDate`, or `owner` changes
- API: `GET /api/dashboard/stats?startDate=&endDate=&owner=`

**Sections** (rendered top to bottom):

1. **Header**: Page title "Dashboard" + user profile badge ("SM" for Sarah Mitchell)

2. **Filters Row**: Three filter inputs — Start Date, End Date, Recruiter dropdown

3. **Stats Cards** (4 cards in a responsive grid):
   - Total Applications
   - Today Applied
   - Last Week Applied
   - Last Month Applied

4. **Charts Row** (2-column grid):
   - **Position Distribution**: Donut chart (`PositionDistributionDonut`) showing application count per job position
   - **Status Overview**: Bar chart (`BarChart`) + a table showing count and percentage for each of the 11 statuses

5. **Stage Performance** (full-width card):
   - 4 stage columns: Application Stage, Interview Stage, Offer Stage, Hired Stage
   - Each has a `StageBar` chart (stacked horizontal bars) with segment breakdowns
   - Footer with definitions for each status term

6. **Average Duration Between Stages** (full-width card):
   - 4 hardcoded metrics: Applied→Interview (12.4d), Interview→Offer (8.2d), Offer→Hired (5.6d), Applied→Hired (26.2d)

**Loading State**: Skeleton placeholders for all sections (pulse animations)

---

## 4. Applications Page

### `app/applications/page.tsx`
Candidate listing with advanced filtering, pagination, and expandable row details.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `search` | string | Text search (name, phone, NID, email, unique ID) |
| `position` | `string[]` | Multi-select position filter |
| `expMin` / `expMax` | string | Experience range filter |
| `dateRange` | string | Predefined date ranges (7/14/30/90 days or all) |
| `status` | `string[]` | Multi-select status filter |
| `recruiter` | string | Single recruiter filter (includes "No Owner" option) |
| `pageSize` | number | Rows per page (25/50/100) |
| `page` | number | Current page number |
| `expandedId` | `string \| null` | Which row is expanded |
| `paginatedCandidates` | `DbCandidateEssential[]` | Current page of results |
| `fullCandidates` | `Map<string, DbCandidate>` | Cache of full candidate details |
| `allPositions` | `string[]` | Dynamic list from current results |
| `total` | number | Total matching candidates |
| `loadingExpanded` | boolean | Loading state for expanded row details |

**Data Fetching** (`useCallback`):
- Fetches paginated candidates + total count in parallel
- API: `GET /api/candidates?limit=&offset=&essential=true&search=&startDate=&position=&expMin=&expMax=&status=&owner=`
- Count API: same params with `countOnly=true`
- Resets to page 1 when any filter changes

**Table Columns**:
| Column | Width | Render |
|--------|-------|--------|
| ID | 80px | Monospace unique_id |
| Name | auto | Avatar circle (initials) + name |
| Position | auto | Plain text |
| Experience | auto | Human-readable label (e.g. "3-5 years") |
| Date Applied | auto | Plain text |
| Status | auto | Colored status badge |
| Recruiter | auto | Plain text |
| Expand | 120px | Chevron button (rotates when expanded) |

**Expanded Row** (`CandidateExpandedView`):
- Fetches full candidate details on expand: `GET /api/candidates?fullId=`
- Shows: photo, contact info, education, language, license, previous employment, AI summary, activity logs
- Auto-generates pros/cons based on experience, education, language, BMI

**Pagination**: Previous/Next buttons + "Page X of Y" display + per-page selector (25/50/100)

**Clear Filters**: Red "Clear All Filters" button appears when any filter is active

---

## 5. Matching Page

### `app/matching/page.tsx`
AI-powered candidate-job matching interface. The most complex page.

**State Variables** (extends Applications page state):
| Variable | Type | Purpose |
|----------|------|---------|
| `selectedIds` | `Set<string>` | Candidates selected via checkboxes |
| `scoredIds` | `Set<string>` | Candidates that have been scored |
| `selectedJdId` | string | Selected Job Description for matching |
| `selectedAiJdId` | string | Selected JD for AI Opinion feature |
| `aiOpinionCount` | number | How many top candidates to pick (2-10) |
| `jds` | `DbJD[]` | List of all JDs from API |
| `aiOpinionResults` | `Array<{name, score, reasoning}> \| null` | AI Opinion results |
| `sortKey` / `sortDir` | string / asc-desc | Column sorting state |

**Additional Features Beyond Applications**:

1. **Checkbox Selection**: Each row has a checkbox; header has "select all" with indeterminate state

2. **JD Selector** (`ComboBox`): Dropdown to pick a Job Description for matching. Disables when no JD selected.

3. **Run Matching Button**: Scores all selected candidates against the selected JD using `getMatchingScoreForRow()` from `@/data/scoring`. Disables if no JD or no candidates selected.

4. **Matching Score Column**: Shows a `ScoringBadge` (color-coded: green ≥80%, amber ≥50%, red <50%) for scored candidates

5. **Sortable Columns**: ID, Name, and Matching Score columns are sortable (click header to toggle asc/desc)

6. **AI Opinion Section**:
   - Separate JD selector
   - Number input for how many candidates to select (2-10)
   - "AI Opinion" button fetches top N candidates using `getTopCandidates()`
   - Displays results with name, match score, and auto-generated reasoning text

7. **Data Fetching**: Also fetches JD list from `GET /api/jds` in parallel with candidates

---

## 6. JD Library Page

### `app/jd-library/page.tsx`
Job Description repository with upload, search, and criteria management.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `files` | `File[]` | Selected files for upload |
| `jdList` | `JD[]` | All JDs from API |
| `search` | string | Search filter for JD names |
| `expandedId` | `string \| null` | Which JD is expanded for detail view |
| `criteria` | `Record<string, string>` | Editable criterion values |
| `counts` | `CriterionCounts` | Number of criteria per category per JD |
| `activeMenuId` | `string \| null` | Which JD's action menu is open |
| `loading` | boolean | Loading state |

**Layout**: Two-column grid (responsive)

**Left Column — JD Repository**:
- Search input
- Table of JDs with: name, position tag, disabled badge
- Action menu (⋮ button) per JD with options:
  - **View JD** — expands detail view
  - **Enable/Disable JD** — toggles disabled state
  - **Delete JD** — removes JD from list

**Right Column — JD Detail**:
- Shows placeholder when no JD selected
- When expanded, shows:
  - 3 info cards: Last Update, Last Editor, Version
  - 4 criteria sections (max 5 each):
    - Experience
    - Education
    - Language
    - Skill (technical)
  - Each section has: label, "+ Add" button (disabled at 5), input fields with remove (×) buttons
  - **Save** button (logs to console — not yet connected to API)

**Upload Section** (above the grid):
- Drag-and-drop area with cloud icon
- File input for `.pdf`, `.doc`, `.docx`
- Shows selected file names
- **Upload** button (logs to console — not yet connected to API)

**API**: `GET /api/jds` to fetch, `POST /api/jds` with `action=deleteJD` or `action=toggleDisabled`

---

## 7. KPI Data Page

### `app/kpi-data/page.tsx`
Key Performance Indicator data with charts, table, and Excel export.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `tableSearch` | string | Search by position or unique ID |
| `dateFrom` / `dateTo` | string | Date range filter |
| `owner` | string | Recruiter filter |

**Sections**:

1. **Filters Card**: Search input, From/To date pickers, Recruiter dropdown, "Export to Excel" button

2. **Charts** (`LazyKpiCharts`): Lazy-loaded chart components, receives date/owner filters as props

3. **Data Table** (`LazyTable`): Lazy-loaded table, receives all filters as props

**Export Function** (`handleExport`):
- Builds query params from active filters
- Fetches `GET /api/kpi/export?dateFrom=&dateTo=&owner=`
- Downloads response as `kpi-data.xlsx` blob

**Clear Filters**: Red button appears when any filter is active

---

## 8. Admin Activity Page

### `app/admin-activity/page.tsx`
Audit log of all recruiter actions in the system.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `search` | string | Free-text search |
| `datePeriod` | string | Days filter (7/14/30/60/90) |
| `status` | string | Status filter |
| `action` | string | Action type filter |
| `recruiter` | string | Recruiter filter |
| `activities` | `Activity[]` | Fetched activity log entries |
| `loading` | boolean | Loading state |

**Filters** (5-field grid):
- Advance Search (text input)
- Date Period (dropdown: 7/14/30/60/90 days)
- Status (dropdown: all 11 statuses)
- Action (dropdown: Change Status, Matching, Create/Edit JD, AI Opinion)
- Recruiter (dropdown: all owners)

**Table Columns**:
| Column | Render |
|--------|--------|
| Time Stamp | `date + time` |
| Action | action_type |
| Recruiter | recruiter name |
| Candidate & ID | `name (unique_id)` |
| Status | status text |
| Action Detail | note text |

**Data Fetching**: `GET /api/activity?days=&status=&action_type=&recruiter=&search=`
- Maps API response fields to display format
- Shows `TableSkeleton` while loading

---

## 9. Settings Page

### `app/settings/page.tsx`
User profile and security settings.

**State Variables**:
| Variable | Type | Purpose |
|----------|------|---------|
| `profilePhoto` | `string \| null` | Base64 data URL of uploaded photo |
| `fileInputRef` | `RefObject` | Reference to hidden file input |

**Sections**:

1. **Profile Photo**:
   - Large circle (96px) showing photo or "SM" initials
   - "Upload Photo" button triggers hidden file input
   - Accepts JPG, PNG, GIF (max 5MB noted)
   - Uses `FileReader.readAsDataURL()` to preview

2. **Change Password**:
   - Three inputs: Current Password, New Password, Confirm New Password
   - "Update Password" button (no backend connection yet)

3. **Two-Factor Authentication**:
   - Shows "2FA is disabled" status
   - Description text about security
   - "Enable 2FA" button (no backend connection yet)

**Header**: Clickable profile avatar (same upload functionality)

---

## 10. Shared UI Components

### `components/ui/Card.tsx`
Reusable card container with `Card`, `CardHeader`, `CardTitle`, `CardContent` sub-components. White background with border and rounded corners.

### `components/ui/Input.tsx`
Text input with label. Supports `type="text"`, `type="date"`, `type="number"`, `type="password"`, `type="file"`. Props: `label`, `placeholder`, `value`, `onChange`, `min`, `max`, `accept`, `className`.

### `components/ui/Dropdown.tsx`
Single-select dropdown. Props: `label`, `placeholder`, `options` (label+value pairs), `value`, `onChange`, `className`.

### `components/ui/MultiSelect.tsx`
Multi-select dropdown with checkboxes. Props: `label`, `placeholder`, `options`, `value` (string[]), `onChange`.

### `components/ui/ComboBox.tsx`
Searchable combo dropdown (used for JD selection). Props: `label`, `placeholder`, `options`, `value`, `onChange`.

### `components/ui/Table.tsx`
Generic data table. Props: `columns` (array of column defs with `key`, `header`, `render`, `className`), `data`, `keyExtractor`, `expandedId`, `renderExpanded`, `onRowClick`.

### `components/ui/Button.tsx`
Button with variants (`default`, `success`) and sizes (`sm`, `default`).

### `components/ui/Skeleton.tsx`
Loading placeholder components: `StatsCardSkeleton`, `ChartSkeleton`, `TableSkeleton`. Uses `animate-pulse` CSS animation.

### `components/CandidateExpandedView.tsx`
Full candidate detail view shown in expanded table rows. Shows: photo, contact info, education, language, license, previous employment, AI summary, activity logs, auto-generated pros/cons.

### `components/LazyLoadWrapper.tsx`
Wrapper for lazy-loading child components (code-splitting).

### `components/LazyKpiCharts.tsx`
Lazy-loaded KPI chart components for the KPI Data page.

### `components/LazyTable.tsx`
Lazy-loaded data table for the KPI Data page.

### `components/charts/BarChart.tsx`
Recharts bar chart. Props: `data` (name/value/color/percentage), `height`.

### `components/charts/KpiCharts.tsx`
Contains `PositionDistributionDonut` — a donut/pie chart for position distribution with center label showing total.

### `components/charts/StageBar.tsx`
Stacked horizontal bar chart for stage performance visualization. Props: `name`, `segments`, `height`, `yAxisMax`.

---

## 11. Data Layer

### `data/db.ts`
SQLite database initialization using `better-sqlite3`. Exports `initializeDatabase()` and `db` instance.

### `data/db/seed.ts`
Seed functions: `seedReferenceData()`, `seedCandidates()`, `seedJDs()`, `generateCandidates()`. Creates 4000 mock candidates with realistic Thai names, positions, statuses, and activity logs.

### `data/db/stats.ts`
Dashboard statistics queries. Exports `DashboardStats` type with: `total`, `today`, `lastWeek`, `lastMonth`, `statusCounts`, `stageTotals`, `stageData`, `positionDistribution`.

### `data/repositories/candidateRepository.ts`
Candidate CRUD operations. Exports types: `DbCandidate` (full), `DbCandidateEssential` (paginated list view). Functions: `getCandidateCount()`.

### `data/repositories/jdRepository.ts`
JD CRUD operations. Exports `DbJD` type.

### `data/types.ts`
Shared types and constants:
- `STATUSES`: Array of 11 candidate statuses
- `OWNERS`: Array of recruiter names
- `getExperienceLabel()`: Converts experience years to human-readable labels

### `data/colors.ts`
`STATUS_CLASS_MAP`: Maps each status to its CSS badge class name.

### `data/scoring.ts`
Matching score algorithm:
- `getMatchingScoreForRow()`: Calculates match score for a candidate against a JD
- `buildBarScores()`: Builds score breakdown for visualization
- `clearScoreCache()`: Clears the scoring cache
- `getTopCandidates()`: Returns top N candidates by score

---

## 12. API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/stats` | GET | Dashboard statistics (filtered by date/owner) |
| `/api/dashboard/stats` | POST | `action: getRecruiters` — returns recruiter list |
| `/api/candidates` | GET | Paginated candidate list with filters |
| `/api/candidates?fullId=` | GET | Full single candidate details |
| `/api/candidates?countOnly=true` | GET | Total count with current filters |
| `/api/jds` | GET | List all JDs |
| `/api/jds` | POST | `action: deleteJD` or `action: toggleDisabled` |
| `/api/activity` | GET | Activity log with filters |
| `/api/kpi/data` | GET | KPI data |
| `/api/kpi/export` | GET | Excel export (returns .xlsx blob) |
| `/api/init` | — | Database initialization |
