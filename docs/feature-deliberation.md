# dev Feature Deliberation

`dev` should become a terminal-native operating layer for moving from idea to restored workspace. The next features should strengthen three loops: create, reopen, and keep momentum.

## Near-Term Power

1. `dev workspace`
   - Reads `.devmeta.json`.
   - Shows editor, package manager, dev server, Linear status, git status, and restore readiness.
   - Lets the user edit workspace automation without opening config files.

2. `dev restore`
   - Starts the editor.
   - Runs the saved dev server.
   - Opens lazygit if available.
   - Prints a compact process dashboard.
   - Later emits Zellij layouts for Linux/WSL.

3. `dev linear`
   - Lists linked Linear projects.
   - Creates starter issues from templates.
   - Syncs `.devmeta.json` tags to Linear labels.
   - Offers a Kanban-first view of project momentum from the terminal.

4. `dev doctor`
   - Checks Node, package managers, git identity, editors, fzf, Linear auth, GitHub auth, Docker, WSL, and Zellij.
   - Gives exact fix commands where possible.

## Operating-System Layer

1. Workspace recipes
   - Store reusable recipes such as `frontend`, `api`, `saas`, `agent`, and `cli`.
   - Recipes define prompts, generator, postinstall steps, dev server command, Linear issue templates, and restore panes.

2. Session contracts
   - `.devmeta.json` should evolve from metadata into a declarative workspace contract.
   - Example fields: `processes`, `panes`, `envFiles`, `services`, `databases`, `kanban`, `commands`.

3. Project command palette
   - `dev open` should become fuzzy and action-oriented.
   - Selecting a project can open, restore, run tests, jump to Linear, view README, or launch git tools.

4. Terminal dashboard
   - A focused dashboard for active project state.
   - Keep it keyboard-first, dense, and fast: project health, tasks, git branch, running processes, and next command.

## Strong Product Direction

Prioritize workflow restoration before adding more scaffolds. Scaffolding is the front door, but the daily product value is returning to a fully alive workspace with no memory tax.

The ideal arc:

`dev start` creates the environment.
`dev open` finds it instantly.
`dev restore` brings it back to life.
`dev workspace` edits its operating contract.
`dev linear` keeps execution visible.

That is the shape of a terminal-native developer operating environment.
