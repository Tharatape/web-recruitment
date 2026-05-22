# Recruitment Analytics Dashboard

A modern web application for recruitment analytics and candidate management, built with Next.js. This dashboard provides comprehensive insights into the hiring pipeline, candidate matching, and job description management.

## Features

- **Dashboard**: Visual analytics with charts and metrics for application tracking
- **Applications**: Candidate listing with advanced filtering and pagination
- **Matching**: AI-powered candidate-job matching with scoring algorithms
- **JD Library**: Job description repository with criteria management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Frontend**: React 19, Tailwind CSS
- **Charts**: Recharts
- **Linting**: ESLint

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

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot reloading |
| `npm run build` | Creates an optimized production build |
| `npm start` | Starts the production server |
| `npm run lint` | Runs ESLint to check code quality |

## Dependencies

### Production Dependencies

- `next` - React framework for server-side rendering and static site generation
- `react` & `react-dom` - Core React library
- `recharts` - Charting library for data visualization

### Development Dependencies

- `typescript` - TypeScript compiler
- `@types/react`, `@types/node`, `@types/react-dom` - Type definitions
- `tailwindcss` - Utility-first CSS framework
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind
- `eslint` & `eslint-config-next` - Code linting

## Project Structure

```
├── app/
│   ├── dashboard/page.tsx      - Main dashboard with analytics
│   ├── applications/page.tsx   - Candidate application list
│   ├── matching/page.tsx       - Candidate-job matching interface
│   ├── jd-library/page.tsx     - Job description management
│   ├── layout.tsx              - Root layout component
│   └── page.tsx                - Landing page (redirects to dashboard)
├── components/
│   ├── ui/                     - Reusable UI components
│   └── charts/                 - Chart components
├── data/                       - Mock data and types
└── public/                     - Static assets
```

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
- Search candidates by name, phone, NID, or email
- Filter by position, experience range, date applied, status, and recruiter
- View detailed candidate profiles in expandable rows
- Paginate through results (25, 50, or 100 per page)

### Running Candidate Matching

Navigate to `/matching` to:
- Filter and select candidates for matching
- Configure job description requirements
- Run matching algorithm against selected candidates
- View matching scores and breakdown criteria

### Managing Job Descriptions

Navigate to `/jd-library` to:
- Upload new job descriptions
- View and search existing JDs
- Edit matching criteria (experience, education, language, technical)
- Enable/disable JDs for matching

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

## License

This project is private and proprietary.