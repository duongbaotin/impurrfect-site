# Git Workflow

## Why branches?

Every push to `main` triggers a live deploy on Vercel. If you push broken or half-finished code, your live site breaks. Branches let you work in isolation, preview the result, and only merge when it's ready.

## Flow

```
main ────────┬───────────────────┬────────────  (always deployable)
             \                   /
feat/xyz      ───► preview ───► merge
```

## Step-by-step

```bash
# 1. Start a new feature from a clean main
git checkout main
git pull origin main
git checkout -b feat/what-youre-working-on

# 2. Work and commit as usual
#    (commit often — it's your branch, you can always squash later)

# 3. Before pushing, verify the build
npm run check && npm run build && npm run preview
#    Type-check first, then opens localhost:4321 — exactly what Vercel will serve.
#    Check for errors and visual regressions.

# 4. Push the branch
git push -u origin feat/what-youre-working-on
#    Vercel automatically creates a preview URL:
#    https://impurrfect-site-git-<branch-name>-<your-username>.vercel.app
#    Share this URL to review the live-ish version.

# 5. Merge back to main
#    Option A — via GitHub: create a Pull Request, review, merge
#    Option B — locally:
git checkout main
git merge feat/what-youre-working-on
git push origin main
#    Vercel auto-deploys main to your live domain.
```

## Branch naming

| Prefix | Use |
|--------|-----|
| `feat/` | New feature (e.g. `feat/photo-gallery`) |
| `fix/` | Bug fix (e.g. `fix/menu-sort-order`) |
| `chore/` | Tooling, config, dependencies (e.g. `chore/update-deps`) |

## When to use branches

- **Always** for new features or significant changes
- **Optional** for one-line typo fixes (edit directly on GitHub or commit straight to main)
- **Never** push broken code to main

## Local preview (always do this before pushing)

```bash
npm run check && npm run build && npm run preview
```

This catches:
- Type errors (invalid TypeScript)
- Build errors (missing imports, invalid Astro syntax)
- Broken pages (wrong routes, missing content)
- Visual issues (CSS changes you didn't expect)

It takes ~10 seconds and saves you from deploying a broken site.
