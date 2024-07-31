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
 - [Triage process and labels](#triage)
 - [Releasing Identus ecosystem](#releasing)
 

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

### Who Should Close Issues
- The Original Reporter: May close the issue if they are satisfied with the resolution.
- Maintainers/Contributors: Those with write permissions can close issues as described above.

### Labeling
It is recommended to apply appropriate resolution labels such as `triage:out-of-scope`, `triage:cant-repro`, `triage:duplicate`, `triage:stale` or `triage:wont-fix` to closed issues. This aids in tracking and analysis.

# <a name="triage"></a> Triage process and labels
Main part of adding and updating labels is done through the triage process by a triage team or the implementation team, which are both part of maintainers. This is to make sure an issue is at an acceptable level (description, clarity) before it is assigned to be analysed.
In Identus, we are aiming that all the components are using same labels to bring convenience in review and coherence. This will necessit education within the maintainers community. We believe adding labels will have little impact on the engineers daily routine.

Labels are categorised with a prefix that will help showing the info in the same order on a labeled issue:
- `triage`: this gives the action requested from the triage team. It will help to filter during the triage
- `type`: to mark which category belongs an issues (e.g: bug, enhancement)
- `priority`: reflects the severity and order in which issues should be addressed, more from the business impact rather than the technical difficulty
- `component`: the team may set this label once the issue is analysed, to indicate which components are impacted

## Labels definition 
The triage labels that are defined and additional process details are precised in the following table:
| Label              | Description                                                                | Additional process                   | 
|--------------------|----------------------------------------------------------------------------|--------------------------------------|
| triage:needs-fix | This confirms that the bug is ready to be analysed further by the maintainer | `Assignees` = the team's lead (then the team's lead will assign further) |
| triage:query | Additional info is needed in order to analyse and fix (e.g: steps to reproduce are missing) | `Assignees` = Whoever needs to reply to the query |
| triage:good-first-issue | This indicates to the community that this issue would be a good candidate to start with |
| triage:help-wanted | The issue will not be taken in priority and maintainers are requested contributors to join and work on this issue |
| triage:stale | For issues that are seen once or have no paradigm to reproduce. The triage will then decide what action to do in order to progress. For example, asking the community on Discord if similar issue was seen, or asking QA to make dedicated tests to reproduce. This defect is under monitoring and after a few (four) weeks, the triage team will update the comment and might decide to close the issue | Triage team adds a comment to describe the next steps and `Assignees` is set accordingly |
| triage:cant-repro | It indicates the issue cannot be reproduced or was not seen for a long time | If triage is ok, the issue is closed | 
| triage:duplicate | Indicates the issue is duplicate of an existing one that shall be referred in the comment | If triage is ok, the issue is closed |
| triage:wont-fix | The decision is to accept the issue as is and not to work on this issue | If triage is ok, the issue is closed |
| triage:out-of-scope | Indicates the implementation is following the specification or an existing ADR (to be referred in the analyse) and awaiting confirmation by triage | If triage is ok, the issue is closed |
| type:bug | It should follow the template 'Bug report'. It could be a degradation in performance for a component or the whole ecosystem |
| type:docs | For a change or issue only related to documentation |
| type:enhancement | For a new feature or improvement of an existing feature. It might follow the template 'Feature request' but might also be a refactoring and technical debt |
| type:support | The reporter is asking for support from maintainers more than anything else |
| type:roadmap | This issue will appear in the project roadmap https://github.com/orgs/hyperledger/projects/48 |
| type:ci | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| type:test | Adding missing tests or correcting existing tests. This could be for a unit test, an integration test, a validation test |
| priority:critical | A large number of users or stakeholders are impacted, performance drained, crash, feature blocked, reproducible, interoperability, legal & regulatory, standard non-compliancy, security breach |
| priority:major | feature is working but some use cases, feature is not stable, regression, frequently seen, reproducible |
| priority:minor | no impact on the feature, not reproducible, not frequently seen, UI & cosmetics |
| component:cloud-agent | After analyse, the Cloud Agent is impacted by this issue |
| component:mediator | After analyse, the Mediator is impacted by this issue |
| component:SDK-swift | After analyse, the SDK Swift is impacted by this issue |
| component:SDK-KMP | After analyse, the SDK KMP is impacted by this issue |
| component:SDK-TS | After analyse, the SDK TS is impacted by this issue |
| component:node | After analyse, the Node is impacted by this issue |
| component:crypto-lib | After analyse, the Cryptographic library is impacted by this issue |
| component:infra | After analyse, the Infrastructure is impacted by this issue |

## Triage process
- Triage team should consist of a small number (three) of maintainers whose roles are covering technical and product aspects. Other experts might be invited at their discretion.
- We assume that at the beginning, a triage call will be needed and set by the triage team to get the triage kicked off and thus momentum will be gained.
- At the discretion of the triage team, some part of the triage might be executed in asynchronous way. It is also taking a decision on the issues that are not progressing or lacking of interest. But above all, it is alerting and making sure the critical issues are prioritised to the community interest.
- The triage process and using the same labels in all repositories is to ensure consistency

### 1. Initial Triage
   When a new issue is created, it should go through an initial triage process. This involves:
- Ensure the issue description is clear and has all necessary information (steps to reproduce, expected vs. actual behaviour, screenshots, etc.): if not, place the triage label, assign to the reporter and add a comment.
- Labels: Assign the appropriate `type`, `priority`, and `triage` labels based on the issue's details.
- Ownership: Assign the issue to a team member or the team's lead.
### 2. Prioritisation
  Regularly review and prioritise issues, typically in a meeting or in async way. This involves:
- Reviewing labels: Ensure that labels reflect the current state of the project.
- Re-assessing priority: Adjust priorities based on new information, changes in project scope, or external factors.
### 3. Assignment and Progress Tracking
- Track the progress of issues using status labels or using the Github board
- Regular updates: Ensure assignees provide regular updates on their progress and any blockers they encounter.
### 4. Review and Resolution
- Once an issue is addressed, it should go through a review process (PR review)
- Resolution: indicate with the triage label the resolution: `triage:wont-fix`, `triage:duplicate`, etc., to indicate how the issue was resolved.
### 5. Closure
After an issue is resolved and verified and the issue is closed on GitHub.

> [!NOTE]  
> The outcome of the triage may be shared on Discord annoucement channel (or a dedicated triage channel), highlighting: 
>   - Critical issues
>   - Outstanding actions
 

# <a name="releasing"></a> Releasing Identus
As per [README](./README.md), Identus is consisting of several core components that are validated as an ecosystem and a node and corresponding documentation. This section is describing the release process. The release manager is the owner of this process and is a chosen maintainer.

1. System release candidate
2. System-level testing and quality gates
3. System release note approval
4. Release finalization

## Step1 - System release candidate
When an ecosystem release is planned, each component should have a release candidate confirmed with the component owner: it thus shall have an existing `pre-release` release note for that component tag: if not, the release manager should ping the component owner to create the corresponding component release note.

### Individual component release 
Note that all components of Identus are released and tested independently. It means that each component has its own independent release cycle and versioning; Each component contains unit and integration tests to confirm that everything works as expected. This is possible because all components are designed to be backward compatible and are tested against the latest version of other components.

> [!NOTE]  
> When a new version of a component is released, it is automatically published to the registry (npm, GitHub, etc) and is ready to be used by other components.

### Ecosystem release candidate
It is then formed by the sum of the component release candidates and ready to be run under the system level tests. There are e2e tests that check the compatibility of the components with each other.

## Step2 - Quality Assurance (QA) validation

Quality Assurance should guarantee that all components versions are working properly within the released version on a pre-production environment (*the environment TBC if it is SIT*).

This process consists in:
- Adhoc and manual testing
- Running regression and e2e for all components
- Updating any regression test if required
- Adding the new scenarios to cover the newly added functionalities

**Running end-to-end tests:**

The SDKs e2e are the system level testing, which are the most important for the release.
- Using SIT environment
  - Check the environment is using the correct version (Cloud Agent, Mediator, Node)
  - Run the SDKs e2e tests
- Locally
  - Spin up the environment locally with the respective versions
  - Run the SDKs e2e tests

  If a bug is found, it will be submitted to the corresponding component after analyse and triaged (*Add triage section with labelling next TBD*). Only `Priority: critical` bug will prevent the release and restrictions will be added in the release note accordingly with a fix plan.
  When a fix is needed, the component release candidate will be updated to include the said fix and the QA validation can finally pass.

**Performance tests**
*This will be added in a later iteration of this process*

**Quick Start Guide execution:**
With the support of QA, one maintainer (*TBC until now, it was the QA enginner but it would be good that it is rolling assignment among maintainers team TBC*) will execute the Quick Start Guide manually following the steps with the versions of the components indicated by the release candidate. The outcome is the Quick Start Guide execution is succesfull and the document is updated with the new versioning.
*TBC: potentially a compatibility table is updated.*

## Step3 - Create the ecosystem release note and get it approved
For a release `vx.y`:
- In the Identus repo [hyperledger/identus](https://github.com/hyperledger/identus/), check the latest released version; it should be `Identus va.b` format. E.g `Identus v2.12`.
- Click on `Release` and `Draft a new release` button
   - In `Choose a tag` button, create the tag `vx.y`
   - Target = `main`
   - Previous tag `Auto`
- Click on `Generate change log`: this will generate the log for this repository only, which should be reviewed and also amended by each of the components release notes:
   - Amend the release note template (copied from the previous release if a template file is not existing yet).
   - For each component, add the change log according to each component (by default, it is the link to the component release, already available from the component release).
   - Once ready for review, select `Set as a pre-release` and click on `Save Draft`
- Ask component owner to review: this is the critical step. The release owner should get an approval from each of the component: Cloud Agent, Edge Agent SDK Swift, KMP, TS, Mediator, Node, Docs.
- Ask QA team to validate the release as per Step2 above.
- Once all have reviewed and approved (*see below options TBC*), publish the release by editing it and unselect `Set as a pre-release` and click on `Publish release` button: the release `Identus vx.y` should be seen as the `latest`; if not, check the reason and fix it.
- *Options to get the component owners approval TBC*:
    - *Option1: add a checkbox in the release note template and each component owners and the QA lead will check it if ok.*
    - *Option2: create a dedicated PR with the list of the component owners and QA lead are reviewers. The release note is approved when all the reviewers have approved the PR.*
    - Having the checkbox would help to add checklist, such as the Quick Start Guide is executed, compatibility table is updated, a security scanning (automatic or manual) at component level was executed, ...


## Step4 - Publish, deployment and announcement
### For components, section to be added 
### Documentation Website

- To deploy the documentation into production, 
  - Find the `portal version` of the Documentation Portal from the latest [release](https://github.com/hyperledger/identus/releases).
  - In atala-prism-docs repository, run the [workflow](https://github.com/input-output-hk/atala-prism-docs/actions/workflows/deployment.yml). 
  - To deploy it, click the `Run Workflow` button and set the `version to deploy` with the `portal version` and set the `Environment to trigger update on` value to `production`
  - Click the green button.
To check if the right version was deployed, go to the public site, [https://docs.atalaprism.io/](https://docs.atalaprism.io/), and check that the Agent API version is the one that is found in the [release](https://github.com/hyperledger/identus/releases) (the same file you used in the step 1).

### Announcement

Once the release entry has been approved, the ecosystem release may be announced by putting a message together (*template to be added TBC*) and shared via the different channels:

- **Discord Hyperledger** - `identus-maintainers` channel https://discord.com/channels/905194001349627914/1226983777687965707
- **Discord Hyperledger** - `identus-announcements` channel https://discord.com/channels/905194001349627914/1230596020790886490

