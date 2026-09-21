# UTD Trends

_Intuitive course grade distributions, professor metrics, and schedule planning for UT Dallas._

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Project maintained by [Nebula Labs](https://about.utdnebula.com).

> [!TIP]
> **Developer Wiki**: If you are interested in contributing or developing on this project, head over to our [**Developer Wiki**](docs/Home.md)!

---

## Quick Navigation

- [Developer Wiki](docs/Home.md)
- [Getting Started Guide](docs/Getting-Started.md)
- [Project Architecture](docs/Project-Architecture.md)
- [Project Structure & Codebase Map](docs/Project-Structure.md)
- [Contributing Guide](docs/How-to-Contribute.md)
- [Troubleshooting & FAQ](docs/Troubleshooting.md)
- [Discord Community](https://discord.utdnebula.com)

---

## About

UTD Trends offers students and faculty an accessible, visual interface for analyzing historical grade distribution data stored in the [Nebula API](https://github.com/UTDNebula/nebula-api) and student feedback from Rate My Professors.

### Key Features

- **Grade Distributions**: Historical A through F and W distributions across semesters.
- **Professor Comparisons**: Compare instructor GPA averages and grading trends across course sections.
- **Schedule Integration**: Interactive calendar view with section meeting times and location details.
- **Fast Autocomplete**: Sub-millisecond client-side search powered by graph indexing.

---

## Prerequisites

- **Node.js**: `22.x` or higher (`node -v`)
- **npm**: Bundled with Node.js
- **Git**: For version control

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/UTDNebula/utd-trends.git
cd utd-trends

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Add your Nebula API key to .env:
# NEBULA_API_KEY="your_key_here"

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the running app.

---

## Available Scripts

| Command                     | Description                                                               |
| :-------------------------- | :------------------------------------------------------------------------ |
| `npm run dev`               | Starts Next.js development server at `localhost:3000` (Turbopack default) |
| `npm run build`             | Compiles production-ready Next.js application                             |
| `npm start`                 | Runs the compiled production server                                       |
| `npm run format`            | Auto-formats codebase with Prettier                                       |
| `npm run format:check`      | Verifies code formatting against Prettier rules                           |
| `npm run lint`              | Auto-fixes linting issues with ESLint                                     |
| `npm run lint:check`        | Validates codebase against ESLint rules                                   |
| `npm run type:check`        | Verifies TypeScript types without emitting JavaScript                     |
| `npm run fetchdata`         | Fetches fresh aggregated grade data from the Nebula API                   |
| `npm run buildautocomplete` | Compiles Graphology search autocomplete graph                             |
| `npm run buildcoursenames`  | Generates course code to title mapping tables                             |
| `npm run buildcombos`       | Generates professor-course combination indexes                            |

---

## Contributing

We welcome community contributions! Please review [docs/How-to-Contribute.md](docs/How-to-Contribute.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

1. Pick an open issue on [GitHub Issues](https://github.com/UTDNebula/utd-trends/issues).
2. Branch from `develop`: `git checkout -b feature/<feature-name>`.
3. Adhere to [Conventional Commits](https://www.conventionalcommits.org/).
4. Verify code passes `npm run format:check` and `npm run lint:check`.
5. Open a Pull Request against `develop`.

---

## Community & Support

Have questions, suggestions, or need an API key? Reach out to the team on our [Discord](https://discord.utdnebula.com) in `#portfolio-engineering`!

## License

This project is open-source software licensed under the [MIT License](LICENSE).
