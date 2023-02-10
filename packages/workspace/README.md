# @nx-squeezer/workspace <!-- omit in toc -->

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![Next](https://github.com/nx-squeezer/squeezer/actions/workflows/next.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/next.yml) [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/workspace/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/workspace) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/workspace/CHANGELOG.md) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer) ![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

Contributing and maintaining OSS projects can be boosted :rocket: through a set of tools :hammer: and processes :gear:. This package provides generators for [Nx](https://nx.dev) and [Angular](https://angular.io) to configure a variety of those tools with just a command, integrating without any friction with your existing repo.

## Setup <!-- omit in toc -->

```shell
npm install --save-dev @nx-squeezer/workspace
```

Recommended order to setup all the generators:

```shell
nx g @nx-squeezer/workspace:prettier
nx g @nx-squeezer/workspace:eslint
nx g @nx-squeezer/workspace:tsconfig
nx g @nx-squeezer/workspace:lint-staged
nx g @nx-squeezer/workspace:contributors
nx g @nx-squeezer/workspace:github-workflow
nx g @nx-squeezer/workspace:codecov
nx g @nx-squeezer/workspace:renovate
```

## Generators <!-- omit in toc -->

- [codecov](#codecov)
- [commitlint](#commitlint)
- [contributors](#contributors)
- [eslint](#eslint)
- [github-workflow](#github-workflow)
- [lint-staged](#lint-staged)
- [prettier](#prettier)
- [renovate](#renovate)
- [tsconfig](#tsconfig)

## [codecov](src/generators/codecov/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:codecov
```

Adds [`codecov`](https://docs.codecov.com/docs) to a project to have coverage information, including:

- Generating [configuration file `.codecov.yml`](https://docs.codecov.com/docs/codecov-yaml).
- Configures individual projects with `test` target to expose coverage information.
- Updates CI file to upload coverage report.
- Adds badge to README.md.

## [commitlint](src/generators/commitlint/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:commitlint
```

Uses [`commitlint`](https://github.com/conventional-changelog/commitlint) and [`husky`](https://github.com/typicode/husky) to lint commit messages to adhere to [conventional commits](https://www.conventionalcommits.org/). It uses the default configuration provided by [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional).

## [contributors](src/generators/contributors/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:contributors
```

Adds contributors attribution to `README.md` using [`contrib.rocks`](https://contrib.rocks/).

## [eslint](src/generators/eslint/README.md)

Setup command, which will prompt one by one the set of rules that can be added:

```shell
nx g @nx-squeezer/workspace:eslint
```

Adds a set of [ESLint](https://eslint.org/) rules to enhance code style in projects. Shipped as a generator instead of a [configuration package](https://eslint.org/docs/latest/user-guide/configuring/) so that it can be customized and edited by repo, and to automate the configuration of projects with TypeScript. Additionally, since it is an Nx plugin it can automatically apply upgrade changes if needed. The rules that it adds include:

- `eslint:recommended`
- `sonarjs/recommended`
- `unused-imports`
- `@typescript-eslint/recommended`
- `@delagen/deprecation`
- `import/recommended`

## [github-workflow](src/generators/github-workflow/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:github-workflow
```

Adds a [GitHub Action workflow](https://docs.github.com/en/actions/using-workflows) to automate the CI pipeline for your repo. It includes the following actions:

- Checkout.
- Setup Node.
- Install dependencies.
- Targets for `build`, `test`, `lint`, `e2e`.
- Configure `nx.json`.
- Workflow adapted to Nx workspaces.
- Add a badge to `README.md`.

Options:

- Force overwriting of workflow with `--force` (default `false`).
- Provide default branch with `--branch=master` (default `main`).
- Use [Nx Cloud](https://nx.app) `--useNxCloud` (default `true`).

## [lint-staged](src/generators/lint-staged/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:lint-staged
```

Uses [`lint-staged`](https://github.com/okonet/lint-staged[) and [`husky`](https://github.com/typicode/husky) to lint files when being committed to the repo.

## [prettier](src/generators/prettier/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:prettier
```

Updates [`prettier`](https://github.com/prettier/prettier) configuration with some defaults, and adds [`prettier/recommended`](https://github.com/prettier/eslint-plugin-prettier) rule to ESLint configuration.

## [renovate](src/generators/renovate/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:renovate
```

Shareable config preset for [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate). Angular and Nx dependencies require post upgrade tasks, then Renovate must be configured [self-hosted](https://docs.renovatebot.com/self-hosting/), an easy way to do it would be with [Github Action Renovate](https://github.com/renovatebot/github-action).

You can find an example configuration [here](https://github.com/nx-squeezer/squeezer/blob/main/renovate.config.js) and GitHub workflow [here](https://github.com/nx-squeezer/squeezer/blob/main/.github/workflows/renovate.yml).

For Nx projects it is recommended to use the default preset and Nrwl workspace.

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
  <summary>Nrwl Workspace</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/nrwlWorkspace.json) groups all dependencies related to [Nx](https://nx.dev/) and [Angular](https://angular.io/), including upgrade schematics:

```json
"extends": ["github>@nx-squeezer/squeezer:nrwlWorkspace"]
```

> It is incompatible with preset `"github>@nx-squeezer/squeezer:angularWorkspace"`, choose one or another.

</details>

<details>
  <summary>Angular Workspace</summary>

This [preset](https://github.com/nx-squeezer/squeezer/blob/main/angularWorkspace.json) groups all dependencies related to [Angular](https://angular.io/), including upgrade schematics:

```json
"extends": ["github>@nx-squeezer/squeezer:angularWorkspace"]
```

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

## [tsconfig](src/generators/tsconfig/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:tsconfig
```

Updates the `tsconfig.json` file adding a default configuration with stricter options enabled.

## Contributors <!-- omit in toc -->

[![contributors](https://contrib.rocks/image?repo=nx-squeezer/squeezer)](https://github.com/nx-squeezer/squeezer/graphs/contributors)
