/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  ...require('../../typedoc.base'),
  name: 'nx-squeezer/utils',
  entryPoints: ['./src/index.ts'],
  out: '../../docs/packages/utils',
};
