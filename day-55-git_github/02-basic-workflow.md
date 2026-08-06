# 02 - The Basic Git Workflow

## The Three States of Git
Understanding Git requires understanding the three main states that your files can reside in:

1. **Working Directory**: The actual files on your computer's filesystem. This is where you modify, add, or delete files.
2. **Staging Area (Index)**: A "waiting room." You explicitly tell Git which modified files you want to include in your next save point.
3. **Git Directory (Repository)**: The local database where Git permanently stores the saved snapshots (commits).

## The Core Commands

### `git status`
The most important command to know what is currently happening. It tells you which files are modified, which are staged, and which are untracked.
```bash
git status
```

### `git add`
Move changes from your Working Directory to the Staging Area.
- Stage a specific file: `git add filename.txt`
- Stage all current changes: `git add .`

### `git commit`
Take a snapshot of your Staging Area and save it permanently to the local repository.
```bash
git commit -m "Your descriptive commit message"
```
A good commit message should be concise and explain *why* the change was made, not just *what* was changed.

### `git log`
View the history of commits in your repository.
```bash
git log
```
For a more compact view:
```bash
git log --oneline
```

### `git diff`
Shows the exact lines of code that were changed but have not yet been staged.
```bash
git diff
```
