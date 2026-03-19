Deploy this project to GitHub Pages and return both the Pages URL and the git remote URL.

Follow these steps exactly:

## 1. Check prerequisites

Check if the GitHub CLI is installed:
```
gh --version
```
If missing, tell the user to install it from https://cli.github.com and stop.

Check if the user is authenticated:
```
gh auth status
```
If not authenticated, run:
```
gh auth login
```
Follow the prompts (browser-based login). Stop if login fails.

## 2. Determine the repository name

Use the current directory name as the repo slug. Get it with:
```
basename "$PWD"
```
Store the result as REPO_NAME. It will be used for the GitHub remote and the Vite base path.

## 3. Initialize git if needed

Check if a git repo already exists:
```
git rev-parse --is-inside-work-tree 2>/dev/null
```
If not a git repo, initialize one and make the first commit:
```
git init
git add .
git commit -m "Initial commit"
```
If it is already a git repo, ensure all changes are committed:
```
git add .
git diff --cached --quiet || git commit -m "chore: pre-deploy snapshot"
```

## 4. Create GitHub repository (if it doesn't already exist)

Check if a remote named `origin` is already set:
```
git remote get-url origin 2>/dev/null
```
If no remote exists, create a new **public** GitHub repository and link it:
```
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
```
If the remote already exists, just push the current branch:
```
git push -u origin HEAD
```
Capture the remote URL for later output:
```
git remote get-url origin
```

## 5. Update vite.config.ts base path for GitHub Pages

GitHub Pages serves the site under `https://<username>.github.io/<repo-name>/`, so Vite must
know the sub-path. Edit `vite.config.ts` to add `base: '/<REPO_NAME>/'` inside `defineConfig`.

Read the current `vite.config.ts`, then use the Edit tool to insert the base option.
The target block to update looks like:
```ts
export default defineConfig({
  plugins: [react()],
```
Replace it with:
```ts
export default defineConfig({
  base: '/<REPO_NAME>/',
  plugins: [react()],
```
Substitute the actual REPO_NAME value (not the literal string `<REPO_NAME>`).

## 6. Build the project

```
npm run build
```
Stop and report the error if the build fails. The output lands in `build/`.

## 7. Deploy to the `gh-pages` branch

Install the `gh-pages` package if it is not already present:
```
npm list gh-pages --depth=0 2>/dev/null || npm install --save-dev gh-pages
```

Add a deploy script to package.json if it is missing:
Use the Edit tool to add `"deploy": "gh-pages -d build"` into the `"scripts"` section of `package.json`.

Run the deploy:
```
npm run deploy
```

## 8. Enable GitHub Pages on the repository (gh-pages branch)

```
gh api repos/:owner/:repo/pages \
  --method POST \
  -f source[branch]=gh-pages \
  -f source[path]=/ \
  2>/dev/null || echo "Pages may already be enabled"
```

## 9. Commit the vite.config.ts change back to main

```
git add vite.config.ts package.json package-lock.json
git commit -m "chore: set Vite base for GitHub Pages deployment" --allow-empty
git push origin HEAD
```

## 10. Report results

Get the GitHub username:
```
gh api user --jq '.login'
```

Print both URLs clearly:

```
Git repository : https://github.com/<username>/<REPO_NAME>
GitHub Pages   : https://<username>.github.io/<REPO_NAME>/
```

Note: GitHub Pages can take 1–3 minutes to become live after the first deploy.
