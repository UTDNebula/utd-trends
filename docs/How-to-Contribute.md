# How to Contribute

Thank you for your interest in contributing to UTD Trends! We welcome contributions ranging from bug fixes and documentation improvements to new visualization features.

---

## 1. Finding Something to Work On

Check our open issues on [GitHub Issues](https://github.com/UTDNebula/utd-trends/issues).

- **`Special: Good First Issue`**: Ideal for newcomers wanting to learn the codebase and project structure.
- **`Type: Feature Request`**: New capabilities or enhancements.
- **`Type: Bug Report`**: Confirmed issues needing reproduction and fixes.

Before writing code, leave a comment on the issue you wish to tackle so a maintainer can assign it to you. If you have an idea that isn't logged yet, feel free to open an issue or ask in `#trends-dev` on [Discord](https://discord.utdnebula.com).

> [!NOTE]
> For beginner-friendly issues, we encourage writing code yourself rather than relying on automated generators. Review Nebula Labs' [AI Policy](https://nebula-labs.atlassian.net/wiki/spaces/NLG/pages/1135607810/AI+Policy) for acceptable tooling usage.

---

## 2. Branching Conventions

Always branch from the latest `develop` branch:

```bash
git checkout develop
git pull origin develop
git checkout -b <branch-type>/<short-description>
```

### Branch Prefixes

| Prefix     | Purpose                                        | Example                        |
| :--------- | :--------------------------------------------- | :----------------------------- |
| `feature/` | New user-facing feature or enhancement         | `feature/section-grade-filter` |
| `bugfix/`  | Bug or defect fix                              | `bugfix/mobile-card-scroll`    |
| `chore/`   | Tooling, documentation, or dependency upgrades | `chore/update-developer-docs`  |

---

## 3. Commit Message Standards

Project Nebula enforces the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<optional-scope>): <description>

[optional body]
```

### Common Types

- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `chore`: Build tasks, dependency updates, or internal scripts.
- `refactor`: Code restructuring without changing external behavior.
- `test`: Adding or updating test cases.

**Example:**

```bash
git commit -m "feat(graph): add GPA progression indicator for multi-semester views"
```

---

## 4. Pre-Commit Verification

Before pushing your branch, run the local verification suite:

```bash
# Verify Prettier formatting
npm run format:check

# Run ESLint analysis
npm run lint:check

# Verify Next.js production compilation
npm run build
```

If formatting issues arise, resolve them automatically:

```bash
npm run format
npm run lint
```

---

## 5. Opening a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin <branch-type>/<short-description>
   ```
2. Open a Pull Request targeting the **`develop`** branch.
3. Fill out the [Pull Request Template](../.github/pull_request_template.md) completely:
   - Link the relevant issue number (`Fixes #123`).
   - Detail the changes made.
   - Attach screenshots or screen recordings for UI adjustments.
4. Mark the PR as a **Draft** if work is still in progress.
5. Once ready, request review from the Trends maintainers in `#trends-dev` on Discord.
