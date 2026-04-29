# Applying the Phase 1 changes locally (with conflict resolution)

If your branch diverged from the commit titled:

> **Phase 1: DB-backed topics, hardened attempt lifecycle, AI evaluation, analytics & UI updates**

you may hit merge/cherry-pick conflicts while applying it. Use this runbook to apply the changes cleanly.

## 1) Start from a clean working tree

```bash
git status
```

If needed, stash or commit local work first:

```bash
git add -A
git commit -m "WIP: save local work before phase1 apply"
# or: git stash push -u -m "pre-phase1"
```

## 2) Fetch latest refs

```bash
git fetch --all --prune
```

## 3) Create a dedicated integration branch

```bash
git switch main
git pull --ff-only
git switch -c chore/apply-phase1
```

## 4) Cherry-pick the Phase 1 commit

## 4a) If you only know the PR title, locate commit SHA directly

```bash
git log --oneline --decorate --all --grep "Phase 1: DB-backed topics"
```

Copy the SHA from the result and reuse it as `<PHASE1_SHA>` below.

Find the commit SHA from history:

```bash
git log --oneline --decorate --max-count=30
```

Then apply it:

```bash
git cherry-pick <PHASE1_SHA>
```

If there are no conflicts, skip to step 7.

## 5) Resolve common conflicts (file-by-file)

List unresolved files:

```bash
git status
```

For each conflicted file:

1. Open file and find conflict markers:
   - `<<<<<<< HEAD`
   - `=======`
   - `>>>>>>> <commit>`
2. Keep Phase 1 behavior for these areas:
   - DB-backed topics (`actions/getTopics.ts`, `lib/topics.ts`, `lib/topicCatalog.tsx`)
   - Attempt lifecycle + timing (`actions/generateQuestions.ts`, `actions/submitAnswers.ts`)
   - Updated evaluation schemas (`lib/zodSchemas.ts`)
   - New migration (`supabase/migrations/20260425_phase1_schema.sql`)
3. Remove all conflict markers after resolving.
4. Mark each file resolved:

```bash
git add <resolved_file>
```

When all files are resolved:

```bash
git cherry-pick --continue
```

## 6) If conflict resolution gets messy, retry with a merge strategy

Abort current cherry-pick:

```bash
git cherry-pick --abort
```

Retry preferring incoming changes on conflict:

```bash
git cherry-pick -X theirs <PHASE1_SHA>
```

> Use `-X theirs` carefully and still review final diff before shipping.

## 7) Run verification commands

```bash
npm install
npm run lint
npm run typecheck
npm run verify
```

If migration is part of your workflow, apply and validate it in your Supabase environment before merging.

## 8) Review and push

```bash
git show --stat
git push -u origin chore/apply-phase1
```

Open a PR from `chore/apply-phase1` into your target branch.

## 9) Fast rollback options

Undo the cherry-pick commit (if already created):

```bash
git revert <NEW_COMMIT_SHA>
```

Or reset integration branch:

```bash
git reset --hard origin/main
```

---

## Quick copy/paste flow

```bash
git fetch --all --prune
git switch main && git pull --ff-only
git switch -c chore/apply-phase1
git cherry-pick <PHASE1_SHA> || true
git status
# resolve conflicts + git add ...
git cherry-pick --continue
npm install
npm run verify
```
