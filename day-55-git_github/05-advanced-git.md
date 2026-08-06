# 05 - Advanced Git Techniques

As you become more comfortable with Git, you'll need tools to help you manage complex situations, fix mistakes, and keep a clean history.

## Git Stash
If you are working on a feature but suddenly need to switch branches (e.g., for an urgent bug fix), you can't leave uncommitted changes lying around. 
`git stash` temporarily shelves your modified, tracked files so you can work on something else, and then re-apply them later.

- **Stash changes:** `git stash`
- **View stashes:** `git stash list`
- **Re-apply changes:** `git stash pop` (applies and removes from stash list)

## Undoing Changes

### `git reset` (Altering History)
Used to un-stage files or physically erase commits. **Warning:** Be very careful using reset on commits that have already been pushed to a remote!
- **Un-stage a file:** `git reset filename` (Moves it from Staging back to Working Directory)
- **Erase last commit (keep changes):** `git reset --soft HEAD~1`
- **Erase last commit (destroy changes):** `git reset --hard HEAD~1`

### `git revert` (Safe Undoing)
Instead of erasing history, `revert` creates a *new* commit that applies the exact opposite changes of the target commit. This is the safe way to undo a commit that has already been shared with others.
```bash
git revert <commit-hash>
```

## Rebase vs. Merge
Both integrate changes from one branch into another, but they do it differently.
- **Merge** creates a new "merge commit" that ties the histories together. It's non-destructive.
- **Rebase** rewrites history by taking your current branch commits and physically moving them to the tip of another branch, resulting in a perfectly linear history.
```bash
# While on your feature branch:
git rebase main
```
*Rule of thumb: Never rebase commits that exist outside your local repository.*

## Cherry-Picking
Sometimes you just want one specific commit from another branch, rather than merging the whole branch.
```bash
git cherry-pick <commit-hash>
```

## Git Hooks
Git hooks are scripts that Git executes automatically before or after events such as: commit, push, and receive. 
- **Pre-commit hooks** are heavily used in modern web development (via tools like Husky) to automatically format code (Prettier) or check for syntax errors (ESLint) before allowing a commit to be created.
