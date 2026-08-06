# 04 - Remote Repositories and GitHub

## What is a Remote?
A "remote" is a version of your repository that is hosted on the internet or network, most commonly on platforms like **GitHub**, GitLab, or Bitbucket. While Git runs locally, these platforms provide a central place for teams to collaborate, review code, and back up work.

## Managing Remotes

### Adding a Remote
If you initialized a local repository and want to push it to a new GitHub repository, you must link them by adding a remote. (By convention, the primary remote is named `origin`).
```bash
git remote add origin <repository-url>
```

### Viewing Remotes
Check which remotes are connected to your local repository.
```bash
git remote -v
```

## Pushing and Pulling

### `git push`
Uploads your local commits to the remote repository.
```bash
# Push a specific branch for the first time
git push -u origin <branch-name>

# Subsequent pushes on that branch
git push
```

### `git fetch`
Downloads new data from the remote repository (like new branches or commits) but **does not** automatically merge them into your local working files.
```bash
git fetch origin
```

### `git pull`
A combination of `git fetch` and `git merge`. It downloads the latest changes from the remote repository and immediately merges them into your current local branch.
```bash
git pull origin <branch-name>
```

## Handling Remote Branches
When someone else pushes a new branch to GitHub, you won't automatically see it locally until you fetch.
1. Run `git fetch`
2. Switch to the new remote branch: `git switch <branch-name>` (Git is smart enough to track the remote branch automatically if names match).
