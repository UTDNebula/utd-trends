# Troubleshooting & FAQ

This guide provides resolutions to common configuration, runtime, and build issues encountered during local development.

---

## 1. Node.js Version Incompatibility

### Symptoms

- Dependency installation fails with engine warnings or errors.
- Syntax errors on modern ECMAScript or Next.js 16 features.

### Solution

Trends requires **Node.js 22.x** or higher (`"engines": { "node": "22.x" }` in `package.json`).
Verify your active Node version:

```bash
node -v
```

If your version is below 22, switch using `nvm` or your preferred version manager:

```bash
nvm install 22
nvm use 22
```

---

## 2. Nebula API Authentication Errors (401 / 403)

### Symptoms

- Grade distributions and professor queries fail to load data.
- Running `npm run fetchdata` outputs authorization errors.

### Solution

Ensure you have created a `.env` file at the root of `utd-trends` (copied from `.env.example`) containing:

```env
NEBULA_API_URL="https://api.utdnebula.com/"
NEBULA_API_KEY="your_api_key_here"
```

If you do not have an API key, request one from the Trends Project Lead in `#portfolio-engineering` on the [Nebula Labs Discord](https://discord.utdnebula.com). Note that storage and Gemini keys (`NEBULA_API_STORAGE_*`, `GEMINI_SERVICE_ACCOUNT`) are optional and only needed when actively testing AI summarization features.

---

## 3. Port 3000 Collision

### Symptoms

- Starting `npm run dev` fails with `Error: listen EADDRINUSE: address already in use :::3000`.

### Solution

Specify an alternative port for the dev server:

```bash
npm run dev -- -p 3001
```

Or terminate the process occupying port 3000:

- **Windows (PowerShell)**:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```
- **macOS / Linux**:
  ```bash
  kill -9 $(lsof -t -i:3000)
  ```

---

## 4. Search Autocomplete Not Returning Results

### Symptoms

- Typing into the main search bar displays an empty dropdown or throws errors referencing undefined graph nodes.

### Solution

Regenerate the local search graph indexes:

```bash
npm run buildautocomplete
npm run buildcoursenames
npm run buildcombos
```

---

## 5. Corrupted Next.js Build Cache

### Symptoms

- Unexpected hydration errors or stale styling persist across page reloads.

### Solution

Clear the Next.js compilation cache and restart the dev server:

```bash
# Windows
Remove-Item -Recurse -Force .next
npm run dev

# macOS / Linux
rm -rf .next
npm run dev
```

---

## 6. Prettier or ESLint CI Pipeline Failures

### Symptoms

- The GitHub Actions PR check fails on formatting or import ordering rules.

### Solution

Run the auto-fix scripts locally before pushing:

```bash
npm run format
npm run lint
```

---

## Still Stuck?

Reach out to the team on Discord:

- `#portfolio-engineering` for codebase architecture, debugging, and API keys.
