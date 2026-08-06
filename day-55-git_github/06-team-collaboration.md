# 06 - Team Collaboration & Open Source

Working on a project alone is straightforward, but collaborating with hundreds of other engineers requires strict workflows and communication.

## Branching Strategies
Teams adopt specific conventions on how branches should be created and merged to avoid chaos.
- **GitHub Flow**: A simple, lightweight workflow. `main` is always deployable. All new work is done on branches originating from `main`. When work is done, a Pull Request is opened, reviewed, and merged back into `main`.
- **GitFlow**: A more robust, multi-tier strategy involving `develop`, `release`, `hotfix`, and `feature` branches. Best for projects with scheduled release cycles.

## Pull Requests (PRs) and Code Reviews
A Pull Request (or Merge Request) is the primary method of collaboration on platforms like GitHub.
1. A developer pushes their feature branch to GitHub.
2. They open a PR against the `main` branch.
3. **Code Review**: Other team members read the code, leave comments on specific lines, and request changes if necessary.
4. Once approved, the branch is merged. This ensures quality control and knowledge sharing.

## CI/CD (Continuous Integration / Continuous Deployment)
Modern companies automate their workflows using tools like **GitHub Actions**.
When a developer opens a PR or pushes to `main`, a cloud server automatically:
- Runs automated tests (Unit testing, E2E testing).
- Builds the application.
- If everything passes, it deploys the code automatically to production servers.

## Contributing to Open Source (Forking Workflow)
You cannot push directly to someone else's repository. The Forking workflow solves this:
1. **Fork**: Click "Fork" on GitHub to create a personal server-side copy of the repository.
2. **Clone**: `git clone` your fork to your local machine.
3. **Add Upstream**: Link your local clone back to the original project so you can stay updated.
   `git remote add upstream <original-repo-url>`
4. **Branch & Commit**: Create a branch and write your code.
5. **Push to Fork**: Push the branch to *your* forked repository.
6. **Open PR**: Go to the original repository on GitHub and open a Pull Request from your fork. 
7. **Merge**: The maintainers of the original project will review and eventually merge your contribution.
