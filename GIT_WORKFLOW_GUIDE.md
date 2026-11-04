# CAMPUS OS — GIT WORKFLOW GUIDE

## 1. Daily Development Workflow

### Step 1: Synchronize with Remote
Always fetch and pull the latest changes before starting work:
```bash
git checkout main
git pull origin main
```

### Step 2: Feature Branching
For isolated features or bug fixes, create a descriptive branch:
```bash
git checkout -b feat/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### Step 3: Verify Secrets and Unstaged Files
Before staging, verify that no `.env` or sensitive credentials will be added:
```bash
git status
git diff
```

### Step 4: Run Audit & Build Suites
Always verify build integrity prior to committing:
```bash
cd client && npm run build && cd ..
node scripts/verify-ui-ux.js
node scripts/verify-phase-5-responsiveness-a11y.js
```

### Step 5: Professional Commit Formatting
Follow conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`):
```bash
git add -A
git commit -m "feat: descriptive summary of change"
```

### Step 6: Push to GitHub
Push your commits cleanly to the remote repository:
```bash
git push origin main
```

---

## 2. Commit Message Standards
- `feat:` A new feature or major UI/UX enhancement.
- `fix:` A bug fix or correction.
- `docs:` Documentation updates only.
- `style:` Formatting or UI styling changes that do not affect logic.
- `refactor:` Code improvements without adding features or changing existing behavior.
- `test:` Adding or updating automated verification scripts.
- `chore:` Dependency maintenance or configuration adjustments.

---

## 3. Security Rules
- **NEVER** force push (`git push --force`) to shared branches.
- **NEVER** commit `.env` or database connection strings.
- **ALWAYS** check `git status` before executing `git add -A`.
