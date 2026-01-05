# pnpm Usage Guide

This project uses **pnpm** as the package manager for better performance, disk efficiency, and monorepo support.

## Installation

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Or using corepack (recommended):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Common Commands

### Install Dependencies

Install all dependencies for all workspaces:

```bash
pnpm install
```

### Add Packages

Add a package to a specific workspace:

```bash
# Add to backend
pnpm --filter squigglesync-backend add <package>

# Add to frontend
pnpm --filter squigglesync-frontend add <package>
```

Add a dev dependency:

```bash
pnpm --filter squigglesync-backend add -D <package>
```

### Run Scripts

Run scripts from the root (workspace scripts are available):

```bash
# Run dev script in backend
pnpm --filter squigglesync-backend run dev

# Run build script
pnpm --filter squigglesync-backend run build

# Run test script
pnpm --filter squigglesync-backend run test
```

Or navigate to the workspace directory and run:

```bash
cd squigglesync-backend
pnpm run dev
```

### Workspace Commands

Run commands in a specific workspace:

```bash
# Run any command in backend workspace
pnpm --filter squigglesync-backend <command>

# Run any command in frontend workspace
pnpm --filter squigglesync-frontend <command>
```

## Monorepo Structure

This project uses pnpm workspaces defined in `pnpm-workspace.yaml`:

- `squigglesync-backend` - WebSocket server
- `squigglesync-frontend` - Angular frontend (when added)

## Configuration

The project uses `.npmrc` with the following settings:

- `shamefully-hoist=true` - For IDE compatibility
- `auto-install-peers=true` - Automatically install peer dependencies

## Why pnpm?

- **Faster installs** - Uses hard links and content-addressable storage
- **Disk efficient** - Shares packages across projects
- **Strict dependency resolution** - Prevents phantom dependencies
- **Great monorepo support** - Built-in workspace management

