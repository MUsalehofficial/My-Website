# My Portfolio

Personal portfolio site for [musalehofficial.com](https://www.musalehofficial.com/).

## Deploy (GitHub Pages)

The site is a static site published from the **`main`** branch (no build step).

1. Open [Repository Settings → Pages](https://github.com/MUsalehofficial/My-Website/settings/pages).
2. Under **Build and deployment**, choose **Deploy from a branch** (not “GitHub Actions”).
3. Set **Branch** to `main` and folder **`/ (root)`**, then click **Save**.
4. Wait a few minutes for the deployment to finish.

Credly badges are embedded in `index.html`. To refresh badge data after earning a new one:

```bash
npm run sync:credly
# then commit assets/data/credly-badges.json and update index.html if needed
```

## Local commands

```bash
npm install
npm run lint
npm run format
npm run sync:credly
```

Serve locally:

```bash
npx serve .
```

## CI

Lint checks run manually from the **Actions** tab (`CI` workflow → **Run workflow**) while automated runner access is restricted.
