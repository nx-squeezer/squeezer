# @nx-squeezer

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer)

## Development

### New Library

Create new library with [local plugins](https://nx.dev/plugin-features/create-your-own-plugin#local-workspace-plugins):

```shell
nx g @nrwl/nx-plugin:plugin my-plugin --importPath @nx-squeezer/my-plugin
```

### Running Local Generators


```shell
npm run g -- generator
```

> Workaround due to [Nx issue](https://github.com/nrwl/nx/issues/9823)
