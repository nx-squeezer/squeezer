# @nx-squeezer/workspace <!-- omit in toc -->

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/workspace/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/workspace) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](https://github.com/nx-squeezer/squeezer/blob/main/packages/workspace/CHANGELOG.md) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer) ![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

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
```

## Generators <!-- omit in toc -->

- [codecov](#codecov)
- [commitlint](#commitlint)
- [contributors](#contributors)
- [eslint](#eslint)
- [github-workflow](#github-workflow)
- [lint-staged](#lint-staged)
- [prettier](#prettier)
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
- `deprecation`
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

## [tsconfig](src/generators/tsconfig/README.md)

Setup command:

```shell
nx g @nx-squeezer/workspace:tsconfig
```

Updates the `tsconfig.json` file adding a default configuration with stricter options enabled.

## Contributors <!-- omit in toc -->

[![contributors](https://contrib.rocks/image?repo=nx-squeezer/squeezer)](https://github.com/nx-squeezer/squeezer/graphs/contributors)
