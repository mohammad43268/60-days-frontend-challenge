# 01 - Getting Started with Git

## What is Git?
Git is a distributed version control system (VCS) created by Linus Torvalds in 2005. It allows developers to track changes in their source code over time, revert to previous stages, and collaborate seamlessly with other developers. Because it is "distributed," every developer has a full copy of the project's history on their local machine.

## Initial Setup and Configuration
Before you can start using Git, you should configure your identity. Git attaches this information to every commit you make.

Open your terminal and run:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

You can verify your configuration at any time with:
```bash
git config --list
```

## Creating a Repository
A "repository" (or "repo") is a folder that Git is tracking. There are two primary ways to start a repository:

### 1. Initialize a New Local Repository
If you have an existing folder on your computer that you want to start tracking, navigate to it in your terminal and run:
```bash
git init
```
This creates a hidden `.git` folder inside your directory, which contains all the necessary metadata for version control.

### 2. Clone an Existing Repository
If you want to download a project that already exists on a platform like GitHub, use the `clone` command:
```bash
git clone <repository-url>
```
This downloads the entire repository, including all files, branches, and commit history, directly to your machine.
