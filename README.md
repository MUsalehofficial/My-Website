# My Portfolio

This repository contains my personal portfolio website.

## DevOps Learning Setup

This project now uses a beginner-friendly DevOps flow:

1. **Source Control (GitHub):** code is stored in a GitHub repository.
2. **CI (Continuous Integration):** every push and pull request runs quality checks.
3. **CD (Continuous Deployment):** every push to `main` auto-deploys to GitHub Pages.

## CI Pipeline

Workflow file: `.github/workflows/ci.yml`

What it does:

- checks out the code
- installs dependencies (`npm ci`)
- runs lint checks (`npm run lint`)

## CD Pipeline

Workflow file: `.github/workflows/deploy-pages.yml`

What it does:

- triggers on push to `main`
- uploads the static site
- deploys it to GitHub Pages

## Local Commands

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run lint
```

Auto-format files:

```bash
npm run format
```

## Next DevOps Steps (Recommended)

- Add branch protection rules (require CI to pass before merge).
- Add semantic version tags and release notes.
- Add environments for staging/production.
- Add automated tests as the site grows.
