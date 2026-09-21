# Project Structure & Codebase Map

UTD Trends is organized around modular domain boundaries separating UI presentation, client-side graph search, and upstream API interactions.

---

## Architecture at a Glance

| Layer                         | Primary Directories            | Purpose & Responsibilities                                                           |
| :---------------------------- | :----------------------------- | :----------------------------------------------------------------------------------- |
| **Presentation (App Router)** | `src/app/`                     | Next.js 16 App Router pages, global layouts, and proxy API handlers (`/api/*`).      |
| **UI Components**             | `src/components/`              | Domain-driven UI modules (search, graphs, dashboard panels, planner).                |
| **Data & Fetching**           | `src/modules/`<br/>`src/data/` | Upstream Nebula API client methods, query fetchers, and pre-indexed static datasets. |
| **Pre-computation Pipeline**  | `src/scripts/`                 | Offline data aggregation and Graphology search graph generation scripts.             |
| **Styling & Design System**   | `src/styles/`                  | Tailwind CSS v4, global CSS custom properties, and MUI theming tokens.               |
| **Type Definitions**          | `src/types/`                   | TypeScript interfaces for grade distributions, course schemas, and API responses.    |
| **CI/CD & Documentation**     | `.github/`<br/>`docs/`         | GitHub Actions automation workflows, PR templates, and developer wiki guides.        |

---

## UI Components (`src/components/`)

All interface elements are grouped by feature domain:

| Directory     | Domain Responsibility                                                 | Key Technologies                  |
| :------------ | :-------------------------------------------------------------------- | :-------------------------------- |
| `search/`     | Search bar, fuzzy autocomplete dropdowns, and search filter controls. | Graphology, Autosuggest-Highlight |
| `graph/`      | Grade distribution bar charts, GPA trend lines, and section overlays. | ApexCharts, React-ApexCharts      |
| `dashboard/`  | Split resizable layout managing search LHS and data analytics RHS.    | React Resizable Panels            |
| `compare/`    | Side-by-side course, professor, and semester comparison modals.       | MUI Dialogs, Framer Motion        |
| `planner/`    | Schedule planning views, section times, and room allocation grids.    | TanStack Query, MUI Grid          |
| `overview/`   | Summary metric cards, average GPA badges, and section counts.         | MUI Cards, Emotion                |
| `navigation/` | Top app bar, navigation drawer, theme switchers, and external links.  | Next.js Link, MUI AppBar          |
| `common/`     | Shared atomic primitives (custom buttons, badges, loaders, tooltips). | MUI v9 Primitives                 |
| `icons/`      | Custom SVG icon components and brand logos.                           | React SVG Primitives              |

---

## Where to Make Changes

Use this quick reference to find the right directory for common development tasks:

| Development Task                                           | Target Location                                           |
| :--------------------------------------------------------- | :-------------------------------------------------------- |
| **Add or update a UI feature or visual component**         | `src/components/<feature>/`                               |
| **Modify a page route or internal `/api/*` proxy handler** | `src/app/` or `src/app/api/<route>/`                      |
| **Update Nebula API queries or network fetchers**          | `src/modules/`                                            |
| **Change pre-computed search graph indexing**              | `src/scripts/generateAutocompleteGraph.ts`                |
| **Adjust global styles, spacing, or color palettes**       | `src/styles/` or MUI theme config in `src/app/layout.tsx` |
| **Add TypeScript interfaces for new API responses**        | `src/types/`                                              |
| **Update developer documentation or Wiki pages**           | `docs/`                                                   |

---

<details>
<summary><b>Click to expand full repository file tree</b></summary>

```text
utd-trends/
├── .github/                     # GitHub Actions workflows & PR templates
│   ├── ISSUE_TEMPLATE/          # Issue templates (bug, feature, chore)
│   └── workflows/               # CI pipelines (linting, wiki sync)
├── docs/                        # Source markdown for GitHub Developer Wiki
├── public/                      # Static assets, favicons, illustrations
├── src/
│   ├── app/                     # Next.js App Router (pages & /api handlers)
│   ├── components/              # Modular UI components
│   ├── data/                    # Serialized graph and combo datasets
│   ├── modules/                 # Nebula API data fetchers & clients
│   ├── scripts/                 # Offline build-time data scripts
│   ├── styles/                  # Tailwind CSS & global stylesheets
│   └── types/                   # Shared TypeScript interfaces
├── .env.example                 # Template for required environment variables
├── eslint.config.mjs            # ESLint rules and plugin configurations
├── next.config.ts               # Next.js bundler and compiler settings
├── package.json                 # Project dependencies and script definitions
└── tsconfig.json                # TypeScript compiler configuration
```

</details>

---

## Next Steps

Review [How to Contribute](How-to-Contribute.md) for branch naming conventions, PR workflow, and commit standards.
