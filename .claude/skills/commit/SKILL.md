---
name: commit
description: Copies the existing chat history into the `.prompts` folder, then makes a commit with it and the rest of the staged changes.
---

When making a commit:

1. Export the current conversation and save it to a file in the `.prompts` folder representing today's date (for example, 20260217.txt). Record the user's exact messages verbatim (not a summary). If the file already exists, do not override what's there, simply append.
2. Run the linter, make sure the files are formatted correctly.
3. Stage all relevant files for the commit.
4. Before committing, double check with the user the message you intend to use. Allow the user to specify a different message if desired.
5. Commit.
