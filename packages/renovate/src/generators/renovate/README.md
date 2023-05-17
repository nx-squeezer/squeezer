# @nx-squeezer/renovate:renovate

Setup command:

```shell
nx g @nx-squeezer/renovate:renovate
```

Shareable config preset for [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate). Angular and Nx dependencies require post upgrade tasks, then Renovate must be configured [self-hosted](https://docs.renovatebot.com/self-hosting/), an easy way to do it would be with [Github Action Renovate](https://github.com/renovatebot/github-action).

You can find an example configuration [here](https://github.com/nx-squeezer/squeezer/blob/main/renovate.config.js) and GitHub workflow [here](https://github.com/nx-squeezer/squeezer/blob/main/.github/workflows/renovate.yml).

For Nx projects it is recommended to use the default preset and Nx monorepo.

This schematic will:

- Configure Renovate to run self-hosted by creating a GitHub Workflow Action.
- Upgrade the CI workflow to run on Renovate branches.
- Add badge to `README.md`/.

Options:

- Force overwriting of configuration with `--force` (default `false`).
- Use [Nx Cloud](https://nx.app) `--useNxCloud` (default `true`).
- Use local presets `--local` (default `false`). This option is not recommended, instead it is better to rely on pointing to the configuration in the GitHub repo `nx-squeezer/squeezer` to always count with the latest version. Use local presets only if you want to customize them.
- Provide the assignee for Renovate PRs with `--assignee=github-user`.

Presets:

<details>
  <summary>Default Preset</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/default.json) includes all presets included in this repo except for [Nx](https://nx.dev/) and [Angular](https://angular.io/) workspaces, they have to be added manually:

```json
"extends": ["github>@nx-squeezer/squeezer"]
```

</details>

<details>
  <summary>Nx Monorepo</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/nxMonorepo.json) groups all dependencies related to [Nx](https://nx.dev/) and [Angular](https://angular.io/), including upgrade schematics:

```json
"extends": ["github>@nx-squeezer/squeezer:nxMonorepo"]
```

> It is incompatible with preset `"github>@nx-squeezer/squeezer:angularWorkspace"`, choose one or another.

</details>

<details>
  <summary>Angular Workspace</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/angularWorkspace.json) groups all dependencies related to [Angular](https://angular.io/), including upgrade schematics:

```json
"extends": ["github>@nx-squeezer/squeezer:angularWorkspace"]
```

> It is incompatible with preset `"github>@nx-squeezer/squeezer:nxMonorepo"`, choose one or another.

</details>

<details>
  <summary>Group All Non Major</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/groupAllNonMajor.json) groups all non-major npm dependencies, including `bump` dependencies:

```json
"extends": ["github>@nx-squeezer/squeezer:groupAllNonMajor"]
```

</details>

<details>
  <summary>Tooling</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/tooling.json) groups all dependencies related to linting and formatting:

```json
"extends": ["github>@nx-squeezer/squeezer:tooling"]
```

Examples:

- `chore(deps): :arrow_up: update dependency`
- `fix(deps): :lock: refresh package-lock.json`
- `fix(deps): :arrow_down: roll back dependency`

</details>

<details>
  <summary>GitHub Workflow Actions</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/githubActions.json) groups all dependencies related to Github actions:

```json
"extends": ["github>@nx-squeezer/squeezer:githubActions"]
```

</details>

<details>
  <summary>Gitmoji Conventional Commits</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/gitmoji.json) adds a :sparkles: gitmoji :sparkles: to the commit message:

```json
"extends": ["github>@nx-squeezer/squeezer:gitmoji"]
```

</details>

<details>
  <summary>NPM</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/npm.json) updates `node` and `npm` only to LTS versions.

```json
"extends": ["github>@nx-squeezer/squeezer:npm"]
```

</details>

<details>
  <summary>Maintenance</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/maintenance.json) configures maintenance of `package-lock.json` file as a separate PR.

```json
"extends": ["github>@nx-squeezer/squeezer:maintenance"]
```

</details>

<details>
  <summary>Widen Range for Library Dependencies</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/widenRangeLibraryDeps.json) causes Renovate to _not_ update libraries' `package.json`, only the root `package.json` will be updated for minor and patch versions. This has the purpose of keeping libraries with a wider compatibility range, within the last major version. This is the recommended configuration for library authors.

```json
"extends": ["github>@nx-squeezer/squeezer:widenRangeLibraryDeps"]
```

</details>
