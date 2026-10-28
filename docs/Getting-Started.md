# Getting Started with UTD Trends

This guide walks you through setting up your local development environment, configuring required environment variables, and running the Next.js development server.

---

## Prerequisites

Ensure you have the following installed on your machine:

- **[Git](https://git-scm.com/install)**: For version control.
  - If you've never used Git, need a refresher, or need help setting it up, check out [Nebula's Git Workshop](https://github.com/UTDNebula/git-workshop).
- **[Node.js](https://nodejs.org/en/download)**: Version `22.x` or higher required.
  - Verify with `node -v`.
  - If you're unsure what to do on the download page, scroll down and click the green button that says "Windows Installer (.msi)" or "macOS Installer (.pkg)", then open that file.
  - Or install via a version manager like `nvm`:
    ```bash
    nvm install 22
    nvm use 22
    ```

---

## Local Setup

### 1. Clone the Repository

Clone the repository and enter the project directory:

**HTTPS:**

```bash
git clone https://github.com/UTDNebula/utd-trends.git
cd utd-trends
```

**SSH:**

```bash
git clone git@github.com:UTDNebula/utd-trends.git
cd utd-trends
```

### 2. Install Dependencies

Install all dependencies via npm:

```bash
npm install
```

---

## Environment Variables

Copy the example environment configuration into `.env` at the root of the repository:

```bash
cp .env.example .env
```

Your `.env` file should configure the following variables:

```env
NEBULA_API_URL="https://api.utdnebula.com/"
NEBULA_API_KEY="your_api_key_here"

# Optional: Required only for RMP and syllabus AI summarization features
NEBULA_API_STORAGE_BUCKET=""
NEBULA_API_SYLLABUS_STORAGE_BUCKET=""
NEBULA_API_STORAGE_KEY=""
GEMINI_SERVICE_ACCOUNT=""

# Optional: Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=""
```

### Key Descriptions

| Variable                             | Required | Category   | Description                                                                                                                                                                                                              |
| :----------------------------------- | :------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEBULA_API_KEY`                     | **Yes**  | Core       | Authenticates server-side requests against the [Nebula API](https://api.utdnebula.com/). Contact the Trends Project Lead or ask in `#portfolio-engineering` on the [Nebula Labs Discord](https://discord.utdnebula.com). |
| `NEBULA_API_URL`                     | **Yes**  | Core       | Base URL for the Nebula API. Defaults to `https://api.utdnebula.com/` (trailing slash required).                                                                                                                         |
| `NEBULA_API_STORAGE_BUCKET`          | Optional | AI Summary | Storage bucket name for cached Rate My Professor summaries. Leave empty unless developing summarization features.                                                                                                        |
| `NEBULA_API_SYLLABUS_STORAGE_BUCKET` | Optional | AI Summary | Storage bucket name for cached syllabus summaries. Leave empty unless developing summarization features.                                                                                                                 |
| `NEBULA_API_STORAGE_KEY`             | Optional | AI Summary | Storage authentication key for syllabus and RMP caches.                                                                                                                                                                  |
| `GEMINI_SERVICE_ACCOUNT`             | Optional | AI Summary | Google GenAI service account credentials JSON string for Gemini summaries.                                                                                                                                               |
| `NEXT_PUBLIC_SENTRY_DSN`             | Optional | Analytics  | Data Source Name for Sentry client-side error reporting. Can be left empty for local development.                                                                                                                        |

---

## Running the Application

### 1. Start the Development Server

Launch the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. The page hot-reloads automatically as you edit source files.

Congratulations! You're running UTD Trends on your machine, and you're now ready to code.

### 2. Code Verification & Formatting

Always run formatting, lint, and type checks before committing code:

```bash
# Auto-format all code with Prettier
npm run format

# Auto-fix ESLint issues
npm run lint

# Verify TypeScript types
npm run type:check
```

### 3. Run Tests

Run the Jest test suite with:

```bash
npm test
```

---

## Ask Questions

Confused about anything? Feel free to ask on the [Nebula Labs Discord](https://discord.utdnebula.com)—`#portfolio-engineering` is a good place to start.

---

## Next Steps

Explore the [Project Architecture](Project-Architecture.md) to understand how state, data fetching, and graph visualizations connect across the codebase.
