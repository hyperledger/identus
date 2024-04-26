# Contributing to Identus

We would love for you to contribute to Identus and help make it even better than it is today!
As a contributor, here are the guidelines we would like you to follow:

 - [DCO](#dco)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)
 - [Guidelines for Closing Issues](#closing)
 

## <a name="dco"></a> Developer Certificate of Origin (DCO)

Identus enforces the Developer Certificate of Origin (DCO). It requires all commit messages to contain the `Signed-off-by` line with an email address that matches the commit author and the name on your GitHub account.

Please read and follow set up [DCO](./DCO.md).

## <a name="issue"></a> Found a Bug?

If you find a bug in the source code, you can help us by [submitting an issue](#submit-issue).

Even better, you can [submit a Pull Request](#submit-pr) with a fix.


## <a name="feature"></a> Missing a Feature?

You can *request* a new feature by [submitting an issue](#submit-issue) to our GitHub Repository.
If you would like to *implement* a new feature, please consider the size of the change in order to determine the right steps to proceed:

* For a **Major Feature**, first open an issue and outline your proposal so that it can be discussed.
  This process allows us to better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.

  **Note**: Adding a new topic to the documentation, or significantly re-writing a topic, counts as a major feature.

* **Small Features** can be crafted and directly [submitted as a Pull Request](#submit-pr).


## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker. An issue for your problem might already exist and the discussion might inform you of workarounds readily available.

You can file new issues by selecting a `Bug Report` template on the Issues submission page.

### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search the repository for an open or closed PR that relates to your submission.
   You don't want to duplicate existing efforts.

2. Be sure that an issue describes the problem you're fixing, or documents the design for the feature you'd like to add.
   Discussing the design upfront helps to ensure that we're ready to accept your work.

3. Make sure all your commits have DCO sign-off line with an email address that matches the commit author and the name on your GitHub account.

4. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the corresponding repo.

5. In your forked repository, make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch main
     ```

6. Create your patch, **including appropriate test cases**.

7. Follow our [Coding Rules](#rules).

8. Ensure that all tests and CI checks pass.

9. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit).
   Adherence to these conventions is necessary because release notes are automatically generated from these messages.

     ```shell
     git commit --all
     ```
    Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

10. Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

11. In GitHub, send a pull request to `main`.

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the main branch:

    ```shell
    git checkout main -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your local `main` with the latest upstream version:

    ```shell
    git pull --ff upstream main
    ```

## <a name="commit"></a> Commit Message Format

Please, follow our [Commit Message guidelines](https://handbook.atalaprism.io/engineering/sdlc/commit-guidelines) for all commits you made, and make sure your PR title is following this format.

## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs (unit-tests).
* All  **must be documented**.

## <a name="closing"></a> Guidelines for Closing Issues
To ensure a smooth and productive issue management process that respects all contributors' efforts and maintains project clarity, we kindly request that you follow these guidelines when closing issues. It is important always to maintain a polite and respectful tone when interacting with others in the issues section. Additionally, please acknowledge contributions and provide clear explanations for decisions. 

### Resolution
Issues should be closed when:

- The original bug has been fixed.
- A feature request has been implemented.
- A question has received a definitive answer.

### Non-Actionable Issues
Close an issue if:

- It duplicates an existing open issue.
- The request is outside the project's current scope.
- The issue lacks sufficient information, and the original reporter has not responded to requests for clarification.

### Stale Issues
Issues that have not had any activity for 30 days should be tagged as stale. After 60 days, they should be considered for closure to prevent clutter.

### Verification Before Closing
Ensure that the resolution actually addresses the issue effectively. Involve others in testing or reviewing the solution when necessary.

### Communication
Always leave a comment explaining the reason for closing the issue. This helps provide clarity and context to all participants.

### Labeling
It is recommended to apply appropriate labels such as "out of scope", "can't repro", "duplicate", "stale" or "won't-fix" to closed issues. This aids in tracking and analysis.

### Who Should Close Issues
- The Original Reporter: May close the issue if they are satisfied with the resolution.
- Maintainers/Contributors: Those with write permissions can close issues as described above.
