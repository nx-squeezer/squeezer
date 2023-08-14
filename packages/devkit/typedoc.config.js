/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  ...require('../../typedoc.base'),
  name: '@nx-squeezer/devkit',
  entryPoints: ['./src/index.ts'],
  out: '../../docs/packages/devkit',
};
