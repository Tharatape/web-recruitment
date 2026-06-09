# Recruitment Analytics Dashboard

> **⚠️ Mockup / Demo** — This is a demonstration mockup website. All data displayed is sample/mock data and does not represent real candidates or applications.

A modern web application for recruitment analytics and candidate management, built with Next.js. This dashboard provides comprehensive insights into the hiring pipeline, candidate matching, job description management, and KPI reporting.

## Features

- **Dashboard**: Visual analytics with charts and metrics for application tracking — totals, today/week/month counts, position distribution donut chart, status overview bar chart, stage performance funnel, and average duration between stages
- **Applications**: Candidate listing with advanced filtering (search, position, experience range, date range, status, recruiter), pagination (25/50/100 per page), and expandable row details with full profile, activity logs, and auto-generated pros/cons
- **Matching**: Candidate-job matching with scoring algorithm — select candidates, pick a JD, run matching to get color-coded scores (green ≥80%, amber ≥50%, red <50%), sortable columns, and AI Opinion feature that auto-picks top N candidates with reasoning
- **JD Library**: Job description repository with upload (PDF/DOC/DOCX), search, expandable detail view, editable criteria (experience, education, language, technical — max 5 per category), enable/disable toggle, and delete
- **KPI Data**: Key Performance Indicator analytics with position/education/experience/age/BMI/height distribution charts, filterable data table, and Excel export
- **Admin Activity**: Audit log of all recruiter actions with filters for date period, status, action type, recruiter, and free-text search
- **Settings**: User profile photo upload, change password form, and two-factor authentication toggle (UI only — no backend yet)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, React Server Components) |
| **Language** | TypeScript 5 |
| **Frontend** | React 19, Tailwind CSS 4 |
| **Charts** | Recharts 3 |
| **Database** | SQLite via better-sqlite3 |
| **Excel Export** | xlsx (SheetJS) |
| **Linting** | ESLint 9 |
| **Fonts** | Geist Sans, Geist_Mono (Google Fonts) |

## Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mockup

# Install dependencies
npm install
```

## Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/dashboard`.

On first load, the database is auto-seeded with **4,000 mock candidates** across 10 positions and 11 hiring statuses, plus sample job descriptions with matching criteria.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot reloading (Turbopack) |
| `npm run build` | Creates an optimized production build |
| `npm start` | Starts the production server |
| `npm run lint` | Runs ESLint to check code quality |

## Project Structure

```
├── app/
│   ├── layout.tsx              — Root layout (fonts, sidebar, auto-seed on startup)
│   ├── page.tsx                — Landing page (redirects to /dashboard)
│   ├── globals.css             — Global styles, CSS variables, status badge colors
│   ├── dashboard/page.tsx      — Main dashboard with analytics & charts
│   ├── applications/page.tsx   — Candidate list with filters, pagination, expandable rows
│   ├── matching/page.tsx       — Candidate-JD matching with scoring algorithm
│   ├── jd-library/page.tsx     — Job description management
│   ├── kpi-data/page.tsx       — KPI analytics with charts & Excel export
│   ├── admin-activity/page.tsx — Audit log of recruiter actions
│   ├── settings/page.tsx       — User profile & security settings
│   └── api/
│       ├── init/route.ts       — Database initialization & reset
│       ├── candidates/route.ts — Candidate CRUD (list, detail, logs, recruiters)
│       ├── dashboard/stats/route.ts — Dashboard statistics
│       ├── jds/route.ts        — JD CRUD (list, create, delete, toggle)
│       ├── matching/route.ts   — (reserved)
│       ├── activity/route.ts   — Activity log with filters
│       ├── kpi/data/route.ts   — KPI data & aggregations
│       └── kpi/export/route.ts — Excel export endpoint
├── components/
│   ├── Sidebar.tsx             — Fixed sidebar navigation (7 pages, responsive)
│   ├── CandidateExpandedView.tsx — Full candidate detail in expanded row
│   ├── LazyLoadWrapper.tsx     — Lazy-loading wrapper for code-splitting
│   ├── LazyKpiCharts.tsx       — Lazy-loaded KPI charts
│   ├── LazyTable.tsx           — Lazy-loaded KPI data table
│   ├── ui/
│   │   ├── Button.tsx          — Button (variants: default, success; sizes: sm, default)
│   │   ├── Card.tsx            — Card container (Card, CardHeader, CardTitle, CardContent)
│   │   ├── ComboBox.tsx        — Searchable combo dropdown
│   │   ├── Dropdown.tsx        — Single-select dropdown
│   │   ├── Input.tsx           — Text/date/number/password/file input with label
│   │   ├── MultiSelect.tsx     — Multi-select dropdown with checkboxes
│   │   ├── Skeleton.tsx        — Loading placeholders (stats, charts, tables)
│   │   └── Table.tsx           — Generic data table with expanded row support
│   └── charts/
│       ├── BarChart.tsx        — Recharts bar chart for status overview
│       ├── DonutChart.tsx      — (available)
│       ├── KpiCharts.tsx       — Position distribution donut chart
│       └── StageBar.tsx        — Stacked horizontal bar for stage funnel
├── data/
│   ├── types.ts                — Shared types (Candidate, Status, Owner, LogEntry) & constants
│   ├── colors.ts               — Status-to-CSS-class mapping
│   ├── scoring.ts              — Matching score algorithm (weighted categories, JD profiles, caching)
│   ├── db/
│   │   ├── index.ts            — SQLite connection (better-sqlite3), singleton, build-time mock
│   │   ├── schema.sql          — Database schema (candidates, activity_logs, jds, jd_checklists, ref tables)
│   │   ├── seed.ts             — Deterministic mock data generator (4000 candidates, PRNG-seeded)
│   │   └── stats.ts            — Dashboard statistics queries
│   └── repositories/
│       ├── candidateRepository.ts — Candidate queries (filtered list, count, logs, full detail)
│       ├── jdRepository.ts     — JD queries (CRUD, checklist management)
│       └── kpiRepository.ts    — KPI queries (candidates, aggregations, Excel export)
└── public/                     — Static assets (SVGs)
```

## Database

The app uses **SQLite** (`better-sqlite3`) with the following tables:

| Table | Purpose |
|-------|---------|
| `candidates` | 4000 mock candidates with personal info, experience, education, status |
| `activity_logs` | Audit trail of status changes and actions per candidate |
| `jds` | Job descriptions with position and disabled flag |
| `jd_checklists` | Normalized JD criteria (experience, education, language, technical) |
| `statuses` | Reference: 11 hiring statuses |
| `owners` | Reference: 4 recruiters |
| `positions` | Reference: 10 job positions |

**Schema migration**: On startup, `initializeDatabase()` checks for missing columns and adds them via `ALTER TABLE`, so existing databases are upgraded automatically.

**Seeding**: If the database is empty, 4000 candidates are generated using a deterministic PRNG (sfc32, seed=42) for reproducible data. A file-based lock prevents race conditions during concurrent builds.

## Scoring Algorithm

The matching engine (`data/scoring.ts`) scores candidates against JDs using weighted categories:

| Category | Items | Max Points |
|----------|-------|-----------|
| Experience | 5 | 40 |
| Education | 3 | 20 |
| Language | 2 | 10 |
| Technical | 5 | 30 |

Each JD position type (sales, marketing, engineer, data, hr, financial, customer, project, business, operations) has a unique scoring profile with category-specific multipliers. Position alignment bonuses are added when the candidate's position matches the JD. Results are cached per candidate-JD pair.

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/init` | GET | Initialize DB (auto-seed if empty) |
| `/api/init` | POST | `action: reset` — wipe and reseed all data |
| `/api/candidates` | GET | Paginated candidate list with filters |
| `/api/candidates?uniqueId=` | GET | Single candidate by unique ID |
| `/api/candidates?fullId=` | GET | Full candidate detail with logs |
| `/api/candidates?countOnly=true` | GET | Total matching count |
| `/api/candidates` | POST | `action: getLogs` or `action: getRecruiters` |
| `/api/dashboard/stats` | GET | Dashboard statistics (date/owner filtered) |
| `/api/dashboard/stats` | POST | `action: getRecruiters` |
| `/api/jds` | GET | List all JDs (with checklists) |
| `/api/jds?id=` | GET | Single JD by ID |
| `/api/jds` | POST | `action: createJD`, `action: deleteJD`, `action: toggleDisabled` |
| `/api/activity` | GET | Activity log (filterable by days/status/action/recruiter/search) |
| `/api/activity` | POST | `action: getRecruiters` |
| `/api/kpi/data` | GET | KPI data (`type=candidates`, `type=aggregations`, or `type=all`) |
| `/api/kpi/data` | POST | `action: export` — returns Excel blob |
| `/api/kpi/export` | GET | Excel export (direct download) |

### Query Parameters (Candidates API)

| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Page size (default: all) |
| `offset` | number | Pagination offset |
| `search` | string | Search name, email, NID, unique ID |
| `startDate` / `endDate` | string | Date range filter (YYYY-MM-DD) |
| `position` | string[] | Multi-select position filter |
| `status` | string[] | Multi-select status filter |
| `expMin` / `expMax` | number | Experience range (years) |
| `owner` | string | Recruiter name (use `no-owner` for unassigned) |
| `essential` | boolean | Return lightweight column set for list views |
| `includeLogs` | boolean | Include activity logs in response |
| `countOnly` | boolean | Return only total count |

## Usage Examples

### Viewing Analytics

Navigate to `/dashboard` to view:
- Total applications with date filters
- Position distribution donut chart
- Status overview bar chart
- Stage performance funnel visualization
- Average duration between hiring stages

### Managing Applications

Navigate to `/applications` to:
- Search candidates by name, phone, NID, email, or unique ID
- Filter by position, experience range, date applied, status, and recruiter
- View detailed candidate profiles in expandable rows (auto-generated pros/cons)
- Paginate through results (25, 50, or 100 per page)

### Running Candidate Matching

Navigate to `/matching` to:
- Filter and select candidates via checkboxes
- Select a Job Description from the dropdown
- Run matching algorithm to score all selected candidates
- View color-coded scores and sort by match percentage
- Use AI Opinion to auto-pick top N candidates with reasoning

### Managing Job Descriptions

Navigate to `/jd-library` to:
- Upload new job descriptions (PDF, DOC, DOCX)
- View and search existing JDs
- Edit matching criteria (experience, education, language, technical)
- Enable/disable JDs for matching
- Delete JDs

### Exporting KPI Data

Navigate to `/kpi-data` to:
- View distribution charts (position, education, experience, age, BMI, height)
- Filter by date range, recruiter, and search term
- Export filtered data to Excel (.xlsx)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

### Code Standards

- Follow the existing code style and conventions
- Run `npm run lint` before submitting PRs
- Write meaningful commit messages
- Add TypeScript types for new code
- Use parameterized SQL queries (never string interpolation)

## License

This project is private and proprietary.
