# @nx-squeezer

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![Next](https://github.com/nx-squeezer/squeezer/actions/workflows/next.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/next.yml) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer) ![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-squeezer_squeezer&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=nx-squeezer_squeezer) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-squeezer_squeezer&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=nx-squeezer_squeezer) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=nx-squeezer_squeezer&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=nx-squeezer_squeezer) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=nx-squeezer_squeezer&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=nx-squeezer_squeezer)

Monorepo with many tools and packages for [Nx](https://nx.dev/) and [Angular](https://angular.io/) projects.

## Packages

### Libraries

| Package                                                                                            | Version                                                                                                                                                         | Links                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@nx-squeezer/ngx-async-injector`](https://www.npmjs.com/package/@nx-squeezer/ngx-async-injector) | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/ngx-async-injector/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/ngx-async-injector) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/ngx-async-injector/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/ngx-async-injector/CHANGELOG.md) |
| [`@nx-squeezer/ngx-forms`](https://www.npmjs.com/package/@nx-squeezer/ngx-forms)                   | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/ngx-forms/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/ngx-forms)                   | [![README](https://img.shields.io/badge/README--green.svg)](/packages/ngx-forms/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/ngx-forms/CHANGELOG.md)                   |
| [`@nx-squeezer/utils`](https://www.npmjs.com/package/@nx-squeezer/utils)                           | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/utils/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/utils)                           | [![README](https://img.shields.io/badge/README--green.svg)](/packages/utils/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/utils/CHANGELOG.md)                           |

### Tools

| Package                                                                          | Version                                                                                                                                       | Links                                                                                                                                                                                           |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@nx-squeezer/devkit`](https://www.npmjs.com/package/@nx-squeezer/devkit)       | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/devkit/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/devkit)       | [![README](https://img.shields.io/badge/README--green.svg)](/packages/devkit/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/devkit/CHANGELOG.md)       |
| [`@nx-squeezer/renovate`](https://www.npmjs.com/package/@nx-squeezer/renovate)   | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/renovate/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/renovate)   | [![README](https://img.shields.io/badge/README--green.svg)](/packages/renovate/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/renovate/CHANGELOG.md)   |
| [`@nx-squeezer/workspace`](https://www.npmjs.com/package/@nx-squeezer/workspace) | [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/workspace/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/workspace) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/workspace/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/workspace/CHANGELOG.md) |

## Development

### New Plugin Library

Create new library with [local plugins](https://nx.dev/plugin-features/create-your-own-plugin#local-workspace-plugins):

```shell
nx g @nx/plugin:plugin my-plugin --importPath @nx-squeezer/my-plugin
```

After that, run the following commands to add additional tooling:

```shell
npx nx g eslint
npx nx g codecov
```

### Running Local Generators

```shell
npx nx g <generator>
```

## Contributors

[![contributors](https://contrib.rocks/image?repo=nx-squeezer/squeezer)](https://github.com/nx-squeezer/squeezer/graphs/contributors)
