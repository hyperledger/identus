# Developer Certificate of Origin (DCO) and PGP Signatures

Identus requires all contributions to acknowledge the Developer Certificate of Origin (DCO) and be signed with a PGP key. These measures protect the project's integrity and ensure that everyone involved understands the code's origin and licensing.

## Table Of Contents
  - [DCO](#dco)
    - [How to sign-off](#how-to-sign-off)
    - [Setting up your signoff](#setting-up-your-signoff)
    - [How to amend a sign-off](#how-to-amend-a-sign-off)
    - [DCO Failures](#dco-failures)
  - [PGP Signatures](#pgp-signatures)
    - [Setting up PGP](#setting-up-pgp)
    - [Troubleshooting](#troubleshooting)


## DCO

The DCO is a way to confirm that you are able to submit your contribution to our repository under the license of the repository, and for the contribution to be redistributed under that same license. By adding a "Signed-off-by" line to your commit messages, you acknowledge the following:

```text
Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

### How to sign-off

Add a line like this to each commit message in your pull request:

```text
Signed-off-by: Your Legal Name <email-address>
``` 

The text can either be manually added to your commit body, or you can add either `-s` or `--signoff` to your usual git commit commands.

### Setting up your signoff

Git has a `-s | --signoff` command-line option to append this automatically to your commit message:

```bash
git commit --signoff --message 'This is my commit message'
```

```bash
git commit -s -m "This is my commit message"
```

This will use your default git configuration which is found in `.git/config` and usually, it is the `username systemaddress` of the machine which you are using.

To change this, you can use the following commands (Note these only change the current repo settings, you will need to add `--global` for these commands to change the installation default).

Your name:

```bash
git config user.name "FIRST_NAME LAST_NAME"
```

Your email:

```bash
git config user.email "MY_NAME@example.com"
```

### How to amend a sign-off

If you have authored a commit that is missing the signed-off-by line, you can amend your commits and push them to GitHub

```bash
git commit --amend --signoff
```

If you've pushed your changes to GitHub already you'll need to force push your branch after this with `git push -f`.

### DCO Failures

The project uses a DCO bot for all GitHub pulls to verify that each commit is signed off. When you create your pull request, it will automatically be verified by this bot. 

If your Pull Request fails the DCO check, it's necessary to fix the entire commit history in the PR. Although this is a situation we'd like to avoid the best practice is to squash the commit history to a single commit, append the DCO sign-off as described above or interactively in the rebase comment editing process, and force push. For example, if you have 2 commits in your history (Note the ~2):

```bash
git rebase --interactive HEAD~2
(interactive squash + DCO append)
git push origin --force
```

> Note, that in general rewriting history in this way is something that can cause issues with the review process and this should only be done to correct a DCO mistake.  

## PGP Signatures

PGP (Pretty Good Privacy) is a method for encrypting and signing data. By signing your commits with PGP, you add another layer of security and verification.

### Setting up PGP
1. Install gnupg
    * Linux: `sudo apt-get install gnupg`
    * Mac: `brew install gnupg`
    * Windows: Download and install gnupg for windows from [GnuPG website](https://gnupg.org/download/index.html)

2. Generating a key

    In case you've already generated your PGP key pair before, you need to import a private key
    ```bash
    gpg --import private.key
    ```
    If you have not generated your PGP key pair yet
    ```bash
    gpg --full-generate-key
    ```
    and follow the instructions, make sure to associate this key with your email address. For key size, choose 4096

3. Using the key

    * **Local setup**: Set up git to automatically sign every commit with your PGP key, first get your GPG key id
      ```bash
      gpg --list-keys
      ```
      will list all the keys you have available. copy the id of the key associated with your email address.
  
      configure git to use this key to sign every commit automatically
      ```bash
      git config user.signingkey <your key id here> && 
      git config commit.gpgsign true
      # in case you prefer to use another tool for pgp, like gpg2, you need to specify it here, otherwise ignore it.
      git config gpg.program gpg2
      ```

    * **Remote setup**: You need to add the public key to Github, so that it can verify commits signed by the associated private key. Export your public key:
      ```bash
      gpg --armor --export firstname.lastname@example.com
      ```
      This will output the key into your terminal. Copy the whole key (including -----BEGIN PGP PUBLIC KEY BLOCK----- and -----END PGP     PUBLIC KEY BLOCK----- part) and add it [into your account](https://github.com/settings/keys)
  
      *NOTE:* Make sure to add your email address into [your github account emails](https://github.com/settings/emails) and confirm it. Github will allow you to add public keys associated with any email, but if this email is not added into your emails, it assumes that you are not the owner of this email address, and even if commits are signed with a proper private key, they will not be verified.

### Troubleshooting

In case commiting a change fails with the message
```bash
error: gpg failed to sign the data
fatal: failed to write commit object
```
try the following
```bash
gpgconf --kill gpg-agent
export GPG_TTY=$(tty)
echo "test" | gpg --clearsign
```
if this problem keeps happening, try adding `export GPG_TTY=$(tty)` into your `~/.bashrc` or `~/.zshrc` file.
