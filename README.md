# @nx-squeezer

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer)

## Development

### New Library

Create new library with [local plugins](https://nx.dev/plugin-features/create-your-own-plugin#local-workspace-plugins):

```shell
nx g @nrwl/nx-plugin:plugin my-plugin --importPath @nx-squeezer/my-plugin
```

After that, run the following commands to add additional tooling:

```shell
npm run g -- eslint
npm run g -- codecov
```

### Running Local Generators

```shell
npm run g -- generator
```

> Workaround due to [Nx issue](https://github.com/nrwl/nx/issues/9823)

## Contributors

[![contributors](https://contrib.rocks/image?repo=nx-squeezer/squeezer)](https://github.com/nx-squeezer/squeezer/graphs/contributors)
