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
It is recommended to apply appropriate labels such as "out of scope", "can't repro", "duplicate", "stale" or "won't-fix" to closed issues. This aids in tracking and analysis.

# <a name="triage"></a> Triage process and labels
Main part of adding and updating labels is done through the triage process by a triage team or the implementation team, which are both part of maintainers. This is to making sure an issue is at an acceptable level (description, clarity) before it is assigned to be analysed.
In Identus, we are aiming that all the components are using same labels to bring convenience in review and coherence. This is not an easy path and will necessit education within the maintainers community. 
A dedicated triage call might be set with defined maintainers to get the triage kicked off and thus momentum will be gained.

Labels are categorised with a prefix that will help showing the info in the same order on a labeled issue:
- `triage`: this gives the action requested from the triage team. It will help to filter during the triage
- `type`: to be able to filter issues between type (e.g: bug, enhancement)
- `priority`: to give the priority of the issue
- `team`: to indicate which team will first analyse the issue; once analysed, the issue will be triaged anew with `component`, `triage`, `status` labels.
- `component`: the team will set this label once the issue is analysed, to indicate which components are impacted
- `status`: the team may use this label to give visibility on the progress on the issue resolution

Color code will be used to highlight in a similar way same type of label. E.g: red cor a critical issue. And one type might be always with the same color.

High level triage process:
- Triage committee should consist of at least a tech lead, a product owner, the maintainer chairman. Others can be invited: QA lead, DevOps lead.
- In a dedicated regular (weekly at least) call, the triage committee is reviewing the open issues in each of the Identus components related repositories and updating the labels `triage`, `type`, `priority`, `team` (see below table) and add comment to explain triage decision as see fit. At the discretion of the triage team, some part of the triage might be executed in asynchronous way. It is also taking a decision on the issues that are not progressing or lacking of interest. But above all, it is alerting and making sure the critical issues are prioritised to the community interest.
- The assigned `team` is usually updating those types: `status`, `component` and update the assignee.
- The outcome of the triage should be shared on Discord annoucement channel (or a dedicated triage channel), highlighting: 
   - Critical issues
   - Outstanding actions
- In a repo, the triage committee will:
 - Review the open issues that are without any label first
 - From the newest to the oldest
 
The labels that are defined and additional process details are precised in the following table:
| Label              | Description                                                                | Additional process                   | Notes               |
|--------------------|----------------------------------------------------------------------------|--------------------------------------|---------------------|
| triage:needs-repro | Indicates that a bug description is lacking steps to reproduce             | Assignee = the reporter of the issue | |
| triage:needs-fix | This confirms that the bug is ready to be analysed further by the maintainer | `Team` label is updated to the team that is assigned to fix. `Assignee` is set to the team's lead (then the team's lead will assign further) |
| triage:stale | For issues that are seen once or have no paradigm to reproduce. The triage will then decide what action to do in order to progress. For example, asking the community on Discord if similar issue was seen, or asking QA `team` to make dedicated tests to reproduce. This defect is under monitoring and after a few (four) weeks, the triage team will decide and update the comment and status according to the result | Triage team add a comment to describe the next steps to the `Team` label and `Assignee` is set. Label `status:terminated` might be used if decision is to close the issue. |
| triage:good-first-issue/up-for-grabs | This indicates to the community that this issue would be a good candidate to start with. No next step. |
| triage:help-wanted | The issue will not be taken in priority and maintainers are requested contributors to join and work on this issue |
| triage:query | Maintainer is requesting for additional info for the issue in order to continue issue analysis and fixing |
| triage:tech-debt | This issue is to be treated as technical debt |
| triage:rejected | For a `Type:bug`, it indicates the issue is not a bug. If the triage team confirms it is not a bug, then the Label `Status` is changed to Terminated |
| triage:can’t-repro | It indicates the issue cannot be reproduced. 
| triage:duplicate | Indicates the issue is a duplicate of an existing issue. If the triage team confirms it is duplicate, then the Label `Status` is changed to Terminated |
| triage:won’t-fix | the decision is to accept the issue as is and not to work on this issue |
| triage:out-of-scope | See design limitation |
| triage:design-limitation| Indicates the implementation is following the specification or an existing ADR (to be referred in the analyse) and awaiting confirmation by triage. If the triage team confirms it is design limitation, then the label `Status` is changed to Terminated |
| type:bug | For a defect found, it shall follow the template 'Bug report' |
| type:docs | For a change or issue only related to documentation |
| type:enhancement | For a new feature or an improvement of an existing feature. It shall follow the template 'Feature request' |
| type:support | The reporter is asking for support from maintainers more than anything else |
| type:research | The scope of this ticket needs to involve reasearch (cryptographic mainly) |
| type:roadmap | This issue will appear in the project roadmap https://github.com/orgs/hyperledger/projects/48 |
| type:backlog | List of tasks that is not on the roadmap and there isn’t any immediate plan to work on them |
| type:build | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm) |
| type:chore | This is to indicate the issue is for a release delivery for the ecosystem or a component release |
| type:ci | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| type:refactor | This will mark an issue that neither fixes a bug nor adds a feature. It could also linked to the style and do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) |
| type:perf | An issue mentioning a degradation in performance for a component or the whole ecosystem |
| type:test | Adding missing tests or correcting existing tests. This could be for a unit test, an integration test, a validation test |
| priority:critical | business is impacted, performance drained, crash, feature blocked, reproducible, interoperability, regulation, standard |
| priority:major | feature is working but some use cases, feature is not stable, regression, frequently seen, reproducible |
| priority:normal | feature is working but some use cases, frequently seen, UX |
| priority:minor | no impact on the feature, not reproducible, one time seen, UI |
| team:triage | The issues marked with this will be reviewed in a dedicated call by the triage team. The call could be the maintainers call or a specific triage call. |
| team:product | To be analysed by the product owners |
| team:dev | To be analysed by the engineering team |
| team:management | For issues that are not technical, product related. E.g: process, delivery, operational |
| team:support-L3 | This is L3 team that should filter the issue. It can be the triage team to tart with if the structure is not in place. |
| team:qa-validation | The solution is to be validated by the testing team |
| team:security | The Security team will be responsible to analyse this ticket |
| team:devops | The DevOps/SRE team will be responsible to analyse this ticket |
| component:cloud-agent | After analyse by the `team`, the Cloud Agent is impacted by this issue |
| component:mediator | After analyse by the `team`, the Mediator is impacted by this issue |
| component:SDK-swift | After analyse by the `team`, the SDK Swift is impacted by this issue |
| component:SDK-KMP | After analyse by the `team`, the SDK KMP is impacted by this issue |
| component:SDK-TS | After analyse by the `team`, the SDK TS is impacted by this issue |
| component:node | After analyse by the `team`, the Node is impacted by this issue |
| component:crypto-lib | After analyse by the `team`, the Cryptographic library is impacted by this issue |
| component:infra | After analyse by the `team`, the Infrastructure is impacted by this issue |
| status:new | Default status added when a new issue is submitted; it has not yet been triaged | optional |
| status:in-review | The issue is under analyse by the Assignee of the labelled Team | |
| status:analysed | The issue is analysed with a proposed solution | |
| status:in-progress | Assignee is fixing the issue | |
| status:fixed | Indicates the issue is fixed | |
| status:qa-ready | The issue is ready for retest by quality team | |
| status:qa-progress | The issue is being tested | |
| status:qa-support | To indicate quality team needs support, such as a pair testing or a mob session with the reporter |
| status:suspended | To propose the issue is not fixed in the upcoming release and will be revised to a later stage (e.g: maintenance release) |
| status:terminated | The fixed issue is confirmed by the quality team as fixed or else if `triage` label indicates else |
| status:reopen | QA team found the solution to the issue is not OK and it needs to be re-investigated |

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

