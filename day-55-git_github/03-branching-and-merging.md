# 03 - Branching and Merging

## What is a Branch?
A branch is essentially a separate timeline of your code. It allows you to work on new features or bug fixes independently without affecting the stable, primary version of your project (usually named `main` or `master`).

## Working with Branches

### Viewing Branches
List all local branches. The branch with an asterisk `*` next to it is your current branch.
```bash
git branch
```

### Creating a Branch
Create a new branch based on your current state.
```bash
git branch <branch-name>
```

### Switching Branches
Switch your working directory to another branch.
```bash
git switch <branch-name>
# OR the older command:
git checkout <branch-name>
```

### Creating and Switching Simultaneously
```bash
git switch -c <branch-name>
# OR
git checkout -b <branch-name>
```

## Merging Branches
Once you have finished working on your feature branch, you will want to combine those changes back into the main branch.

1. First, switch to the branch you want to merge *into* (e.g., `main`):
   ```bash
   git switch main
   ```
2. Then, run the merge command:
   ```bash
   git merge <feature-branch-name>
   ```

## Resolving Merge Conflicts
If Git detects that the same line of code was changed in both branches you are trying to merge, it cannot automatically determine which version to keep. This is a **merge conflict**.

1. Git will pause the merge and mark the conflicting files.
2. If you open the conflicting file, you will see markers:
   ```text
   <<<<<<< HEAD
   Current branch code here
   =======
   Incoming branch code here
   >>>>>>> feature-branch
   ```
3. You must manually edit the file to keep the correct code, and remove the `<<<<`, `====`, and `>>>>` markers.
4. Once resolved, save the file, stage it (`git add`), and complete the merge with a standard `git commit`.
