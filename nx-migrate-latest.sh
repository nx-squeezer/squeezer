#!/bin/bash
rm package-lock.json
rm -rf node_modules
npm install
npx nx migrate latest
npx nx migrate @angular/core@latest
npx nx migrate @angular/cli@latest
npx nx migrate @jscutlery/semver@latest
npx nx migrate ngx-deploy-npm@latest
npx nx migrate @enio.ai/typedoc@latest
npm install
npx nx migrate --run-migrations --if-exists
npm install
rm -f migrations.json
npx nx run-many --target=lint --all --parallel=3 --fix --skip-nx-cache
