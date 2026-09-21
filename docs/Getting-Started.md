# Getting Started with UTD Trends

This guide walks you through setting up your local development environment, configuring required environment variables, compiling local search graph datasets, and running the Next.js development server.

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: Version `22.x` or higher required.
  - Verify with `node -v`.
  - Install via [nodejs.org](https://nodejs.org/) or via a version manager like `nvm`:
    ```bash
    nvm install 22
    nvm use 22
    ```
- **npm**: Bundled with Node.js.
- **Git**: For version control. If you need a refresher on git, check out [Nebula's Git Workshop](https://github.com/UTDNebula/git-workshop).

---

## Local Setup

### 1. Clone the Repository

Clone the repository and enter the project directory:

```bash
git clone https://github.com/UTDNebula/utd-trends.git
cd utd-trends
```

### 2. Install Dependencies

Install all dependencies via npm:

```bash
npm install
```

---

## Environment Variables

Create a file named `.env` in the root of the repository:

```env
REACT_APP_NEBULA_API_KEY="your_api_key_here"
NEXT_PUBLIC_SENTRY_DSN=""
```

### Key Descriptions

| Variable                   | Required | Description                                                                                                                                                                                                                  |
| :------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_NEBULA_API_KEY` | **Yes**  | Authenticates requests against the [Nebula API](https://api.utdnebula.com/). Contact the Trends Project Lead or ask in `#portfolio-engineering` on the [Nebula Labs Discord](https://discord.utdnebula.com) to obtain a key. |
| `NEXT_PUBLIC_SENTRY_DSN`   | Optional | Data Source Name for Sentry client-side error reporting. Can be left empty for local development.                                                                                                                            |

---

## Running the Application

### 1. Start the Development Server

Launch the Next.js development server (Turbopack enabled by default in Next.js 16):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. The page hot-reloads automatically as you edit source files.

### 2. Code Verification & Formatting

Always run formatting and lint checks before committing code:

```bash
# Check code formatting with Prettier
npm run format:check

# Auto-format all code with Prettier
npm run format

# Run ESLint validation
npm run lint:check

# Auto-fix ESLint issues
npm run lint
```

### 3. Production Build Verification

Verify that the application compiles cleanly for production:

```bash
npm run build
npm start
```

---

## Data Generation Scripts

Trends uses pre-indexed graphs and datasets to power instant search autocomplete, course mappings, and grade distribution aggregations. These scripts are run when updating local static caches:

| Script              | Command                     | Purpose                                                                |
| :------------------ | :-------------------------- | :--------------------------------------------------------------------- |
| `fetchdata`         | `npm run fetchdata`         | Fetches aggregated grade records directly from the Nebula API.         |
| `buildautocomplete` | `npm run buildautocomplete` | Builds the Graphology autocomplete graph used by the search interface. |
| `buildcoursenames`  | `npm run buildcoursenames`  | Generates course code to official title mapping tables.                |
| `buildcombos`       | `npm run buildcombos`       | Generates professor-course combination indexes.                        |

> [!NOTE]
> Running `fetchdata` requires a valid `REACT_APP_NEBULA_API_KEY` in your `.env` file.

---

## Next Steps

Explore the [Project Architecture](Project-Architecture.md) to understand how state, data fetching, and graph visualizations connect across the codebase.
