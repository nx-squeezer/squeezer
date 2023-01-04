# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [1.1.0](https://github.com/nx-squeezer/squeezer/compare/workspace@1.0.2...workspace@1.1.0) (2023-01-04)


### Features

* **workspace:** :package: restore using dependencies ([5e3a610](https://github.com/nx-squeezer/squeezer/commit/5e3a6109649ed11ce6cf15bafa5aa157f76bbabe))
* **workspace:** :package: stop using peer dependencies ([#256](https://github.com/nx-squeezer/squeezer/issues/256)) ([97e37d6](https://github.com/nx-squeezer/squeezer/commit/97e37d60a7d32b30136853c60d37ad3cc2f96599)), closes [#255](https://github.com/nx-squeezer/squeezer/issues/255)


### Bug Fixes

* **deps:** ⬆️ update nrwl workspace to v15.4.4 ([#257](https://github.com/nx-squeezer/squeezer/issues/257)) ([1e1c6d2](https://github.com/nx-squeezer/squeezer/commit/1e1c6d26c8bc192574c047ed2bdf53b12b393c6e))

## [1.0.2](https://github.com/nx-squeezer/squeezer/compare/workspace@1.0.1...workspace@1.0.2) (2023-01-04)


### Bug Fixes

* **deps:** :arrow_up: update dependency renovate to v34.74.2 ([8af1f8b](https://github.com/nx-squeezer/squeezer/commit/8af1f8b7198863f20c98d43e4c9df2b617133ac1))
* **deps:** :arrow_up: update dependency renovate to v34.75.0 ([0bd435b](https://github.com/nx-squeezer/squeezer/commit/0bd435bdc70a1762a0cb74623a9a552c14853631))
* **deps:** :arrow_up: update dependency renovate to v34.76.0 ([c94e9ae](https://github.com/nx-squeezer/squeezer/commit/c94e9ae6bab432f08b91655e7eaa942e33d5da01))
* **workspace:** :bug: solve runtime issue when adding renovate ([#252](https://github.com/nx-squeezer/squeezer/issues/252)) ([#254](https://github.com/nx-squeezer/squeezer/issues/254)) ([889d376](https://github.com/nx-squeezer/squeezer/commit/889d376d6063563cb9519ebefca2dd03d01715f3))
* **workspace:** :bug: use bash script for renovate migrations ([#253](https://github.com/nx-squeezer/squeezer/issues/253)) ([c33b76a](https://github.com/nx-squeezer/squeezer/commit/c33b76a2aaac4be910cb9081400b38ca9ab0e75f))
* **workspace:** :bug: use npm script for migration script ([#250](https://github.com/nx-squeezer/squeezer/issues/250)) ([e302132](https://github.com/nx-squeezer/squeezer/commit/e302132e5d04e7d5b7a073e355eb8e0591c9d9aa))
* **workspace:** :bug: use path exists to allow failure in migrations on renovate ([#242](https://github.com/nx-squeezer/squeezer/issues/242)) ([4690a74](https://github.com/nx-squeezer/squeezer/commit/4690a74a86a6dacaa56950bf49ef1ada38e2f757))

## [1.0.1](https://github.com/nx-squeezer/squeezer/compare/workspace@1.0.0...workspace@1.0.1) (2022-12-30)


### Bug Fixes

* **renovate:** :bug: update command to run migrations ([#235](https://github.com/nx-squeezer/squeezer/issues/235)) ([fd29583](https://github.com/nx-squeezer/squeezer/commit/fd2958323f0e3b6f91470eb10b406114bbc543a0))
* **workspace:** :bug: use path-exists command to test if migrations exist ([cb00d30](https://github.com/nx-squeezer/squeezer/commit/cb00d3037f2352472a4f55404e9b61091404e993))
* **workspace:** :bug: workaround by allowing migration script to fail ([71e42ce](https://github.com/nx-squeezer/squeezer/commit/71e42ce4fcc8fa7b7c36fac207a3e9b56b48722a))

## [1.0.0](https://github.com/nx-squeezer/squeezer/compare/workspace@0.3.0...workspace@1.0.0) (2022-12-30)


### ⚠ BREAKING CHANGES

* **workspace:** first stable version

### Features

* **workspace:** :sparkles: first stable version ([ff41dbe](https://github.com/nx-squeezer/squeezer/commit/ff41dbe785f64993da3c8c30288c645b1962d09b))

## [0.3.0](https://github.com/nx-squeezer/squeezer/compare/workspace@0.2.1...workspace@0.3.0) (2022-12-30)


### Features

* **workspace:** :memo: add keywords to package.json ([047fe7a](https://github.com/nx-squeezer/squeezer/commit/047fe7a8a88b1feec1b81c698c6f1004e7c4c901))

## [0.2.1](https://github.com/nx-squeezer/squeezer/compare/workspace@0.2.0...workspace@0.2.1) (2022-12-30)


### Bug Fixes

* **workspace:** :package: deploy to npm ([1ee9f2d](https://github.com/nx-squeezer/squeezer/commit/1ee9f2d2740c89e8a1d6bc24a258691342ad21e4))

## [0.2.0](https://github.com/nx-squeezer/squeezer/compare/workspace@0.1.2...workspace@0.2.0) (2022-12-30)


### Features

* **workspace:** :sparkles: add stability days to renovate for npm updates ([#208](https://github.com/nx-squeezer/squeezer/issues/208)) ([a53d944](https://github.com/nx-squeezer/squeezer/commit/a53d944e3d7a6262d3f035605a8ad331e9a2461a))
* **workspace:** :sparkles: upgrade nrwl-nx-action to v ([#94](https://github.com/nx-squeezer/squeezer/issues/94)) ([21ef002](https://github.com/nx-squeezer/squeezer/commit/21ef002175dc38bf56f2f0a43c6f59243987f449))


### Bug Fixes

* **deps:** :arrow_up: update all non-major dependencies ([09eba7d](https://github.com/nx-squeezer/squeezer/commit/09eba7dd1a609d714b6d7114dd4a28e68263b292))
* **deps:** :arrow_up: update all non-major dependencies ([7b955c7](https://github.com/nx-squeezer/squeezer/commit/7b955c7793d77bd89d3ad6bbccd5aa8f6aa7b130))
* **deps:** :arrow_up: update dependency lint-staged to v13.1.0 ([82fe334](https://github.com/nx-squeezer/squeezer/commit/82fe334930577531c4e7cbcebb60cf5baa491125))
* **deps:** :arrow_up: update dependency renovate to v34.48.1 ([cf94bdf](https://github.com/nx-squeezer/squeezer/commit/cf94bdff26a7590b7b64cf0c7e62cc1871756e69))
* **deps:** :arrow_up: update dependency renovate to v34.48.2 ([a0bf3c8](https://github.com/nx-squeezer/squeezer/commit/a0bf3c858d0aeec05dc9dccdd82562a1bc197d4f))
* **deps:** :arrow_up: update dependency renovate to v34.48.3 ([eef673a](https://github.com/nx-squeezer/squeezer/commit/eef673ac5cbd5f73c3ceac64ea50e9fdf00a3c1c))
* **deps:** :arrow_up: update dependency renovate to v34.55.0 ([8fe14b9](https://github.com/nx-squeezer/squeezer/commit/8fe14b9335009e9b826e8844b6ca8c6997569f5a))
* **deps:** :arrow_up: update dependency renovate to v34.56.0 ([b408f48](https://github.com/nx-squeezer/squeezer/commit/b408f4823ea6e90f86a094a76b413a14403c1eee))
* **deps:** :arrow_up: update dependency renovate to v34.56.1 ([c83d98b](https://github.com/nx-squeezer/squeezer/commit/c83d98b49cc717d0959d7bdfc4e6de94aa91cbc5))
* **deps:** :arrow_up: update dependency renovate to v34.56.2 ([dd6b6a8](https://github.com/nx-squeezer/squeezer/commit/dd6b6a8d724698f40c250072ac04610736a07eec))
* **deps:** :arrow_up: update dependency renovate to v34.56.3 ([7c1e0cf](https://github.com/nx-squeezer/squeezer/commit/7c1e0cf93445b21401e9b287c9f0e21a49f6cf00))
* **deps:** :arrow_up: update dependency renovate to v34.57.0 ([89a76c1](https://github.com/nx-squeezer/squeezer/commit/89a76c182bd9d7d9ac9297b3073b9561b4a19ce2))
* **deps:** :arrow_up: update dependency renovate to v34.58.0 ([af53827](https://github.com/nx-squeezer/squeezer/commit/af53827ad8466137a30e7b07d2ba56037e3358f7))
* **workspace:** :bug: allow renovate migrations to fail ([#207](https://github.com/nx-squeezer/squeezer/issues/207)) ([7899395](https://github.com/nx-squeezer/squeezer/commit/7899395877a0b7551daee0068fb11dfdb7f21eb7)), closes [#197](https://github.com/nx-squeezer/squeezer/issues/197)

## [0.1.2](https://github.com/nx-squeezer/squeezer/compare/workspace@0.1.1...workspace@0.1.2) (2022-12-03)

### Bug Fixes

- **workspace:** bump patch version with docs ([98b16af](https://github.com/nx-squeezer/squeezer/commit/98b16aff4f04c8c697b0e045bb4ba9f646106a7d))

## [0.1.1](https://github.com/nx-squeezer/squeezer/compare/workspace@0.1.0...workspace@0.1.1) (2022-12-03)

### Bug Fixes

- **workspace:** :wrench: push files when releasing ([7954de9](https://github.com/nx-squeezer/squeezer/commit/7954de9aa1ce7c383a420a6644b4ff1f2a68fb2a))
