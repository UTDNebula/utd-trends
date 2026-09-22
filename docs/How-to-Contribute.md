# How to Contribute

Thank you for your interest in contributing to UTD Trends! We welcome contributions ranging from bug fixes and documentation improvements to new visualization features.

If you need a refresher on how to use Git and/or GitHub, check out [Nebula's Git Workshop](https://github.com/UTDNebula/git-workshop).

---

## 1. Finding Something to Work On

You can find something to work on in these locations:

- [**Portfolio Project board**](https://github.com/orgs/UTDNebula/projects/30) — The first place to look. Includes all current tasks for Portfolio in an organized manner.
- [**Trends Issues page**](https://github.com/UTDNebula/utd-trends/issues) — Trends-specific issues. You can also [create your own issue](https://github.com/UTDNebula/utd-trends/issues/new/choose).

Useful labels when browsing issues:

- **`Good First Issue`**: Ideal for newcomers wanting to learn the codebase and project structure.
- **`Type: Feature Request`**: New capabilities or enhancements.
- **`Type: Bug Report`**: Confirmed issues needing reproduction and fixes.

Before writing code, leave a comment on the issue you wish to tackle so a maintainer can assign it to you. If you have an idea that isn't logged yet, feel free to open an issue or ask in `#portfolio-engineering` on [Discord](https://discord.utdnebula.com).

> [!NOTE]
> For beginner-friendly issues, we encourage writing code yourself rather than relying on automated generators. Review Nebula Labs' [AI Policy](https://nebula-labs.atlassian.net/wiki/spaces/NLG/pages/1135607810/AI+Policy) for acceptable tooling usage.

---

## 2. Branching Conventions

Nebula recruits and members should make their changes on a branch in the `utd-trends` repository. External contributors should work off of a fork, as they do not have permission to create a branch.

Always branch from the latest `develop` branch. You can create a branch with [GitHub Desktop](https://github.com/apps/desktop) or the terminal:

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

> [!TIP]
> GitHub can create a branch from an issue. On the issue page, select **Create a branch** under the **Development** section in the right sidebar, then rename it to follow the prefixes above if needed.

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

Always run formatting, lint, and type checks before committing code:

```bash
# Auto-format all code with Prettier
npm run format

# Auto-fix ESLint issues
npm run lint

# Verify TypeScript types
npm run type:check
```

---

## 5. Opening a Pull Request

1. Push your branch to GitHub (you can also push with [GitHub Desktop](https://github.com/apps/desktop)):
   ```bash
   git push origin <branch-type>/<short-description>
   ```
2. Create a Pull Request targeting the **`develop`** branch.

> [!TIP]
> To create a pull request:
>
> 1. Open the [pull requests page](https://github.com/UTDNebula/utd-trends/pulls) and click **New pull request**.
> 2. Select your branch from the **compare** dropdown, then click **Create pull request**.
> 3. If you're not finished or want help reviewing progress, use the dropdown to choose **Create draft pull request**.

3. Fill out the [Pull Request Template](https://github.com/UTDNebula/utd-trends/blob/develop/.github/pull_request_template.md) completely:
   - Link the relevant issue number (`Fixes #123`).
   - Detail the changes made.
   - Attach screenshots or screen recordings for UI adjustments.
4. When ready, request review from the Trends maintainers in `#portfolio-engineering` on Discord. Keep the PR as a **Draft** while work is in progress or if you're stuck and want eyes on it.

When your pull request is approved and merged into `develop`, your changes will appear on the [development site](https://dev.trends.utdnebula.com). When maintainers publish a release to `main`, they will go live on [trends.utdnebula.com](https://trends.utdnebula.com).
